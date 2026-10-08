import env from '#start/env'
import type { PaymentDriver } from '#services/payments/payment_driver'
import MockPaymentDriver from '#services/payments/mock_payment_driver'

const drivers = {
  mock: () => new MockPaymentDriver(),
} satisfies Record<string, () => PaymentDriver>

export const payments: PaymentDriver = drivers[env.get('PAYMENT_DRIVER')]()
