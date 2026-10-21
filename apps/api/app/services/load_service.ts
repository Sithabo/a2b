import { randomInt } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import {
  LOAD_STATUSES,
  documentsFor,
  getMarket,
  isActiveStatus,
  type CargoDetails,
} from '@a2b/core'
import Load from '#models/load'
import LoadEvent from '#models/load_event'
import LoadLocation from '#models/load_location'
import Escrow from '#models/escrow'
import Vehicle from '#models/vehicle'
import DriverProfile from '#models/driver_profile'
import type User from '#models/user'
import type Fleet from '#models/fleet'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import DomainError from '#exceptions/domain_error'
import { actorFor, fleetOwnedBy } from '#services/load_access'
import { lockLoad, transition } from '#services/load_lifecycle'
import { openRefund, sendRefund, voidUnfundedEscrow } from '#services/escrow_service'
import paymentsConfig from '#config/payments'
import { DateTime } from 'luxon'

const REFERENCE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ' // no 0/O, 1/I/L

function newReference() {
  let code = ''
  for (let i = 0; i < 6; i++) code += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)]
  return `A2B-${code}`
}

interface Place {
  address: string
  lat?: number | null
  lng?: number | null
  contactName?: string | null
  contactPhone?: string | null
}

export interface CreateLoadInput {
  pickupSummary: string
  dropoffSummary: string
  pickup: Place
  dropoff: Place
  isImport: boolean
  containerId?: string | null
  cargo: CargoDetails
  weightKg?: number | null
  offerPrice: number
  readyAt?: DateTime | null
  deadlineAt?: DateTime | null
}

/** Creates a DRAFT load in the shipper's market. */
export async function createLoad(shipper: User, input: CreateLoadInput) {
  if (shipper.role !== 'shipper') throw DomainError.forbidden('Only shippers can post loads')

  return db.transaction(async (trx) => {
    const load = await Load.create(
      {
        reference: newReference(),
        shipperId: shipper.id,
        market: shipper.market,
        status: 'DRAFT',
        pickupSummary: input.pickupSummary,
        dropoffSummary: input.dropoffSummary,
        isImport: input.isImport,
        containerId: input.containerId ?? null,
        cargoType: input.cargo.type,
        cargo: input.cargo,
        weightKg: input.weightKg ?? null,
        offerPrice: input.offerPrice,
        readyAt: input.readyAt ?? null,
        deadlineAt: input.deadlineAt ?? null,
      },
      { client: trx }
    )
    await LoadLocation.create(
      {
        loadId: load.id,
        pickupAddress: input.pickup.address,
        pickupLat: input.pickup.lat ?? null,
        pickupLng: input.pickup.lng ?? null,
        pickupContactName: input.pickup.contactName ?? null,
        pickupContactPhone: input.pickup.contactPhone ?? null,
        dropoffAddress: input.dropoff.address,
        dropoffLat: input.dropoff.lat ?? null,
        dropoffLng: input.dropoff.lng ?? null,
        receiverName: input.dropoff.contactName ?? null,
        receiverPhone: input.dropoff.contactPhone ?? null,
      },
      { client: trx }
    )
    await LoadEvent.create(
      {
        loadId: load.id,
        fromStatus: null,
        toStatus: 'DRAFT',
        actorId: shipper.id,
        actorRole: 'shipper',
      },
      { client: trx }
    )
    return load
  })
}

/** Customs documents still missing before an import load can go on the board. */
export async function missingDocuments(load: Load) {
  if (!load.isImport) return []
  const { required } = documentsFor(getMarket(load.market).documents, load.cargo)
  await load.load('documents')
  const uploaded = new Set(load.documents.map((d) => d.requirementId))
  return required.filter((doc) => !uploaded.has(doc.id))
}

/** DRAFT → OPEN. Import loads need every required customs document first. */
export async function publishLoad(shipper: User, loadId: number) {
  return db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    if ((await actorFor(load, shipper, trx)) !== 'shipper') throw DomainError.forbidden()

    const missing = await missingDocuments(load)
    if (missing.length) {
      throw DomainError.invalid(
        `Upload these documents first: ${missing.map((d) => d.label).join(', ')}`,
        'E_DOCUMENTS_MISSING'
      )
    }
    return transition(load, 'OPEN', { actor: 'shipper', actorId: shipper.id }, trx)
  })
}

const ACTIVE_STATUSES = LOAD_STATUSES.filter(isActiveStatus)

