import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import type { MarketCode } from '@a2b/core'

/** Fixed demo drivers, one per market. Their numbers are OTP test numbers too. */
const DEMO_DRIVERS: Record<MarketCode, { phone: string; fullName: string }> = {
  UG: { phone: '+256700000002', fullName: 'John Mukasa (demo driver)' },
  GY: { phone: '+5926000002', fullName: 'Ravi Persaud (demo driver)' },
}

/**
 * Development helper: plays the driver's side of a load until the driver app exists.
 *
 *   node ace carrier:simulate A2B-7K3P9Q accept
 *   node ace carrier:simulate A2B-7K3P9Q loaded
 *   node ace carrier:simulate A2B-7K3P9Q arrived
 *   node ace carrier:simulate A2B-7K3P9Q release 482915
 */
export default class SimulateCarrier extends BaseCommand {
  static commandName = 'carrier:simulate'
  static description = 'Act as a demo driver on a load (dev only): accept, loaded, arrived, release <code>'
  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'Load reference, e.g. A2B-7K3P9Q' })
  declare reference: string

  @args.string({ description: 'accept | loaded | arrived | release' })
  declare action: string

  @args.string({ description: 'Release code (for "release")', required: false })
  declare code?: string

  async run() {
    if (this.app.inProduction) {
      this.logger.error('carrier:simulate is disabled in production')
      this.exitCode = 1
      return
    }

    const { default: Load } = await import('#models/load')
    const { default: User } = await import('#models/user')
    const { default: DriverProfile } = await import('#models/driver_profile')
    const { acceptLoad, reportProgress } = await import('#services/load_service')
    const { releaseEscrow } = await import('#services/escrow_service')
    const { apiErrorMessageFor } = await import('#exceptions/domain_error')

    const load = await Load.findBy('reference', this.reference.toUpperCase())
    if (!load) {
      this.logger.error(`No load with reference ${this.reference}`)
      this.exitCode = 1
      return
    }

    const demo = DEMO_DRIVERS[load.market]
    const driver =
      (await User.findBy('phone', demo.phone)) ??
      (await User.create({ ...demo, role: 'driver', market: load.market, phoneVerifiedAt: DateTime.now() }))
    await DriverProfile.firstOrCreate(
      { userId: driver.id },
      { verificationStatus: 'VERIFIED', dutyStatus: 'AVAILABLE', completedTrips: 0 }
    )

    try {
      switch (this.action) {
        case 'accept':
          await acceptLoad(driver, load.id)
          break
        case 'loaded':
          await reportProgress(driver, load.id, 'IN_TRANSIT')
          break
        case 'arrived':
          await reportProgress(driver, load.id, 'DELIVERED')
          break
        case 'release':
          if (!this.code) throw new Error('Pass the 6-digit code: carrier:simulate <ref> release <code>')
          await releaseEscrow(driver, load.id, this.code)
          break
        default:
          throw new Error(`Unknown action "${this.action}". Use accept, loaded, arrived or release.`)
      }
    } catch (error) {
      this.logger.error(apiErrorMessageFor(error))
      this.exitCode = 1
      return
    }

    await load.refresh()
    this.logger.success(`${load.reference} is now ${load.status} (driver: ${driver.fullName})`)
  }
}
