import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Puts matched loads whose escrow wasn't funded in time back on the board.
 * Schedule it every minute, e.g. cron: `* * * * * cd /app && node ace escrow:expire`.
 */
export default class ExpireUnfunded extends BaseCommand {
  static commandName = 'escrow:expire'
  static description =
    'Return matched loads with unfunded escrow past their deadline to the load board'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { expireUnfundedLoads } = await import('#services/escrow_service')
    const expired = await expireUnfundedLoads()
    this.logger.info(`${expired} load(s) returned to the board`)
  }
}
