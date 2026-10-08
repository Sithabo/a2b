import logger from '@adonisjs/core/services/logger'
import type { SmsDriver } from '#services/sms/sms_driver'

/** Development driver: writes messages to the server log instead of sending them. */
export default class LogSmsDriver implements SmsDriver {
  async send(to: string, message: string) {
    logger.info({ to }, `[sms] ${message}`)
  }
}
