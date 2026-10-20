import type { Market } from './markets.ts';

/** Mobile money providers; each market lists the ones it offers (`market.mobileMoney`). */
export const MOBILE_MONEY_PROVIDERS = ['mtn', 'airtel', 'mmg'] as const;
export type MobileMoneyProvider = (typeof MOBILE_MONEY_PROVIDERS)[number];

/** How a shipper funds escrow and how a carrier is paid out. */
export const PAYMENT_METHODS = [...MOBILE_MONEY_PROVIDERS, 'card'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const paymentMethods: Record<PaymentMethod, { label: string }> = {
  mtn: { label: 'MTN Mobile Money' },
  airtel: { label: 'Airtel Money' },
  mmg: { label: 'MMG Mobile Money' },
  card: { label: 'Debit/credit card' },
};

/** Methods available in a market: its mobile money providers, plus cards everywhere. */
export const paymentMethodsFor = (market: Market): PaymentMethod[] => [
  ...market.mobileMoney.map((provider) => provider.id),
  'card',
];

export const isPaymentMethodAvailable = (method: PaymentMethod, market: Market) =>
  paymentMethodsFor(market).includes(method);

export const ESCROW_STATUSES = ['AWAITING_DEPOSIT', 'HELD', 'RELEASED', 'REFUNDED'] as const;
export type EscrowStatus = (typeof ESCROW_STATUSES)[number];

export const PAYMENT_KINDS = ['DEPOSIT', 'PAYOUT', 'REFUND'] as const;
export type PaymentKind = (typeof PAYMENT_KINDS)[number];

export const PAYMENT_STATUSES = ['PENDING', 'SUCCEEDED', 'FAILED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
