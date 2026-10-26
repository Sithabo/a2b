import type { SmsDriver } from '#services/sms/sms_driver'
import type TwilioClient from '#services/twilio/twilio_client'

/**
 * Sends texts with Twilio Programmable Messaging, from a Messaging Service
 * (preferred: picks a sender per country) or a single number / alphanumeric ID.
 */
export default class TwilioSmsDriver implements SmsDriver {
  constructor(
    private readonly client: TwilioClient,
    private readonly sender: { messagingServiceSid: string } | { from: string }
  ) {}

  async send(to: string, message: string) {
    await this.client.post(
      `https://api.twilio.com/2010-04-01/Accounts/${this.client.accountSid}/Messages.json`,
      {
        To: to,
        Body: message,
        ...('messagingServiceSid' in this.sender
          ? { MessagingServiceSid: this.sender.messagingServiceSid }
          : { From: this.sender.from }),
      }
    )
  }
}
