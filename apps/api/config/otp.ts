import env from '#start/env'
import { isMarketCode, type MarketCode } from '@a2b/core'

/** "+256700000001=123456,+5926000001=123456" → Map of phone → value. */
function pairs(value: string | undefined) {
  return new Map(
    (value ?? '')
      .split(',')
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => pair.split('=').map((part) => part.trim()) as [string, string])
  )
}

function testerMarkets(value: string | undefined) {
  const map = new Map<string, MarketCode>()
  for (const [phone, market] of pairs(value)) {
    if (!isMarketCode(market)) {
      throw new Error(`OTP_TESTER_PHONES: "${market}" for ${phone} is not a market (GY or UG)`)
    }
    map.set(phone, market)
  }
  return map
}

/**
 * Phone sign-in settings. Both dev conveniences are ignored in production
 * (see otp_service), so a staging box running NODE_ENV=development only
 * exposes codes if it is also explicitly configured to.
 */
const otpConfig = {
  /**
   * Who sends and checks codes: "local" generates them here and texts them
   * with SMS_DRIVER; "twilio_verify" hands both jobs to Twilio Verify.
   */
  driver: env.get('OTP_DRIVER', 'local'),

  /** Return the code in the /auth/otp response; only with local codes and the log SMS driver. */
  exposeCodes:
    env.get('OTP_EXPOSE_CODES', false) &&
    env.get('OTP_DRIVER', 'local') === 'local' &&
    env.get('SMS_DRIVER') === 'log',

  /** "+256700000001=123456,+5926000001=123456" → fixed codes, no SMS sent. */
  testNumbers: pairs(env.get('OTP_TEST_NUMBERS')),

  /**
   * "+14055550123=UG" → real numbers outside A2B's markets that may sign in
   * anyway (e.g. the team testing from the US), and the market their account
   * belongs to. They get real codes, so this works in production too.
   */
  testerMarkets: testerMarkets(env.get('OTP_TESTER_PHONES')),
}

export default otpConfig
