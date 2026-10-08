import { randomInt } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import { documentsFor, getMarket, type CargoDetails } from '@a2b/core'
import Load from '#models/load'
import LoadEvent from '#models/load_event'
import LoadLocation from '#models/load_location'
import Escrow from '#models/escrow'
import Vehicle from '#models/vehicle'
import DriverProfile from '#models/driver_profile'
import type User from '#models/user'
import DomainError from '#exceptions/domain_error'
import { actorFor, fleetOwnedBy } from '#services/load_access'
import { lockLoad, transition } from '#services/load_lifecycle'
import type { DateTime } from 'luxon'

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

export interface AcceptInput {
  /** Fleet owners choose which truck (and optionally driver) takes the load. */
  vehicleId?: number
  driverId?: number
}

/**
 * OPEN → MATCHED. A driver accepts for themselves, or a fleet owner dispatches one
 * of their trucks. Opens the escrow the shipper must now fund.
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
      const vehicle = await Vehicle.query({ client: trx })
        .where('id', input.vehicleId)
        .where('fleet_id', fleet.id)
        .first()
      if (!vehicle)
        throw DomainError.invalid('That vehicle is not in your fleet', 'E_VEHICLE_REQUIRED')
      const driverId = input.driverId ?? vehicle.assignedDriverId
      if (driverId) {
        const inFleet = await DriverProfile.query({ client: trx })
          .where('user_id', driverId)
          .where('fleet_id', fleet.id)
          .first()
        if (!inFleet)
          throw DomainError.invalid('That driver is not in your fleet', 'E_DRIVER_NOT_IN_FLEET')
      }
      changes = { driverId: driverId ?? null, fleetId: fleet.id, vehicleId: vehicle.id }
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

    await Escrow.query({ client: trx })
      .where('load_id', load.id)
      .where('status', 'AWAITING_DEPOSIT')
      .delete()
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

/** Shipper cancels before escrow is funded. Funded loads need support (refund flow). */
export async function cancelLoad(shipper: User, loadId: number, reason?: string) {
  return db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    if ((await actorFor(load, shipper, trx)) !== 'shipper') throw DomainError.forbidden()
    await Escrow.query({ client: trx })
      .where('load_id', load.id)
      .where('status', 'AWAITING_DEPOSIT')
      .delete()
    return transition(
      load,
      'CANCELLED',
      { actor: 'shipper', actorId: shipper.id, note: reason },
      trx
    )
  })
}

/** Driver milestones: SECURED → IN_TRANSIT (cargo loaded) → DELIVERED (arrived). */
export async function reportProgress(driver: User, loadId: number, to: 'IN_TRANSIT' | 'DELIVERED') {
  return db.transaction(async (trx) => {
    const load = await lockLoad(loadId, trx)
    if ((await actorFor(load, driver, trx)) !== 'driver') throw DomainError.forbidden()
    return transition(load, to, { actor: 'driver', actorId: driver.id }, trx)
  })
}
