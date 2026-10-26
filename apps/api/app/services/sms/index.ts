import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import type { SmsDriver } from '#services/sms/sms_driver'
import LogSmsDriver from '#services/sms/log_sms_driver'
import TwilioSmsDriver from '#services/sms/twilio_sms_driver'
import { requireTwilio } from '#services/twilio/index'

const drivers = {
  log: () => new LogSmsDriver(),
  twilio: () => {
    const messagingServiceSid = env.get('TWILIO_MESSAGING_SERVICE_SID')
    const from = env.get('TWILIO_FROM')
    if (!messagingServiceSid && !from) {
      throw new Error('SMS_DRIVER=twilio needs TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM')
    }
    return new TwilioSmsDriver(
      requireTwilio('SMS_DRIVER=twilio'),
      messagingServiceSid ? { messagingServiceSid } : { from: from! }
    )
  },
} satisfies Record<string, () => SmsDriver>

export const sms: SmsDriver = drivers[env.get('SMS_DRIVER')]()

/**
 * For notifications sent after the work is saved (invites, verification
 * results): a failed text is logged, not reported to the caller as a failure.
 */
export async function notifyBySms(to: string, message: string) {
  try {
    await sms.send(to, message)
  } catch (error) {
    logger.error({ err: error, to }, '[sms] notification not sent')
  }
}
