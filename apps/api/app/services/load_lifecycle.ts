import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { canTransition, statusMeta, type LoadStatus, type StatusActor } from '@a2b/core'
import Load from '#models/load'
import LoadEvent from '#models/load_event'
import DomainError from '#exceptions/domain_error'

/** Which timestamp column each status stamps when entered. */
const STAMPS: Partial<Record<LoadStatus, keyof Load>> = {
  OPEN: 'postedAt',
  MATCHED: 'matchedAt',
  SECURED: 'securedAt',
  IN_TRANSIT: 'inTransitAt',
  DELIVERED: 'deliveredAt',
  COMPLETED: 'completedAt',
  CANCELLED: 'cancelledAt',
}

/** Loads a row with FOR UPDATE so concurrent requests (e.g. two carriers accepting) serialize. */
export async function lockLoad(id: number, trx: TransactionClientContract) {
  const load = await Load.query({ client: trx }).where('id', id).forUpdate().first()
  if (!load) throw new DomainError('Load not found', { status: 404, code: 'E_NOT_FOUND' })
  return load
}

export interface TransitionOptions {
  actor: StatusActor
  actorId?: number | null
  note?: string
  /** Extra column changes applied in the same save (e.g. carrier ids on MATCHED). */
  changes?: Partial<Pick<Load, 'driverId' | 'fleetId' | 'vehicleId'>>
}

/**
 * The only place a load's status changes. Enforces the shared @a2b/core rules,
 * stamps the lifecycle timestamp and appends an audit event. Must run inside a
 * transaction on a row obtained from `lockLoad`.
 */
export async function transition(
  load: Load,
  to: LoadStatus,
  options: TransitionOptions,
  trx: TransactionClientContract
) {
  const from = load.status
  if (!canTransition(from, to, options.actor)) {
    throw DomainError.conflict(
      `A load that is "${statusMeta[from].label}" can't move to "${statusMeta[to].label}"`,
      'E_INVALID_TRANSITION'
    )
  }

  load.useTransaction(trx)
  load.status = to
  const stamp = STAMPS[to]
  if (stamp) (load as any)[stamp] = DateTime.now()
  if (options.changes) load.merge(options.changes)
  await load.save()

  await LoadEvent.create(
    {
      loadId: load.id,
      fromStatus: from,
      toStatus: to,
      actorId: options.actorId ?? null,
      actorRole: options.actor,
      note: options.note ?? null,
    },
    { client: trx }
  )
  return load
}
