import { BaseSeeder } from '@adonisjs/lucid/seeders'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import type { MarketCode } from '@a2b/core'
import User from '#models/user'
import ShipperProfile from '#models/shipper_profile'
import Load from '#models/load'
import { createLoad, publishLoad, type CreateLoadInput } from '#services/load_service'

/** Demo shippers match OTP_TEST_NUMBERS so you can also sign in as them (code 123456). */
const SHIPPERS: Record<MarketCode, { phone: string; company: string }> = {
  UG: { phone: '+256700000001', company: 'Nile Breweries Depot (demo)' },
  GY: { phone: '+5926000001', company: 'Demerara Imports (demo)' },
}

const LOADS: Record<MarketCode, Partial<CreateLoadInput>[]> = {
  UG: [
    {
      pickupSummary: 'Industrial Area, Kampala',
      dropoffSummary: 'Main Street, Jinja',
      cargo: { type: 'GENERAL_CARGO', weightKg: 4000 },
      offerPrice: 450000,
    },
    {
      pickupSummary: 'Namanve, Mukono',
      dropoffSummary: 'Mbarara Town',
      cargo: { type: 'FOOD_BEVERAGE', storageEnvironment: 'CHILLED', weightKg: 6000 },
      offerPrice: 1200000,
    },
    {
      pickupSummary: 'Kawempe, Kampala',
      dropoffSummary: 'Gulu City',
      cargo: { type: 'HEAVY_MACHINERY', requiresFlatbedLowboy: true, weightKg: 12000 },
      offerPrice: 2800000,
    },
  ],
  GY: [
    {
      pickupSummary: 'Eccles, East Bank Demerara',
      dropoffSummary: 'Linden',
      cargo: { type: 'GENERAL_CARGO', weightKg: 3000 },
      offerPrice: 85000,
    },
    {
      pickupSummary: 'Diamond, East Bank Demerara',
      dropoffSummary: 'New Amsterdam',
      cargo: { type: 'FOOD_BEVERAGE', storageEnvironment: 'FROZEN', weightKg: 5000 },
      offerPrice: 140000,
    },
  ],
}

/**
 * Development demo data: a shipper per market with open loads on the board.
 * Safe to re-run — tops each market up to its demo loads.
 *
 *   node ace db:seed --files database/seeders/demo_seeder.ts
 */
export default class DemoSeeder extends BaseSeeder {
  static environment = ['development']

  async run() {
    if (app.inProduction) return

    for (const market of ['UG', 'GY'] as MarketCode[]) {
      const { phone, company } = SHIPPERS[market]
      const shipper =
        (await User.findBy('phone', phone)) ??
        (await User.create({
          phone,
          market,
          role: 'shipper',
          fullName: company,
          phoneVerifiedAt: DateTime.now(),
        }))
      await ShipperProfile.firstOrCreate(
        { userId: shipper.id },
        { companyName: company, isImporter: false }
      )

      const open = await Load.query()
        .where('shipper_id', shipper.id)
        .where('status', 'OPEN')
        .count('* as total')
      const missing = LOADS[market].length - Number(open[0].$extras.total)
      for (const input of LOADS[market].slice(0, Math.max(0, missing))) {
        const load = await createLoad(shipper, {
          ...(input as CreateLoadInput),
          pickup: { address: input.pickupSummary! },
          dropoff: { address: input.dropoffSummary! },
          isImport: false,
          readyAt: DateTime.now().plus({ days: 1 }).set({ hour: 8, minute: 0 }),
          deadlineAt: DateTime.now().plus({ days: 2 }).set({ hour: 17, minute: 0 }),
          weightKg: input.cargo?.weightKg ?? null,
        })
        await publishLoad(shipper, load.id)
      }
    }
  }
}
