import { randomUUID } from 'node:crypto'
import type {
  PaymentDriver,
  PaymentRequest,
  PaymentResult,
} from '#services/payments/payment_driver'

/**
 * Simulated provider for development and tests: every collection and payout
 * succeeds immediately.
 */
export default class MockPaymentDriver implements PaymentDriver {
  readonly name = 'mock'

  async collect(request: PaymentRequest): Promise<PaymentResult> {
    return this.#succeed('COLLECT', request)
  }

  async payout(request: PaymentRequest): Promise<PaymentResult> {
    return this.#succeed('PAYOUT', request)
  }

  #succeed(kind: string, request: PaymentRequest): PaymentResult {
    return {
      status: 'SUCCEEDED',
      providerRef: `MOCK-${kind}-${randomUUID()}`,
      raw: { simulated: true, method: request.method, amount: request.amount },
    }
  }
}
