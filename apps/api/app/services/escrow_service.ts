import { randomBytes, randomInt } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import logger from '@adonisjs/core/services/logger'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import {
  getMarket,
  isPaymentMethodAvailable,
  paymentMethods,
  type PaymentKind,
  type StatusActor,
} from '@a2b/core'
import Escrow from '#models/escrow'
import PaymentTransaction from '#models/payment_transaction'
import User from '#models/user'
import DriverProfile from '#models/driver_profile'
import type Load from '#models/load'
import DomainError from '#exceptions/domain_error'
import { actorFor } from '#services/load_access'
import { lockLoad, transition } from '#services/load_lifecycle'
import { payments } from '#services/payments/index'
import type { PaymentMethod, PaymentResult } from '#services/payments/payment_driver'

const RELEASE_CODE_TTL_MINUTES = 10
const MAX_RELEASE_ATTEMPTS = 5

/*
|--------------------------------------------------------------------------
| How money moves
|--------------------------------------------------------------------------
|
| Every provider call (deposit, payout, refund) is a PaymentTransaction:
|
|   1. In a transaction, check the rules and insert the PENDING row with our
|      own unique reference. Commit, releasing the row locks.
|   2. Call the provider, with no database locks held.
|   3. Apply the result with `settleTransaction`, which is idempotent.
|
| Providers that answer later send a webhook, which lands in the same
| `settleTransaction`, so the synchronous and asynchronous paths can't drift.
|
*/

/** The load's live escrow, locked. */
async function liveEscrow(loadId: number, trx: TransactionClientContract) {
  const escrow = await Escrow.query({ client: trx })
    .where('load_id', loadId)
    .whereNot('status', 'VOID')
    .forUpdate()
    .first()
  if (!escrow) throw DomainError.conflict('This load has no escrow yet', 'E_NO_ESCROW')
  return escrow
}

async function hasPending(escrow: Escrow, kind: PaymentKind, trx: TransactionClientContract) {
  const pending = await PaymentTransaction.query({ client: trx })
    .where('escrow_id', escrow.id)
    .where('kind', kind)
    .where('status', 'PENDING')
    .first()
  return !!pending
}

async function assertNoPending(escrow: Escrow, kind: PaymentKind, trx: TransactionClientContract) {
  if (await hasPending(escrow, kind, trx)) {
    throw DomainError.conflict(
      'A payment for this load is still being confirmed. Try again in a moment.',
      'E_PAYMENT_PENDING'
    )
  }
}

function openTransaction(
  load: Load,
  escrow: Escrow,
  kind: PaymentKind,
  method: PaymentMethod,
  trx: TransactionClientContract
) {
  return PaymentTransaction.create(
    {
      escrowId: escrow.id,
      kind,
      provider: payments.name,
      method,
      providerRef: null,
      // Unique per attempt, so a provider never mistakes a retry for a duplicate
      reference: `${load.reference}-${kind.slice(0, 3)}-${randomBytes(3).toString('hex').toUpperCase()}`,
      amount: escrow.amount,
      currency: escrow.currency,
      status: 'PENDING',
      raw: null,
    },
    { client: trx }
  )
}

/** Calls the provider; a thrown error leaves the transaction PENDING for its webhook (or support). */
async function callProvider(payment: PaymentTransaction, call: () => Promise<PaymentResult>) {
  try {
    return await call()
  } catch (error) {
    logger.error({ err: error, reference: payment.reference }, 'payment provider call failed')
    return null
  }
}

export interface SettledBy {
  actor: StatusActor
  actorId?: number | null
}

/**
 * Applies a provider's result to its transaction, then to the escrow and the
 * load. Idempotent: a transaction that's already settled is left alone, so a
 * webhook retry (or a webhook racing the provider's direct response) is safe.
 */
