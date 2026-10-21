import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import PaymentEvent from '#models/payment_event'
import PaymentTransaction from '#models/payment_transaction'
import { payments } from '#services/payments/index'
import { settleTransaction } from '#services/escrow_service'

/**
 * Payment providers confirm deposits, payouts and refunds here. Unsigned or
 * forged requests are rejected; each provider event is applied once, so the
 * provider can retry freely.
 */
export default class PaymentWebhooksController {
  async handle({ request, response }: HttpContext) {
    const rawBody = request.raw() ?? ''
    const event = payments.parseWebhook(
      rawBody,
      request.headers() as Record<string, string | undefined>
    )
    if (!event) return response.unauthorized({ errors: [{ message: 'Invalid signature' }] })

    const [record, isNew] = await PaymentEvent.query()
      .where('provider', payments.name)
      .where('event_id', event.eventId)
      .first()
      .then(async (existing) =>
        existing
          ? ([existing, false] as const)
          : ([
              await PaymentEvent.create({
                provider: payments.name,
                eventId: event.eventId,
                payload: event.raw,
              }),
              true,
            ] as const)
      )
    if (!isNew && record.processedAt) return { received: true, duplicate: true }

    const payment = await PaymentTransaction.query()
      .where('provider', payments.name)
      .where('provider_ref', event.providerRef)
      .first()
    if (!payment) {
      // Kept unprocessed: it may belong to a call whose direct response hasn't been stored yet
      logger.warn(
        { eventId: event.eventId, providerRef: event.providerRef },
        'webhook for unknown payment'
      )
      return response.accepted({ received: true })
    }

    await settleTransaction(payment.id, {
      status: event.status,
      providerRef: event.providerRef,
      raw: event.raw,
    })
    record.processedAt = DateTime.now()
    await record.save()
    return { received: true }
  }
}
