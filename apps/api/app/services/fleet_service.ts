import db from '@adonisjs/lucid/services/db'
import {
  getMarket,
  isValidPlate,
  isValidTaxId,
  normalizePlate,
  type BodyType,
  type Fleet as FleetShape,
  type VehicleClass,
} from '@a2b/core'
import Fleet from '#models/fleet'
import Vehicle from '#models/vehicle'
import DriverProfile from '#models/driver_profile'
import User from '#models/user'
import DomainError from '#exceptions/domain_error'
import { fleetOwnedBy } from '#services/load_access'
import { normalizePhone } from '#services/otp_service'

export async function requireFleet(owner: User) {
  const fleet = await fleetOwnedBy(owner)
  if (!fleet) throw DomainError.invalid('Set up your fleet first', 'E_PROFILE_INCOMPLETE')
  return fleet
}

export interface FleetInput {
  name: string
  address?: string | null
  taxId?: string | null
  sizeTier: FleetShape['sizeTier']
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
  return Fleet.create({ ...input, ownerId: owner.id, market: owner.market })
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
  return Vehicle.create({
    ...input,
    plate,
    fleetId: fleet.id,
    market: fleet.market,
    status: 'IDLE',
  })
}

export async function updateVehicle(
  owner: User,
  vehicleId: number,
  changes: { assignedDriverId?: number | null; status?: Vehicle['status'] }
) {
  const fleet = await requireFleet(owner)
  const vehicle = await Vehicle.query().where('id', vehicleId).where('fleet_id', fleet.id).first()
  if (!vehicle) throw new DomainError('Vehicle not found', { status: 404, code: 'E_NOT_FOUND' })
  if (changes.assignedDriverId) await assertDriverInFleet(fleet, changes.assignedDriverId)
  vehicle.merge(changes)
  await vehicle.save()
  return vehicle
}

/**
 * Adds a driver to the fleet by phone. If they haven't used A2B yet, a driver
 * account is created for them; they sign in later with the same number.
 */
export async function addDriver(owner: User, input: { phone: string; fullName?: string | null }) {
  const fleet = await requireFleet(owner)
  const { phone, market } = normalizePhone(input.phone)
  if (market !== fleet.market)
    throw DomainError.invalid('This number is registered in another market', 'E_MARKET_MISMATCH')

  return db.transaction(async (trx) => {
    let driver = await User.query({ client: trx }).where('phone', phone).first()
    if (driver && driver.role !== 'driver') {
      throw DomainError.conflict('This number belongs to a non-driver account', 'E_NOT_A_DRIVER')
    }
    if (!driver) {
      driver = await User.create(
        { phone, market, role: 'driver', fullName: input.fullName ?? null },
        { client: trx }
      )
    }

    const profile = await DriverProfile.query({ client: trx }).where('user_id', driver.id).first()
    if (profile?.fleetId && profile.fleetId !== fleet.id) {
      throw DomainError.conflict(
        'This driver already belongs to another fleet',
        'E_DRIVER_IN_OTHER_FLEET'
      )
    }
    if (profile) {
      profile.useTransaction(trx)
      profile.fleetId = fleet.id
      await profile.save()
    } else {
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
    return driver
  })
}