export async function settleTransaction(
  transactionId: number,
  result: Pick<PaymentResult, 'status' | 'providerRef' | 'raw'>,
  by: SettledBy = { actor: 'system' }
) {
  return db.transaction(async (trx) => {
    const payment = await PaymentTransaction.query({ client: trx })
      .where('id', transactionId)
      .forUpdate()
      .firstOrFail()
    if (payment.status !== 'PENDING') return payment

    payment.useTransaction(trx)
    payment.merge({
      status: result.status,
      providerRef: result.providerRef || payment.providerRef,
      raw: result.raw ?? payment.raw,
    })
    await payment.save()
    if (payment.status === 'PENDING') return payment

    const { loadId } = await Escrow.query({ client: trx })
      .where('id', payment.escrowId)
      .firstOrFail()
    const load = await lockLoad(loadId, trx)
    const escrow = await Escrow.query({ client: trx })
      .where('id', payment.escrowId)
      .forUpdate()
      .firstOrFail()
    escrow.useTransaction(trx)

    if (payment.status === 'FAILED') {
      if (payment.kind !== 'DEPOSIT')
        logger.error({ reference: payment.reference }, `${payment.kind} failed; needs support`)
      return payment
    }

    switch (payment.kind) {
      case 'DEPOSIT':
        if (escrow.status !== 'AWAITING_DEPOSIT') break
        escrow.merge({ status: 'HELD', heldAt: DateTime.now(), depositMethod: payment.method })
        await escrow.save()
        if (load.status === 'MATCHED') {
          await transition(
            load,
            'SECURED',
            { actor: 'system', note: `Escrow funded via ${paymentMethods[payment.method].label}` },
            trx
          )
        } else {
          // Expiry and cancellation wait for pending deposits, so this shouldn't happen
          logger.error(
            { reference: payment.reference, status: load.status },
            'deposit settled on a load that is no longer matched'
          )
        }
        break

      case 'PAYOUT':
        if (escrow.status !== 'HELD') break
        escrow.merge({
          status: 'RELEASED',
          releasedAt: DateTime.now(),
          releaseCodeHash: null,
          releaseCodeExpiresAt: null,
        })
        await escrow.save()
        if (load.status === 'DELIVERED') {
          await transition(
            load,
            'COMPLETED',
            { ...by, note: 'Payment released to the carrier' },
            trx
          )
          if (load.driverId) {
            await DriverProfile.query({ client: trx })
              .where('user_id', load.driverId)
              .increment('completed_trips', 1)
          }
        }
        break

      case 'REFUND':
        if (escrow.status !== 'HELD') break
        escrow.merge({ status: 'REFUNDED', refundedAt: DateTime.now() })
        await escrow.save()
        break
    }
    return payment
  })
}

function assertMethodAvailable(load: Load, method: PaymentMethod) {
  const market = getMarket(load.market)
  if (!isPaymentMethodAvailable(method, market)) {
    throw DomainError.invalid(
      `${method.toUpperCase()} is not available in ${market.name}`,
      'E_METHOD_UNAVAILABLE'
    )
  }
}

/**
 * Shipper funds the escrow for a MATCHED load. When the provider confirms, the
 * load becomes SECURED and the carrier can see pickup details. Providers that
 * confirm later leave it MATCHED until their webhook arrives.
 */
export async function depositEscrow(shipper: User, loadId: number, method: PaymentMethod) {
  const { payment, escrow } = await db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    if ((await actorFor(load, shipper, trx)) !== 'shipper') throw DomainError.forbidden()
    if (load.status !== 'MATCHED')
      throw DomainError.conflict('Only matched loads can be funded', 'E_INVALID_TRANSITION')
    assertMethodAvailable(load, method)

    const live = await liveEscrow(load.id, trx)
    if (live.status !== 'AWAITING_DEPOSIT')
      throw DomainError.conflict('Escrow is already funded', 'E_ALREADY_FUNDED')
    await assertNoPending(live, 'DEPOSIT', trx)
    return { payment: await openTransaction(load, live, 'DEPOSIT', method, trx), escrow: live }
  })

  const result = await callProvider(payment, () =>
    payments.collect({
      reference: payment.reference!,
      amount: escrow.amount,
      currency: escrow.currency,
      method,
      phone: shipper.phone,
    })
  )
  const settled = result ? await settleTransaction(payment.id, result) : payment
  if (settled.status === 'FAILED')
    throw DomainError.invalid('The payment was declined. Try another method.', 'E_PAYMENT_FAILED')
  return settled
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
    const escrow = await liveEscrow(load.id, trx)
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
 * (the fleet owner for fleet loads) and completes the load.
 */
