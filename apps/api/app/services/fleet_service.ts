import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import {
  LOAD_STATUSES,
  getMarket,
  isActiveStatus,
  isValidPlate,
  isValidTaxId,
  normalizePlate,
  type BodyType,
  type FleetSizeTier,
  type VehicleClass,
} from '@a2b/core'
import Fleet from '#models/fleet'
import Vehicle from '#models/vehicle'
import DriverProfile from '#models/driver_profile'
import FleetInvite from '#models/fleet_invite'
import Load from '#models/load'
import User from '#models/user'
import DomainError from '#exceptions/domain_error'
import { fleetOwnedBy } from '#services/load_access'
import { normalizePhone } from '#services/otp_service'
import { sms } from '#services/sms/index'

export async function requireFleet(owner: User) {
  const fleet = await fleetOwnedBy(owner)
  if (!fleet) throw DomainError.invalid('Set up your fleet first', 'E_PROFILE_INCOMPLETE')
  return fleet
}

export interface FleetInput {
  name: string
  address?: string | null
  taxId?: string | null
  sizeTier: FleetSizeTier
  primaryCorridor?: string | null
}

/** One fleet per fleet owner, in the owner's market. */
export async function createFleet(owner: User, input: FleetInput) {
  if (owner.role !== 'fleet_owner')
    throw DomainError.forbidden('Only fleet owners can create a fleet')
  if (await fleetOwnedBy(owner))
    throw DomainError.conflict('You already have a fleet', 'E_FLEET_EXISTS')
  const market = getMarket(owner.market)
  if (input.taxId && !isValidTaxId(input.taxId, market)) {
    throw DomainError.invalid(
      `Enter a valid ${market.taxId.issuer} TIN (${market.taxId.hint})`,
      'E_INVALID_TAX_ID'
    )
  }
  try {
    return await Fleet.create({ ...input, ownerId: owner.id, market: owner.market })
  } catch (error) {
    // A parallel request (double-tap) created it first; fleets.owner_id is unique
    if ((error as { code?: string }).code === '23505')
      throw DomainError.conflict('You already have a fleet', 'E_FLEET_EXISTS')
    throw error
  }
}

export interface VehicleInput {
  plate: string
  make: string
  model: string
  vehicleClass: VehicleClass
  bodyType: BodyType
  capacityTons: number
  assignedDriverId?: number | null
}

async function assertDriverInFleet(fleet: Fleet, driverId: number) {
  const profile = await DriverProfile.query()
    .where('user_id', driverId)
    .where('fleet_id', fleet.id)
    .first()
  if (!profile)
    throw DomainError.invalid('That driver is not in your fleet', 'E_DRIVER_NOT_IN_FLEET')
}

/**
 * A driver drives one truck at a time (enforced by a unique index), so
 * assigning them to a truck takes them off any other one. Loads already
 * dispatched keep the truck they were dispatched with.
 */
async function releaseDriverFromOtherTrucks(
  driverId: number,
  exceptVehicleId: number | null,
  trx: TransactionClientContract
) {
  await Vehicle.query({ client: trx })
    .where('assigned_driver_id', driverId)
    .if(exceptVehicleId, (q) => q.whereNot('id', exceptVehicleId!))
    .update({ assigned_driver_id: null, updated_at: DateTime.now().toSQL() })
}

export async function addVehicle(owner: User, input: VehicleInput) {
  const fleet = await requireFleet(owner)
  const market = getMarket(fleet.market)
  const plate = normalizePlate(input.plate)
  // Plate formats are not yet confirmed with the licensing authorities, so only
  // enforce them once a market marks its format as verified.
  if (market.plate.verified && !isValidPlate(plate, market)) {
    throw DomainError.invalid(`Enter a plate like ${market.plate.example}`, 'E_INVALID_PLATE')
  }
  if (await Vehicle.query().where('market', fleet.market).where('plate', plate).first()) {
    throw DomainError.conflict('A vehicle with this plate is already registered', 'E_PLATE_TAKEN')
  }
  if (input.assignedDriverId) await assertDriverInFleet(fleet, input.assignedDriverId)

  return db.transaction(async (trx) => {
    if (input.assignedDriverId)
      await releaseDriverFromOtherTrucks(input.assignedDriverId, null, trx)
    return Vehicle.create(
      { ...input, plate, fleetId: fleet.id, market: fleet.market, status: 'IDLE' },
      { client: trx }
    )
  })
}

