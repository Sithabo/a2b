import type { PaymentMethod } from '@a2b/core'

export type { PaymentMethod }

export interface PaymentRequest {
  /** Our escrow reference, sent to the provider for reconciliation. */
  reference: string
  amount: number
  currency: string
  method: PaymentMethod
  /** E.164 wallet number for mobile money. */
  phone: string
}

export interface PaymentResult {
  /**
   * SUCCEEDED/FAILED for providers that answer synchronously. Real mobile money
   * APIs usually return PENDING and confirm later via webhook.
   */
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED'
  providerRef: string
  raw?: Record<string, unknown>
}

/** A provider's notification that a payment we started has settled. */
export interface PaymentWebhookEvent {
  /** The provider's id for this notification; retries reuse it. */
  eventId: string
  /** Matches the providerRef we stored when the payment started. */
  providerRef: string
  status: 'SUCCEEDED' | 'FAILED'
  raw: Record<string, unknown>
}

/** A mobile money / card provider. One implementation per provider (MTN MoMo, Airtel, MMG, cards). */
export interface PaymentDriver {
  readonly name: string
  /** Pull the escrow deposit from the shipper. */
  collect(request: PaymentRequest): Promise<PaymentResult>
  /** Push the released escrow to the carrier. */
  payout(request: PaymentRequest): Promise<PaymentResult>
  /** Return a held deposit to the shipper. */
  refund(request: PaymentRequest): Promise<PaymentResult>
  /**
   * Verifies a webhook's signature and reads it. Returns null when the
   * signature is missing or wrong, so forged notifications are ignored.
   */
  parseWebhook(
    rawBody: string,
    headers: Record<string, string | undefined>
  ): PaymentWebhookEvent | null
}
