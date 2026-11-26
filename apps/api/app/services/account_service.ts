import db from '@adonisjs/lucid/services/db'
import drive from '@adonisjs/drive/services/main'
import logger from '@adonisjs/core/services/logger'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { LoadStatus } from '@a2b/core'
import User from '#models/user'
import Load from '#models/load'
import DomainError from '#exceptions/domain_error'
import { lockLoad, transition } from '#services/load_lifecycle'

/** A carrier is attached or money is moving: the account must wait until these finish. */
const ACTIVE_STATUSES: LoadStatus[] = ['MATCHED', 'SECURED', 'IN_TRANSIT', 'DELIVERED']
/** Nothing has happened yet: deleting the account simply cancels these. */
const UNSTARTED_STATUSES: LoadStatus[] = ['DRAFT', 'OPEN']

/** Postgres foreign_key_violation: some table still points at the user. */
const FOREIGN_KEY_VIOLATION = '23503'

/** Rows the user's own loads, deliveries, documents or fleet history depend on. */
async function hasHistory(user: User, trx: TransactionClientContract) {
  const checks = [
    trx.from('loads').where('shipper_id', user.id).orWhere('driver_id', user.id),
    trx.from('fleets').where('owner_id', user.id),
    trx.from('vehicles').where('owner_user_id', user.id),
    trx.from('load_documents').where('uploaded_by', user.id),
    trx.from('load_deliveries').where('delivered_by', user.id),
  ]
  // One at a time: a transaction's connection runs a single query at once
  for (const query of checks) {
    if (await query.first()) return true
  }
  return false
}

/**
 * Deletes the signed-in user's account (App Store guideline 5.1.1(v)).
 *
 * - Refused while the user has a load with a carrier attached or money in
 *   escrow, as shipper, driver or fleet owner: those must finish or be
 *   cancelled first.
 * - Their unstarted loads (draft / on the board) are cancelled.
 * - Profiles, driver documents, fleet membership, invites and tokens go.
 * - With no shipment history the user row is deleted outright. Otherwise it is
 *   anonymised (name, email, photo and phone wiped) so finished loads and
 *   escrow records keep pointing at a now-anonymous account. The phone is
 *   freed, so the same number can sign up again as a new account.
 */
export async function deleteAccount(user: User) {
  const fileKeys = await db.transaction(async (trx) => {
    const locked = await User.query({ client: trx }).where('id', user.id).forUpdate().firstOrFail()
    const fleets = await trx.from('fleets').where('owner_id', locked.id).select('id')
    const fleetIds: number[] = fleets.map((row) => row.id)

    const active = await Load.query({ client: trx })
      .whereIn('status', ACTIVE_STATUSES)
      .where((query) => {
        query.where('shipper_id', locked.id).orWhere('driver_id', locked.id)
        if (fleetIds.length) query.orWhereIn('fleet_id', fleetIds)
      })
      .first()
    if (active) {
      throw DomainError.conflict(
        `Shipment ${active.reference} is still in progress. Finish or cancel it before deleting your account.`,
        'E_ACCOUNT_HAS_ACTIVE_LOADS'
      )
    }

    const unstarted = await Load.query({ client: trx })
      .where('shipper_id', locked.id)
      .whereIn('status', UNSTARTED_STATUSES)
      .select('id')
    for (const { id } of unstarted) {
      const load = await lockLoad(id, trx)
      await transition(
        load,
        'CANCELLED',
        { actor: 'shipper', actorId: locked.id, note: 'Shipper deleted their account' },
        trx
      )
    }

    const documents = await trx
      .from('driver_documents')
      .where('driver_id', locked.id)
      .select('file_key')
    const keys: string[] = documents.map((row) => row.file_key)
    if (locked.avatarKey) keys.push(locked.avatarKey)

    // Personal data and memberships, whichever way the user row goes
    await trx.from('driver_documents').where('driver_id', locked.id).delete()
    await trx.from('driver_reviews').where('driver_id', locked.id).delete()
    await trx.from('driver_profiles').where('user_id', locked.id).delete()
    await trx.from('shipper_profiles').where('user_id', locked.id).delete()
    await trx.from('fleet_invites').where('driver_id', locked.id).delete()
    await trx
      .from('vehicles')
      .where('assigned_driver_id', locked.id)
      .update({ assigned_driver_id: null })
    if (fleetIds.length) {
      // The fleet and its trucks stay for load history; its drivers are released
      await trx.from('fleet_invites').whereIn('fleet_id', fleetIds).delete()
      await trx.from('driver_profiles').whereIn('fleet_id', fleetIds).update({ fleet_id: null })
      await trx.from('vehicles').whereIn('fleet_id', fleetIds).update({ assigned_driver_id: null })
    }
    await trx.from('auth_access_tokens').where('tokenable_id', locked.id).delete()
    await trx.from('phone_otps').where('phone', locked.phone).delete()

    let deleted = false
    if (!(await hasHistory(locked, trx))) {
      // A table we didn't think of may still point here; fall back to anonymising
      const savepoint = await trx.transaction()
      try {
        await savepoint.from('users').where('id', locked.id).delete()
        await savepoint.commit()
        deleted = true
      } catch (error) {
        await savepoint.rollback()
        if ((error as { code?: string }).code !== FOREIGN_KEY_VIOLATION) throw error
      }
    }
    if (!deleted) {
      locked.useTransaction(trx)
      locked.merge({
        phone: `deleted:${locked.id}`,
        fullName: null,
        email: null,
        avatarKey: null,
        phoneVerifiedAt: null,
      })
      await locked.save()
    }
    return keys
  })

  // Files can't be rolled back, so they go once the database change is committed
  for (const key of fileKeys) {
    await drive
      .use()
      .delete(key)
      .catch((error) => logger.error({ err: error, key }, '[account] file not deleted'))
  }
}