/** A driver works one job at a time: matched, secured, in transit or awaiting release. */
async function assertDriverFree(
  driverId: number,
  trx: TransactionClientContract,
  exceptLoadId?: number
) {
  const busy = await Load.query({ client: trx })
    .where('driver_id', driverId)
    .whereIn('status', ACTIVE_STATUSES)
    .if(exceptLoadId, (q) => q.whereNot('id', exceptLoadId!))
    .first()
  if (busy) throw DomainError.conflict('This driver is already on another job', 'E_DRIVER_BUSY')
}

/**
 * A driver the fleet may dispatch: in the fleet and not rejected. Pending
 * drivers are allowed here — dispatching them is the fleet vouching for them.
 */
async function assertFleetDriver(fleet: Fleet, driverId: number, trx: TransactionClientContract) {
  const profile = await DriverProfile.query({ client: trx })
    .where('user_id', driverId)
    .where('fleet_id', fleet.id)
    .first()
  if (!profile)
    throw DomainError.invalid('That driver is not in your fleet', 'E_DRIVER_NOT_IN_FLEET')
  if (profile.verificationStatus === 'REJECTED')
    throw DomainError.invalid("This driver's verification was rejected", 'E_DRIVER_UNVERIFIED')
}

async function fleetVehicle(fleet: Fleet, vehicleId: number, trx: TransactionClientContract) {
  const vehicle = await Vehicle.query({ client: trx })
    .where('id', vehicleId)
    .where('fleet_id', fleet.id)
    .first()
  if (!vehicle) throw DomainError.invalid('That vehicle is not in your fleet', 'E_VEHICLE_REQUIRED')
  return vehicle
}

export interface AcceptInput {
  /** Fleet owners choose which truck (and optionally driver) takes the load. */
  vehicleId?: number
  driverId?: number
}

/**
 * OPEN → MATCHED. A verified driver accepts for themselves, or a fleet owner
 * dispatches one of their trucks with its driver. Opens the escrow the shipper
 * must now fund.
 */
export async function acceptLoad(carrier: User, loadId: number, input: AcceptInput = {}) {
  return db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    if (load.market !== carrier.market)
      throw DomainError.forbidden('This load is in another market')

    let changes: { driverId: number | null; fleetId: number | null; vehicleId: number | null }
    let actor: 'driver' | 'fleet_owner'

    if (carrier.role === 'driver') {
      const profile = await DriverProfile.query({ client: trx })
        .where('user_id', carrier.id)
        .first()
      if (!profile)
        throw DomainError.invalid('Complete your driver profile first', 'E_PROFILE_INCOMPLETE')
      if (profile.verificationStatus === 'REJECTED')
        throw DomainError.forbidden('Your driver account is not verified')
      // Until their licence is verified, drivers only carry loads their fleet dispatches
      if (profile.verificationStatus !== 'VERIFIED') {
        throw DomainError.forbidden(
          'Your licence is still being verified. You can take jobs your fleet dispatches to you.',
          'E_DRIVER_UNVERIFIED'
        )
      }
      await assertDriverFree(carrier.id, trx)
      const vehicle = await Vehicle.query({ client: trx })
        .where('assigned_driver_id', carrier.id)
        .first()
      changes = { driverId: carrier.id, fleetId: profile.fleetId, vehicleId: vehicle?.id ?? null }
      actor = 'driver'
    } else if (carrier.role === 'fleet_owner') {
      const fleet = await fleetOwnedBy(carrier, trx)
      if (!fleet) throw DomainError.invalid('Set up your fleet first', 'E_PROFILE_INCOMPLETE')
      if (!input.vehicleId)
        throw DomainError.invalid('Choose a vehicle for this load', 'E_VEHICLE_REQUIRED')
      const vehicle = await fleetVehicle(fleet, input.vehicleId, trx)
      // Without a driver nobody could report progress or release the payment
      const driverId = input.driverId ?? vehicle.assignedDriverId
      if (!driverId)
        throw DomainError.invalid('Assign a driver to this truck first', 'E_DRIVER_REQUIRED')
      await assertFleetDriver(fleet, driverId, trx)
      await assertDriverFree(driverId, trx)
      changes = { driverId, fleetId: fleet.id, vehicleId: vehicle.id }
      actor = 'fleet_owner'
    } else {
      throw DomainError.forbidden('Only drivers and fleet owners can accept loads')
    }

    await transition(load, 'MATCHED', { actor, actorId: carrier.id, changes }, trx)
    await Escrow.create(
      {
        loadId: load.id,
        amount: load.offerPrice,
        currency: getMarket(load.market).currency.code,
        status: 'AWAITING_DEPOSIT',
        releaseAttempts: 0,
        // After this the load goes back on the board (see expireUnfundedLoads)
        fundingDueAt: DateTime.now().plus({ minutes: paymentsConfig.fundingWindowMinutes }),
      },
      { client: trx }
    )
    return load
  })
}