export async function updateVehicle(
  owner: User,
  vehicleId: number,
  changes: { assignedDriverId?: number | null; status?: Vehicle['status'] }
) {
  const fleet = await requireFleet(owner)
  const vehicle = await Vehicle.query().where('id', vehicleId).where('fleet_id', fleet.id).first()
  if (!vehicle) throw DomainError.notFound('Vehicle not found')
  if (changes.assignedDriverId) await assertDriverInFleet(fleet, changes.assignedDriverId)

  return db.transaction(async (trx) => {
    if (changes.assignedDriverId)
      await releaseDriverFromOtherTrucks(changes.assignedDriverId, vehicle.id, trx)
    vehicle.useTransaction(trx)
    vehicle.merge(changes)
    await vehicle.save()
    return vehicle
  })
}

export type AddDriverResult =
  { status: 'ADDED'; driver: User } | { status: 'INVITED'; invite: FleetInvite }

/**
 * Adds a driver to the fleet by phone.
 *
 * - New numbers get a driver account in this fleet; they sign in later with it.
 * - Drivers who already use A2B on their own are invited instead, and join
 *   only if they accept: joining a fleet sends their future payouts to the
 *   fleet owner, so it has to be their choice.
 */
export async function addDriver(
  owner: User,
  input: { phone: string; fullName?: string | null }
): Promise<AddDriverResult> {
  const fleet = await requireFleet(owner)
  const { phone, market } = normalizePhone(input.phone)
  if (market !== fleet.market)
    throw DomainError.invalid('This number is registered in another market', 'E_MARKET_MISMATCH')

  const result = await db.transaction(async (trx) => {
    const driver = await User.query({ client: trx }).where('phone', phone).forUpdate().first()
    if (!driver) {
      const created = await User.create(
        { phone, market, role: 'driver', fullName: input.fullName ?? null },
        { client: trx }
      )
      await joinFleet(created, fleet, null, trx)
      return { status: 'ADDED' as const, driver: created, isNewInvite: false }
    }
    if (driver.role !== 'driver') {
      throw DomainError.conflict('This number belongs to a non-driver account', 'E_NOT_A_DRIVER')
    }

    const profile = await DriverProfile.query({ client: trx })
      .where('user_id', driver.id)
      .forUpdate()
      .first()
    if (profile?.fleetId === fleet.id)
      return { status: 'ADDED' as const, driver, isNewInvite: false }
    if (profile?.fleetId) {
      throw DomainError.conflict(
        'This driver already belongs to another fleet',
        'E_DRIVER_IN_OTHER_FLEET'
      )
    }

    // Created by a fleet and never signed in (their fleet was since removed):
    // there's no independent work of theirs to protect.
    if (!driver.phoneVerifiedAt) {
      await joinFleet(driver, fleet, profile, trx)
      return { status: 'ADDED' as const, driver, isNewInvite: false }
    }

    const pending = await FleetInvite.query({ client: trx })
      .where('fleet_id', fleet.id)
      .where('driver_id', driver.id)
      .where('status', 'PENDING')
      .first()
    if (pending) return { status: 'INVITED' as const, invite: pending, isNewInvite: false }

    const invite = await FleetInvite.create(
      { fleetId: fleet.id, driverId: driver.id, status: 'PENDING' },
      { client: trx }
    )
    return { status: 'INVITED' as const, invite, isNewInvite: true }
  })

  if (result.status === 'INVITED') {
    if (result.isNewInvite) {
      await sms.send(
        phone,
        `${fleet.name} has invited you to drive for their fleet on A2B. Open the A2B Driver app to accept or decline.`
      )
    }
    return { status: 'INVITED', invite: result.invite }
  }
  return { status: 'ADDED', driver: result.driver }
}

