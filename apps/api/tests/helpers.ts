import { DateTime } from 'luxon'
import type { MarketCode, UserRole } from '@a2b/core'
import User from '#models/user'
import DriverProfile from '#models/driver_profile'
import ShipperProfile from '#models/shipper_profile'
import { createLoad, type CreateLoadInput } from '#services/load_service'

let phoneSeq = 1000

/** Unique, valid mobile numbers per market. */
export function nextPhone(market: MarketCode = 'UG') {
  phoneSeq += 1
  return market === 'UG'
    ? `+256772${String(phoneSeq).padStart(6, '0')}`
    : `+592600${String(phoneSeq).padStart(4, '0')}`
}

export async function makeUser(
  role: UserRole,
  market: MarketCode = 'UG',
  fullName = `Test ${role}`
) {
  const user = await User.create({
    phone: nextPhone(market),
    role,
    market,
    fullName,
    phoneVerifiedAt: DateTime.now(),
  })
  if (role === 'driver') {
    await DriverProfile.create({
      userId: user.id,
      verificationStatus: 'VERIFIED',
      dutyStatus: 'AVAILABLE',
      completedTrips: 0,
    })
  }
  if (role === 'shipper') {
    await ShipperProfile.create({
      userId: user.id,
      companyName: 'Acme Logistics',
      isImporter: false,
    })
  }
  return user
}

export const loadInput = (overrides: Partial<CreateLoadInput> = {}): CreateLoadInput => ({
  pickupSummary: 'Makindye, Kampala',
  dropoffSummary: 'Industrial Area, Jinja',
  pickup: {
    address: 'Plot 12, Makindye Road, Kampala',
    contactName: 'Sarah',
    contactPhone: '+256772000111',
  },
  dropoff: {
    address: 'Plot 4, Main Street, Jinja',
    contactName: 'Peter',
    contactPhone: '+256772000222',
  },
  isImport: false,
  cargo: { type: 'GENERAL_CARGO' },
  weightKg: 2500,
  offerPrice: 450000,
  ...overrides,
})

export async function makeLoad(shipper: User, overrides: Partial<CreateLoadInput> = {}) {
  return createLoad(shipper, loadInput(overrides))
}

/** The `data` payload of an API response, untyped for terse assertions. */
export const dataOf = (response: { body(): unknown }): any => (response.body() as any).data
