import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Staff tool until there's an admin app: lists drivers waiting for review, or
 * records a decision (the driver gets an SMS either way).
 *
 *   node ace drivers:review
 *   node ace drivers:review +256772000000 verify
 *   node ace drivers:review +256772000000 reject --note "Licence photo is blurry"
 */
export default class ReviewDrivers extends BaseCommand {
  static commandName = 'drivers:review'
  static description = 'List drivers awaiting verification, or verify / reject one'
  static options: CommandOptions = { startApp: true }

  @args.string({ description: "Driver's phone number", required: false })
  declare phone?: string

  @args.string({ description: 'verify | reject', required: false })
  declare decision?: string

  @flags.string({ description: 'Why the documents were rejected (shown to the driver)' })
  declare note?: string

  async run() {
    const { reviewDriver, reviewQueue } = await import('#services/driver_verification_service')
    const { default: User } = await import('#models/user')
    const { normalizePhone } = await import('#services/otp_service')

    if (!this.phone) {
      const queue = await reviewQueue()
      if (!queue.length) return this.logger.info('No drivers are waiting for review')
      const table = this.ui.table()
      table.head(['Phone', 'Name', 'Licence', 'Waiting since'])
      for (const p of queue) {
        table.row([
          p.user.phone,
          p.user.fullName ?? '—',
          p.licenseNumber ?? '—',
          p.submittedAt?.toRelative() ?? '—',
        ])
      }
      table.render()
      return
    }

    const decision =
      this.decision === 'verify' ? 'VERIFIED' : this.decision === 'reject' ? 'REJECTED' : null
    if (!decision) {
      this.logger.error('Say "verify" or "reject"')
      this.exitCode = 1
      return
    }
    const driver = await User.findBy('phone', normalizePhone(this.phone).phone)
    if (!driver) {
      this.logger.error('No account with that number')
      this.exitCode = 1
      return
    }
    try {
      await reviewDriver(driver.id, decision, this.note ?? null, null)
      this.logger.success(`${driver.phone} is now ${decision}; they've been sent an SMS`)
    } catch (error) {
      this.logger.error((error as Error).message)
      this.exitCode = 1
    }
  }
}
