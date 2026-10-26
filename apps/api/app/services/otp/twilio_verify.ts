import type TwilioClient from '#services/twilio/twilio_client'
import { TwilioError } from '#services/twilio/twilio_client'

export type VerifyCheckResult = 'approved' | 'invalid' | 'expired'

/**
 * Twilio Verify: Twilio generates, sends and checks the code. It routes per
 * country itself, and US verification texts don't need A2P 10DLC registration.
 */
export default class TwilioVerify {
  constructor(
    private readonly client: TwilioClient,
    private readonly serviceSid: string
  ) {}

  private url(path: string) {
    return `https://verify.twilio.com/v2/Services/${this.serviceSid}/${path}`
  }

  async start(phone: string) {
    await this.client.post(this.url('Verifications'), { To: phone, Channel: 'sms' })
  }

  async check(phone: string, code: string): Promise<VerifyCheckResult> {
    try {
      const body = await this.client.post<{ status: string }>(this.url('VerificationCheck'), {
        To: phone,
        Code: code,
      })
      return body.status === 'approved' ? 'approved' : 'invalid'
    } catch (error) {
      // 404: no pending verification (expired, already used or cancelled); 429: too many checks
      if (error instanceof TwilioError && (error.status === 404 || error.status === 429)) {
        return 'expired'
      }
      throw error
    }
  }
}
