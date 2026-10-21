import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import paymentsConfig from '#config/payments'
import type {
  PaymentDriver,
  PaymentRequest,
  PaymentResult,
  PaymentWebhookEvent,
} from '#services/payments/payment_driver'

/** Header carrying the hex HMAC-SHA256 of the raw body, signed with PAYMENT_WEBHOOK_SECRET. */
export const MOCK_SIGNATURE_HEADER = 'x-mock-signature'

export function signMockWebhook(rawBody: string, secret: string) {
  return createHmac('sha256', secret).update(rawBody).digest('hex')
}

/**
 * Simulated provider for development and tests: every collection, payout and
 * refund succeeds immediately. Webhooks are signed like a real provider's so
 * the webhook path can be exercised end to end.
 */
export default class MockPaymentDriver implements PaymentDriver {
  readonly name = 'mock'

  async collect(request: PaymentRequest): Promise<PaymentResult> {
    return this.#succeed('COLLECT', request)
  }

  async payout(request: PaymentRequest): Promise<PaymentResult> {
    return this.#succeed('PAYOUT', request)
  }

  async refund(request: PaymentRequest): Promise<PaymentResult> {
    return this.#succeed('REFUND', request)
  }

  parseWebhook(
    rawBody: string,
    headers: Record<string, string | undefined>
  ): PaymentWebhookEvent | null {
    const secret = paymentsConfig.webhookSecret
    const signature = headers[MOCK_SIGNATURE_HEADER]
    if (!secret || !signature) return null

    const expected = Buffer.from(signMockWebhook(rawBody, secret))
    const given = Buffer.from(signature)
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null

    const body = JSON.parse(rawBody) as { id?: string; providerRef?: string; status?: string }
    if (!body.id || !body.providerRef || (body.status !== 'SUCCEEDED' && body.status !== 'FAILED'))
      return null
    return { eventId: body.id, providerRef: body.providerRef, status: body.status, raw: body }
  }

  #succeed(kind: string, request: PaymentRequest): PaymentResult {
    return {
      status: 'SUCCEEDED',
      providerRef: `MOCK-${kind}-${randomUUID()}`,
      raw: {
        simulated: true,
        reference: request.reference,
        method: request.method,
        amount: request.amount,
      },
    }
  }
}
