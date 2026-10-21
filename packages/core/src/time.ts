import type { Market } from './markets.ts';

/*
 * Times are stored as UTC instants (ISO strings from the API). People think in
 * their market's local time: a pickup "tomorrow at 8" in Kampala is 05:00 UTC.
 * Both markets keep a fixed UTC offset all year (no daylight saving), so the
 * offset is exact and the result doesn't depend on the phone's timezone or its
 * Intl support.
 */

export interface MarketTimezone {
  /** IANA name, e.g. "Africa/Kampala". */
  name: string;
  /** Minutes ahead of UTC (negative = behind). */
  utcOffsetMinutes: number;
  /** Shown next to time inputs, e.g. "Uganda time (EAT, UTC+3)". */
  label: string;
}

type Moment = Date | string | number;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** The wall-clock reading in the market at a moment. `month` is 0–11, `weekday` 0 (Sunday)–6. */
export function marketParts(at: Moment, market: Market) {
  const shifted = new Date(new Date(at).getTime() + market.timezone.utcOffsetMinutes * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

/** The moment a wall-clock time in the market happens (e.g. a picked pickup time). `month` is 0–11. */
export function marketDateTime(
  market: Market,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0
): Date {
  return new Date(Date.UTC(year, month, day, hour, minute) - market.timezone.utcOffsetMinutes * 60_000);
}

/**
 * Re-anchors a date/time picker's value (which shows the phone's local clock)
 * to the same wall-clock reading in the market.
 */
export const fromPickerValue = (value: Date, market: Market) =>
  marketDateTime(market, value.getFullYear(), value.getMonth(), value.getDate(), value.getHours(), value.getMinutes());

/** The reverse of `fromPickerValue`: a stored moment as a picker value showing the market's wall clock. */
export function toPickerValue(at: Moment, market: Market): Date {
  const p = marketParts(at, market);
  return new Date(p.year, p.month, p.day, p.hour, p.minute);
}

const clock = (hour: number, minute: number) =>
  `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`;

export type MarketTimeFormat = 'time' | 'date' | 'dayMonth' | 'dateTime' | 'weekdayDateTime';

/**
 * A moment in the market's local time:
 * - time: "1:21 pm"
 * - date: "7 Oct 2026"
 * - dayMonth: "7 Oct"
 * - dateTime: "7 Oct, 1:21 pm"
 * - weekdayDateTime: "Tue 7 Oct, 1:21 pm"
 * Missing values render as "—".
 */
export function formatMarketTime(
  at: Moment | null | undefined,
  market: Market,
  format: MarketTimeFormat = 'dateTime'
): string {
  if (at === null || at === undefined || at === '' || Number.isNaN(new Date(at).getTime())) return '—';
  const p = marketParts(at, market);
  const dayMonth = `${p.day} ${MONTHS[p.month]}`;
  switch (format) {
    case 'time':
      return clock(p.hour, p.minute);
    case 'date':
      return `${dayMonth} ${p.year}`;
    case 'dayMonth':
      return dayMonth;
    case 'dateTime':
      return `${dayMonth}, ${clock(p.hour, p.minute)}`;
    case 'weekdayDateTime':
      return `${WEEKDAYS[p.weekday]} ${dayMonth}, ${clock(p.hour, p.minute)}`;
  }
}
