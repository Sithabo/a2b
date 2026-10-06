import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { isMarketCode, type Market, type MarketCode } from './markets';

/** "150,000 UGX". Accepts the string prices the prototype stores. */
export function formatMoney(amount: number | string | null | undefined, market: Market, opts: { code?: boolean } = {}) {
  const value = typeof amount === 'string' ? Number(amount.replace(/,/g, '')) : (amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  const digits = safe.toLocaleString('en-US', {
    minimumFractionDigits: market.currency.decimals,
    maximumFractionDigits: market.currency.decimals,
  });
  return opts.code === false ? digits : `${digits} ${market.currency.code}`;
}

/** Returns the E.164 number (e.g. "+256772345678") or null if it isn't a valid mobile in this market. */
export function parsePhone(input: string, market: Market): string | null {
  const parsed = parsePhoneNumberFromString(input, market.code);
  return parsed?.isValid() ? parsed.number : null;
}

/** Market for an E.164 phone number, e.g. "+256772345678" → "UG". */
export function marketFromPhone(e164: string): MarketCode | undefined {
  const country = parsePhoneNumberFromString(e164)?.country;
  return isMarketCode(country) ? country : undefined;
}

export function isValidTaxId(value: string, market: Market): boolean {
  return market.taxId.pattern.test(value.replace(/\s|-/g, ''));
}

/** Uppercases and normalises spacing, e.g. "ubh892k" → "UBH 892K" for UG. */
export function normalizePlate(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/^([A-Z]+)(\d)/, '$1 $2');
}

export function isValidPlate(value: string, market: Market): boolean {
  return market.plate.pattern.test(normalizePlate(value));
}
