import { PaymentEventSchema } from '#database/schema'

/** A webhook received from a payment provider; (provider, eventId) is unique, so retries are ignored. */
export default class PaymentEvent extends PaymentEventSchema {}
