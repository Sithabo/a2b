import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { StatusActor } from '@a2b/core'
import Fleet from '#models/fleet'
import type Load from '#models/load'
import type User from '#models/user'

/** Statuses at which the carrier may see exact addresses and contacts (escrow funded). */
const CARRIER_LOCATION_STATUSES = new Set(['SECURED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'])

export async function fleetOwnedBy(user: User, client?: TransactionClientContract) {
  if (user.role !== 'fleet_owner') return null
  return Fleet.query({ client }).where('owner_id', user.id).first()
}

/**
 * The role `user` plays on this load, or null if they have no part in it.
 * Drives both authorization and which status transitions they may trigger.
 */
export async function actorFor(
  load: Load,
  user: User,
  client?: TransactionClientContract
): Promise<StatusActor | null> {
  if (load.shipperId === user.id) return 'shipper'
  if (load.driverId === user.id) return 'driver'
  if (load.fleetId) {
    const fleet = await fleetOwnedBy(user, client)
    if (fleet?.id === load.fleetId) return 'fleet_owner'
  }
  return null
}

/** Shippers see their own loads; carriers see open loads in their market and loads they carry. */
export async function canView(load: Load, user: User) {
  if (await actorFor(load, user)) return true
  const isCarrier = user.role === 'driver' || user.role === 'fleet_owner'
  return isCarrier && load.status === 'OPEN' && load.market === user.market
}

export async function canSeeLocation(load: Load, user: User) {
  const actor = await actorFor(load, user)
  if (actor === 'shipper') return true
  return actor !== null && CARRIER_LOCATION_STATUSES.has(load.status)
}
