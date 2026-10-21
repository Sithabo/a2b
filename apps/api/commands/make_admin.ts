import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'

/**
 * Creates a staff (admin) account. Staff sign in with the SMS code like anyone
 * else; the admin role unlocks /api/v1/admin/*.
 *
 *   node ace user:admin +256772000000 --name "Grace (ops)"
 */
export default class MakeAdmin extends BaseCommand {
  static commandName = 'user:admin'
  static description = 'Create a staff account that can review drivers'
  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'Phone number in international format, e.g. +256772000000' })
  declare phone: string

  @flags.string({ description: 'Full name' })
  declare name?: string

  async run() {
    const { default: User } = await import('#models/user')
    const { normalizePhone } = await import('#services/otp_service')
    const { phone, market } = normalizePhone(this.phone)

    const existing = await User.findBy('phone', phone)
    if (existing && existing.role !== 'admin') {
      // Changing someone's role would strand their shipper/driver/fleet data
      this.logger.error(`${phone} already has a ${existing.role} account; use another number`)
      this.exitCode = 1
      return
    }
    if (existing) {
      this.logger.info(`${phone} is already an admin`)
      return
    }
    await User.create({
      phone,
      market,
      role: 'admin',
      fullName: this.name ?? null,
      phoneVerifiedAt: DateTime.now(),
    })
    this.logger.success(`Created admin ${phone}. They sign in with the SMS code.`)
  }
}
