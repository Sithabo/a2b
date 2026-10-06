import env from '#start/env'
import type { SmsDriver } from '#services/sms/sms_driver'
import LogSmsDriver from '#services/sms/log_sms_driver'

const drivers = {
  log: () => new LogSmsDriver(),
} satisfies Record<string, () => SmsDriver>

export const sms: SmsDriver = drivers[env.get('SMS_DRIVER')]()