export async function releaseEscrow(driver: User, loadId: number, code: string) {
  // Wrong-attempt counting must persist even though the request fails, so it
  // can't share a transaction that would roll back on the thrown error.
  const outcome = await db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    if ((await actorFor(load, driver, trx)) !== 'driver') throw DomainError.forbidden()
    if (load.status !== 'DELIVERED')
      throw DomainError.conflict('Confirm arrival before releasing payment', 'E_INVALID_TRANSITION')

    const escrow = await liveEscrow(load.id, trx)
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
    await assertNoPending(escrow, 'PAYOUT', trx)

    // Pay the carrier: the fleet owner's account for fleet loads, else the driver.
    const payee = load.fleetId
      ? await User.query({ client: trx })
          .whereIn('id', (q) => q.from('fleets').select('owner_id').where('id', load.fleetId!))
          .firstOrFail()
      : driver
    const method = escrow.depositMethod ?? 'card'
    const payment = await openTransaction(load, escrow, 'PAYOUT', method, trx)
    return { ok: true as const, payment, escrow, payee, method }
  })
  if (!outcome.ok) throw DomainError.invalid('That code is not correct', 'E_CODE_INVALID')

  const { payment, escrow, payee, method } = outcome
  const result = await callProvider(payment, () =>
    payments.payout({
      reference: payment.reference!,
      amount: escrow.amount,
      currency: escrow.currency,
      method,
      phone: payee.phone,
    })
  )
  const settled = result
    ? await settleTransaction(payment.id, result, { actor: 'driver', actorId: driver.id })
    : payment
  if (settled.status === 'FAILED')
    throw DomainError.conflict('Payout failed. Support has been notified.', 'E_PAYOUT_FAILED')
  if (settled.status === 'PENDING') {
    throw DomainError.conflict(
      "The payout is being confirmed. The job completes as soon as it's through.",
      'E_PAYMENT_PENDING'
    )
  }
  return settled
}

/**
 * Ends an unfunded match's escrow (carrier withdrew, shipper cancelled, or the
 * funding window lapsed). Refuses while a deposit is still being confirmed,
 * since the shipper may already have paid.
 */
export async function voidUnfundedEscrow(load: Load, trx: TransactionClientContract) {
  const escrow = await Escrow.query({ client: trx })
    .where('load_id', load.id)
    .where('status', 'AWAITING_DEPOSIT')
    .forUpdate()
    .first()
  if (!escrow) return
  await assertNoPending(escrow, 'DEPOSIT', trx)
  escrow.useTransaction(trx)
  escrow.status = 'VOID'
  await escrow.save()
}

/**
 * Starts refunding a funded load's escrow in full. Call `sendRefund` with the
 * result once the surrounding transaction has committed.
 */
export async function openRefund(load: Load, trx: TransactionClientContract) {
  const escrow = await liveEscrow(load.id, trx)
  if (escrow.status !== 'HELD') return null
  await assertNoPending(escrow, 'REFUND', trx)
  const payment = await openTransaction(load, escrow, 'REFUND', escrow.depositMethod ?? 'card', trx)
  return { payment, escrow }
}

/** Sends a refund opened with `openRefund` to the shipper. A failure is left for support. */
export async function sendRefund(
  refund: NonNullable<Awaited<ReturnType<typeof openRefund>>>,
  shipper: User
) {
  const { payment, escrow } = refund
  const result = await callProvider(payment, () =>
    payments.refund({
      reference: payment.reference!,
      amount: escrow.amount,
      currency: escrow.currency,
      method: payment.method,
      phone: shipper.phone,
    })
  )
  return result ? settleTransaction(payment.id, result) : payment
}

/**
 * Puts matched loads whose shipper didn't fund escrow in time back on the
 * board, freeing the carrier. Loads with a deposit still being confirmed are
 * left alone. Run every minute (`node ace escrow:expire`).
 */
export async function expireUnfundedLoads(now = DateTime.now()) {
  const due = await Escrow.query()
    .where('status', 'AWAITING_DEPOSIT')
    .where('funding_due_at', '<', now.toSQL()!)
    .select('load_id')
  let expired = 0
  for (const { loadId } of due) {
    const didExpire = await db.transaction(async (trx) => {
      const load = await lockLoad(loadId, trx)
      if (load.status !== 'MATCHED') return false
      const escrow = await liveEscrow(load.id, trx)
      if (escrow.status !== 'AWAITING_DEPOSIT' || !escrow.fundingDueAt || escrow.fundingDueAt > now)
        return false
      if (await hasPending(escrow, 'DEPOSIT', trx)) return false

      escrow.useTransaction(trx)
      escrow.status = 'VOID'
      await escrow.save()
      await transition(
        load,
        'OPEN',
        {
          actor: 'system',
          note: 'Escrow was not funded in time',
          changes: { driverId: null, fleetId: null, vehicleId: null },
        },
        trx
      )
      return true
    })
    if (didExpire) expired += 1
  }
  return expired
}
