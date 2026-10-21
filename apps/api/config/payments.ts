import env from '#start/env'

const paymentsConfig = {
  /** How long a shipper has to fund escrow after a carrier accepts, before the load goes back on the board. */
  fundingWindowMinutes: env.get('ESCROW_FUNDING_WINDOW_MINUTES', 240),
  /** Shared secret for verifying provider webhooks (the mock provider signs with it too). */
  webhookSecret: env.get('PAYMENT_WEBHOOK_SECRET'),
}

export default paymentsConfig
