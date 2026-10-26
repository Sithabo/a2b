/**
 * Minimal Twilio REST client (Programmable Messaging + Verify) over fetch,
 * so the API doesn't carry the full Twilio SDK.
 */
export interface TwilioCredentials {
  accountSid: string
  /** The account's auth token, or the secret of an API key when `apiKeySid` is set. */
  authToken: string
  apiKeySid?: string
}

export class TwilioError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Twilio's own error code, e.g. 60200 (invalid parameter) or 20404 (not found). */
    readonly twilioCode?: number
  ) {
    super(message)
  }
}

export default class TwilioClient {
  constructor(
    private readonly credentials: TwilioCredentials,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  get accountSid() {
    return this.credentials.accountSid
  }

  /** POSTs a form to a Twilio endpoint and returns the JSON body. */
  async post<T>(url: string, form: Record<string, string>): Promise<T> {
    const { accountSid, authToken, apiKeySid } = this.credentials
    const auth = Buffer.from(`${apiKeySid ?? accountSid}:${authToken}`).toString('base64')
    const response = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(form),
      signal: AbortSignal.timeout(10_000),
    })
    const body = (await response.json().catch(() => ({}))) as T & {
      message?: string
      code?: number
    }
    if (!response.ok) {
      throw new TwilioError(
        `Twilio request failed (${response.status}): ${body.message ?? 'no message'}`,
        response.status,
        body.code
      )
    }
    return body
  }
}
