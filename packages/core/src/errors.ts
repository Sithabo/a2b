/**
 * Machine-readable codes the API sends in `{ errors: [{ message, code }] }`.
 * The API can only throw these, and apps can only branch on these, so a typo
 * or a renamed code fails to compile on both sides.
 */
export const API_ERROR_CODES = [
  // Generic
  'E_INVALID',
  'E_CONFLICT',
  'E_FORBIDDEN',
  'E_NOT_FOUND',
  'E_TOO_MANY_ATTEMPTS',

  // Sign-in and accounts
  'E_INVALID_PHONE',
  'E_UNSUPPORTED_MARKET',
  'E_OTP_EXPIRED',
  'E_OTP_INVALID',
  'E_ROLE_REQUIRED',
  'E_EMAIL_TAKEN',
  'E_PROFILE_INCOMPLETE',
  'E_LICENSE_REQUIRED',
  'E_INVALID_TAX_ID',
  'E_MARKET_MISMATCH',

  // Fleets, vehicles and drivers
  'E_FLEET_EXISTS',
  'E_INVALID_PLATE',
  'E_PLATE_TAKEN',
  'E_NOT_A_DRIVER',
  'E_DRIVER_NOT_IN_FLEET',
  'E_DRIVER_IN_OTHER_FLEET',
  'E_DRIVER_BUSY',
  'E_INVITE_CLOSED',

  // Loads
  'E_INVALID_TRANSITION',
  'E_VEHICLE_REQUIRED',
  'E_DOCUMENTS_MISSING',
  'E_UNKNOWN_DOCUMENT',

  // Escrow and payments
  'E_NO_ESCROW',
  'E_ALREADY_FUNDED',
  'E_NOT_HELD',
  'E_METHOD_UNAVAILABLE',
  'E_PAYMENT_FAILED',
  'E_PAYOUT_FAILED',
  'E_NO_RELEASE_CODE',
  'E_CODE_EXPIRED',
  'E_CODE_INVALID',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];
