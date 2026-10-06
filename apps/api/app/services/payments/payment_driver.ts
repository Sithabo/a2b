export type PaymentMethod = 'mtn' | 'airtel' | 'mmg' | 'card'

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

/** A mobile money / card provider. One implementation per provider (MTN MoMo, Airtel, MMG, cards). */
export interface PaymentDriver {
  readonly name: string
  /** Pull the escrow deposit from the shipper. */
  collect(request: PaymentRequest): Promise<PaymentResult>
  /** Push the released escrow to the carrier. */
  payout(request: PaymentRequest): Promise<PaymentResult>
}
