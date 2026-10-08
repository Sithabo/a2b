import { randomInt } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import { getMarket } from '@a2b/core'
import Escrow from '#models/escrow'
import PaymentTransaction from '#models/payment_transaction'
import User from '#models/user'
import DriverProfile from '#models/driver_profile'
import type Load from '#models/load'
import DomainError from '#exceptions/domain_error'
import { actorFor } from '#services/load_access'
import { lockLoad, transition } from '#services/load_lifecycle'
import { payments } from '#services/payments/index'
import type { PaymentMethod } from '#services/payments/payment_driver'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

const RELEASE_CODE_TTL_MINUTES = 10
const MAX_RELEASE_ATTEMPTS = 5

async function escrowFor(load: Load, trx: TransactionClientContract) {
  const escrow = await Escrow.query({ client: trx }).where('load_id', load.id).forUpdate().first()
  if (!escrow) throw DomainError.conflict('This load has no escrow yet', 'E_NO_ESCROW')
  return escrow
}

function assertMethodAvailable(load: Load, method: PaymentMethod) {
  const market = getMarket(load.market)
  if (method !== 'card' && !market.mobileMoney.some((p) => p.id === method)) {
    throw DomainError.invalid(
      `${method.toUpperCase()} is not available in ${market.name}`,
      'E_METHOD_UNAVAILABLE'
    )
  }
}

/**
 * Shipper funds the escrow for a MATCHED load. On success the load becomes
 * SECURED and the carrier can see pickup details.
 */
export async function depositEscrow(shipper: User, loadId: number, method: PaymentMethod) {
  return db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    if ((await actorFor(load, shipper, trx)) !== 'shipper') throw DomainError.forbidden()
    if (load.status !== 'MATCHED')
      throw DomainError.conflict('Only matched loads can be funded', 'E_INVALID_TRANSITION')
    assertMethodAvailable(load, method)

    const escrow = await escrowFor(load, trx)
    if (escrow.status !== 'AWAITING_DEPOSIT')
      throw DomainError.conflict('Escrow is already funded', 'E_ALREADY_FUNDED')

    const result = await payments.collect({
      reference: `${load.reference}-DEP`,
      amount: escrow.amount,
      currency: escrow.currency,
      method,
      phone: shipper.phone,
    })
    await PaymentTransaction.create(
      {
        escrowId: escrow.id,
        kind: 'DEPOSIT',
        provider: payments.name,
        method,
        providerRef: result.providerRef,
        amount: escrow.amount,
        currency: escrow.currency,
        status: result.status,
        raw: result.raw ?? null,
      },
      { client: trx }
    )

    escrow.useTransaction(trx)
    escrow.depositMethod = method
    if (result.status === 'FAILED') {
      await escrow.save()
      throw DomainError.invalid('The payment was declined. Try another method.', 'E_PAYMENT_FAILED')
    }
    if (result.status === 'PENDING') {
      // Real providers confirm by webhook; the load stays MATCHED until then.
      await escrow.save()
      return { load, escrow }
    }

    escrow.status = 'HELD'
    escrow.heldAt = DateTime.now()
    await escrow.save()
    await transition(load, 'SECURED', { actor: 'system', note: `Escrow funded via ${method}` }, trx)
    return { load, escrow }
  })
}

/**
 * Shipper generates the 6-digit code they hand to the driver after inspecting
 * the cargo. Only a hash is stored; generating a new code replaces the old one.
 */
export async function issueReleaseCode(shipper: User, loadId: number) {
  return db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    if ((await actorFor(load, shipper, trx)) !== 'shipper') throw DomainError.forbidden()
    if (load.status !== 'IN_TRANSIT' && load.status !== 'DELIVERED') {
      throw DomainError.conflict(
        'A release code is available once the cargo is on its way',
        'E_INVALID_TRANSITION'
      )
    }
    const escrow = await escrowFor(load, trx)
    if (escrow.status !== 'HELD')
      throw DomainError.conflict('Escrow is not holding funds', 'E_NOT_HELD')

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
    const expiresAt = DateTime.now().plus({ minutes: RELEASE_CODE_TTL_MINUTES })
    escrow.useTransaction(trx)
    escrow.merge({
      releaseCodeHash: await hash.make(code),
      releaseCodeExpiresAt: expiresAt,
      releaseAttempts: 0,
    })
    await escrow.save()
    return { code, expiresAt }
  })
}

/**
 * Driver enters the shipper's code at delivery. A correct code pays the carrier
 * and completes the load (DELIVERED → COMPLETED).
 */
export async function releaseEscrow(driver: User, loadId: number, code: string) {
  // Wrong-attempt counting must persist even though the request fails, so it
  // can't share the transaction that would roll back on the thrown error.
  const outcome = await db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    if ((await actorFor(load, driver, trx)) !== 'driver') throw DomainError.forbidden()
    if (load.status !== 'DELIVERED')
      throw DomainError.conflict('Confirm arrival before releasing payment', 'E_INVALID_TRANSITION')

    const escrow = await escrowFor(load, trx)
    escrow.useTransaction(trx)
    if (escrow.status !== 'HELD' || !escrow.releaseCodeHash || !escrow.releaseCodeExpiresAt) {
      throw DomainError.conflict('Ask the shipper to generate a release code', 'E_NO_RELEASE_CODE')
    }
    if (escrow.releaseCodeExpiresAt < DateTime.now()) {
      throw DomainError.invalid(
        'This code has expired. Ask the shipper for a new one.',
        'E_CODE_EXPIRED'
      )
    }
    if (escrow.releaseAttempts >= MAX_RELEASE_ATTEMPTS) {
      throw DomainError.tooMany('Too many wrong codes. Ask the shipper for a new one.')
    }
    if (!(await hash.verify(escrow.releaseCodeHash, code))) {
      escrow.releaseAttempts += 1
      await escrow.save()
      return { ok: false as const }
    }

    // Pay the carrier: the fleet owner's account for fleet loads, else the driver.
    const payee = load.fleetId
      ? await User.query({ client: trx })
          .whereIn('id', (q) => q.from('fleets').select('owner_id').where('id', load.fleetId!))
          .firstOrFail()
      : driver
    const result = await payments.payout({
      reference: `${load.reference}-PAY`,
      amount: escrow.amount,
      currency: escrow.currency,
      method: (escrow.depositMethod as PaymentMethod) ?? 'card',
      phone: payee.phone,
    })
    await PaymentTransaction.create(
      {
        escrowId: escrow.id,
        kind: 'PAYOUT',
        provider: payments.name,
        method: escrow.depositMethod ?? 'card',
        providerRef: result.providerRef,
        amount: escrow.amount,
        currency: escrow.currency,
        status: result.status,
        raw: result.raw ?? null,
      },
      { client: trx }
    )
    if (result.status === 'FAILED')
      throw DomainError.conflict('Payout failed. Support has been notified.', 'E_PAYOUT_FAILED')

    escrow.merge({
      status: 'RELEASED',
      releasedAt: DateTime.now(),
      releaseCodeHash: null,
      releaseCodeExpiresAt: null,
    })
    await escrow.save()
    await transition(
      load,
      'COMPLETED',
      { actor: 'driver', actorId: driver.id, note: 'Release code accepted' },
      trx
    )
    await DriverProfile.query({ client: trx })
      .where('user_id', driver.id)
      .increment('completed_trips', 1)
    return { ok: true as const, load, escrow }
  })

  if (!outcome.ok) throw DomainError.invalid('That code is not correct', 'E_CODE_INVALID')
  return outcome
}
