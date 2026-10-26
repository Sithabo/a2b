import env from '#start/env'
import TwilioClient from '#services/twilio/twilio_client'

/** Shared Twilio client, or null when no Twilio account is configured. */
function makeClient(): TwilioClient | null {
  const accountSid = env.get('TWILIO_ACCOUNT_SID')
  const authToken = env.get('TWILIO_AUTH_TOKEN')?.release()
  if (!accountSid || !authToken) return null
  return new TwilioClient({ accountSid, authToken, apiKeySid: env.get('TWILIO_API_KEY_SID') })
}

export const twilio = makeClient()

export function requireTwilio(feature: string): TwilioClient {
  if (!twilio) throw new Error(`${feature} needs TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN`)
  return twilio
}
