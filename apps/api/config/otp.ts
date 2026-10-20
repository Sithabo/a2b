import env from '#start/env'

/**
 * Phone sign-in settings. Both dev conveniences are ignored in production
 * (see otp_service), so a staging box running NODE_ENV=development only
 * exposes codes if it is also explicitly configured to.
 */
const otpConfig = {
  /** Return the code in the /auth/otp response; only with the log SMS driver. */
  exposeCodes: env.get('OTP_EXPOSE_CODES', false) && env.get('SMS_DRIVER') === 'log',

  /** "+256700000001=123456,+5926000001=123456" → fixed codes, no SMS sent. */
  testNumbers: new Map(
    (env.get('OTP_TEST_NUMBERS') ?? '')
      .split(',')
      .filter(Boolean)
      .map((pair) => pair.trim().split('=') as [string, string])
  ),
}

export default otpConfig