export interface AssignInput {
  vehicleId?: number
  driverId?: number
}

/**
 * The fleet owner changes the truck and/or driver on one of their loads before
 * pickup (MATCHED or SECURED). Picking a truck brings its assigned driver
 * unless a driver is named. Recorded in the load's history.
 */
export async function assignLoad(owner: User, loadId: number, input: AssignInput) {
  return db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    const fleet = await fleetOwnedBy(owner, trx)
    if (!fleet || load.fleetId !== fleet.id) throw DomainError.forbidden()
    if (load.status !== 'MATCHED' && load.status !== 'SECURED') {
      throw DomainError.conflict(
        'The driver and truck can only change before pickup',
        'E_INVALID_TRANSITION'
      )
    }

    const vehicle = input.vehicleId ? await fleetVehicle(fleet, input.vehicleId, trx) : null
    const driverId = input.driverId ?? (vehicle ? vehicle.assignedDriverId : load.driverId)
    if (!driverId)
      throw DomainError.invalid('Assign a driver to this truck first', 'E_DRIVER_REQUIRED')
    await assertFleetDriver(fleet, driverId, trx)
    await assertDriverFree(driverId, trx, load.id)

    load.useTransaction(trx)
    load.merge({ driverId, vehicleId: vehicle?.id ?? load.vehicleId })
    await load.save()

    const driver = await DriverProfile.query({ client: trx })
      .where('user_id', driverId)
      .preload('user')
      .firstOrFail()
    const truck = load.vehicleId
      ? await Vehicle.query({ client: trx }).where('id', load.vehicleId).first()
      : null
    await LoadEvent.create(
      {
        loadId: load.id,
        fromStatus: load.status,
        toStatus: load.status,
        actorId: owner.id,
        actorRole: 'fleet_owner',
        note: `Assigned to ${driver.user.fullName ?? driver.user.phone}${truck ? ` (${truck.plate})` : ''}`,
      },
      { client: trx }
    )
    return load
  })
}

/** MATCHED → OPEN: the carrier backs out before the shipper funds escrow. */
export async function withdrawFromLoad(carrier: User, loadId: number) {
  return db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    const actor = await actorFor(load, carrier, trx)
    if (actor !== 'driver' && actor !== 'fleet_owner') throw DomainError.forbidden()

    await voidUnfundedEscrow(load, trx)
    return transition(
      load,
      'OPEN',
      {
        actor,
        actorId: carrier.id,
        note: 'Carrier withdrew',
        changes: { driverId: null, fleetId: null, vehicleId: null },
      },
      trx
    )
  })
}

/**
 * Shipper cancels a load. Before funding the escrow is simply voided; a funded
 * load (SECURED, before pickup) is refunded in full.
 */
export async function cancelLoad(shipper: User, loadId: number, reason?: string) {
  const { load, refund } = await db.transaction(async (trx) => {
    const locked = await lockLoad(loadId, trx)
    if ((await actorFor(locked, shipper, trx)) !== 'shipper') throw DomainError.forbidden()

    const pendingRefund = locked.status === 'SECURED' ? await openRefund(locked, trx) : null
    if (locked.status !== 'SECURED') await voidUnfundedEscrow(locked, trx)
    await transition(
      locked,
      'CANCELLED',
      {
        actor: 'shipper',
        actorId: shipper.id,
        note: pendingRefund
          ? [reason, 'Escrow refunded to the shipper'].filter(Boolean).join(' · ')
          : reason,
      },
      trx
    )
    return { load: locked, refund: pendingRefund }
  })

  // The cancellation stands either way; a failed refund is left for support.
  if (refund) await sendRefund(refund, shipper)
  return load
}

/** Driver milestones: SECURED → IN_TRANSIT (cargo loaded) → DELIVERED (arrived). */
export async function reportProgress(driver: User, loadId: number, to: 'IN_TRANSIT' | 'DELIVERED') {
  return db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    if ((await actorFor(load, driver, trx)) !== 'driver') throw DomainError.forbidden()
    return transition(load, to, { actor: 'driver', actorId: driver.id }, trx)
  })
}