/** Puts the driver in the fleet, creating their driver profile if they have none yet. */
async function joinFleet(
  driver: User,
  fleet: Fleet,
  profile: DriverProfile | null,
  trx: TransactionClientContract
) {
  if (profile) {
    profile.useTransaction(trx)
    profile.fleetId = fleet.id
    await profile.save()
    return
  }
  await DriverProfile.create(
    {
      userId: driver.id,
      fleetId: fleet.id,
      verificationStatus: 'PENDING',
      dutyStatus: 'OFF_DUTY',
      completedTrips: 0,
    },
    { client: trx }
  )
}

const ACTIVE_LOAD_STATUSES = LOAD_STATUSES.filter(isActiveStatus)

/** Open invites the fleet owner has sent. */
export async function fleetInvites(owner: User) {
  const fleet = await requireFleet(owner)
  return FleetInvite.query()
    .where('fleet_id', fleet.id)
    .where('status', 'PENDING')
    .preload('fleet')
    .preload('driver')
    .orderBy('id', 'desc')
}

/** Open invites waiting for this driver's answer. */
export async function driverInvites(driver: User) {
  return FleetInvite.query()
    .where('driver_id', driver.id)
    .where('status', 'PENDING')
    .preload('fleet')
    .preload('driver')
    .orderBy('id', 'desc')
}

/** The driver accepts (joins the fleet) or declines an invite. */
export async function respondToInvite(driver: User, inviteId: number, accept: boolean) {
  if (driver.role !== 'driver') throw DomainError.forbidden('Only drivers can answer fleet invites')

  const invite = await db.transaction(async (trx) => {
    const found = await FleetInvite.query({ client: trx })
      .where('id', inviteId)
      .where('driver_id', driver.id)
      .forUpdate()
      .first()
    if (!found) throw DomainError.notFound('Invite not found')
    if (found.status !== 'PENDING')
      throw DomainError.conflict('This invite is no longer open', 'E_INVITE_CLOSED')

    found.useTransaction(trx)
    found.respondedAt = DateTime.now()
    if (!accept) {
      found.status = 'DECLINED'
      await found.save()
      return found
    }

    const fleet = await Fleet.query({ client: trx }).where('id', found.fleetId).firstOrFail()
    if (fleet.market !== driver.market)
      throw DomainError.invalid('This fleet is in another market', 'E_MARKET_MISMATCH')

    const profile = await DriverProfile.query({ client: trx })
      .where('user_id', driver.id)
      .forUpdate()
      .first()
    if (profile?.fleetId && profile.fleetId !== fleet.id) {
      throw DomainError.conflict('You already belong to another fleet', 'E_DRIVER_IN_OTHER_FLEET')
    }
    // A load's payout goes to whoever carried it when it was accepted; joining
    // mid-job would muddle that, so finish current work first.
    const busy = await Load.query({ client: trx })
      .where('driver_id', driver.id)
      .whereIn('status', ACTIVE_LOAD_STATUSES)
      .first()
    if (busy)
      throw DomainError.conflict('Finish your current job before joining a fleet', 'E_DRIVER_BUSY')

    await joinFleet(driver, fleet, profile, trx)
    found.status = 'ACCEPTED'
    await found.save()

    // Other fleets' invites no longer apply
    await FleetInvite.query({ client: trx })
      .where('driver_id', driver.id)
      .where('status', 'PENDING')
      .whereNot('id', found.id)
      .update({ status: 'CANCELLED', updated_at: DateTime.now().toSQL() })
    return found
  })

  await invite.load((loader) => loader.load('fleet').load('driver'))
  return invite
}
