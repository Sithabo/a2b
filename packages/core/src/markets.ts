import type { StorageEnvironment, VehicleClass } from './domain.ts';
import { guyanaPlaces, ugandaPlaces, type MarketPlace } from './places.ts';
import type { MobileMoneyProvider } from './payments.ts';
import type { MarketTimezone } from './time.ts';
import { guyanaDocuments, ugandaDocuments, type DocumentRequirement } from './documents.ts';
import {
  guyanaDriverDocuments,
  ugandaDriverDocuments,
  type DriverDocumentRequirement,
} from './driver_documents.ts';

export type MarketCode = 'GY' | 'UG';

export interface RateCard {
  /** Per-km base rate for the trip calculator. */
  ratePerKm: number;
  ratePerTonKm: number;
  vehicleFees: Record<VehicleClass, number>;
  /** Starting point for the post-a-load offer slider before surcharges. */
  offerBase: number;
  /** Slider range around the recommended price. */
  offerRange: { below: number; above: number };
  surcharges: {
    importLicense: number;
    machineryConcession: number;
    flatbedRouteClearance: number;
    tipperGate: number;
    hazmatClearance: number;
    coldChain: Record<StorageEnvironment, number>;
  };
}

export interface Market {
  code: MarketCode;
  name: string;
  flag: string;
  currency: {
    code: string;
    /** Prices are whole units in both markets. */
    decimals: number;
    locale: string;
  };
  /** Local time for showing and entering times (fixed offset, no daylight saving). */
  timezone: MarketTimezone;
  phone: {
    callingCode: string;
    /** Digits after the calling code. */
    nationalLength: number;
    example: string;
  };
  taxId: {
    label: string;
    /** Short name of the issuing authority, e.g. "GRA". */
    issuer: string;
    authority: string;
    pattern: RegExp;
    hint: string;
  };
  mobileMoney: { id: MobileMoneyProvider; name: string }[];
  plate: {
    pattern: RegExp;
    example: string;
    /** false = format not yet confirmed against the licensing authority. */
    verified: boolean;
  };
  customsAuthority: string;
  documents: DocumentRequirement[];
  /** What a driver uploads to get verified. */
  driverDocuments: DriverDocumentRequirement[];
  /** Known places: suggestions, offline search results and customs zones. */
  places: MarketPlace[];
  /** The customs-controlled places (ports, border posts, airport cargo), for port detection. */
  customsZones: MarketPlace[];
  /**
   * PLACEHOLDER: both markets currently use the same numbers the shipper prototype had.
   * Calibrate per market (GYD vs UGX) before launch.
   */
  rates: RateCard;
}

const placeholderRates: RateCard = {
  ratePerKm: 1500,
  ratePerTonKm: 100,
  vehicleFees: { PICKUP: 50000, CANTER: 100000, LORRY: 200000, TRAILER: 400000 },
  offerBase: 150000,
  offerRange: { below: 20000, above: 30000 },
  surcharges: {
    importLicense: 10000,
    machineryConcession: 30000,
    flatbedRouteClearance: 15000,
    tipperGate: 10000,
    hazmatClearance: 45000,
    coldChain: { AMBIENT: 15000, CHILLED: 25000, FROZEN: 35000 },
  },
};

export const markets: Record<MarketCode, Market> = {
  GY: {
    code: 'GY',
    name: 'Guyana',
    flag: '🇬🇾',
    currency: { code: 'GYD', decimals: 0, locale: 'en-GY' },
    timezone: { name: 'America/Guyana', utcOffsetMinutes: -240, label: 'Guyana time (GYT, UTC−4)' },
    phone: { callingCode: '+592', nationalLength: 7, example: '600 1234' },
    taxId: { label: 'TIN', issuer: 'GRA', authority: 'Guyana Revenue Authority', pattern: /^\d{9}$/, hint: '9 digits' },
    mobileMoney: [{ id: 'mmg', name: 'MMG' }],
    plate: { pattern: /^[A-Z]{3}\s?\d{4}$/, example: 'GAB 1234', verified: false },
    customsAuthority: 'Guyana Revenue Authority (GRA)',
    documents: guyanaDocuments,
    driverDocuments: guyanaDriverDocuments,
    places: guyanaPlaces,
    customsZones: guyanaPlaces.filter((p) => p.isPort),
    rates: placeholderRates,
  },
  UG: {
    code: 'UG',
    name: 'Uganda',
    flag: '🇺🇬',
    currency: { code: 'UGX', decimals: 0, locale: 'en-UG' },
    timezone: { name: 'Africa/Kampala', utcOffsetMinutes: 180, label: 'Uganda time (EAT, UTC+3)' },
    phone: { callingCode: '+256', nationalLength: 9, example: '772 345 678' },
    taxId: { label: 'TIN', issuer: 'URA', authority: 'Uganda Revenue Authority', pattern: /^\d{10}$/, hint: '10 digits' },
    mobileMoney: [
      { id: 'mtn', name: 'MTN MoMo' },
      { id: 'airtel', name: 'Airtel Money' },
    ],
    plate: { pattern: /^U[A-Z]{2}\s?\d{3}[A-Z]$/, example: 'UBH 892K', verified: false },
    customsAuthority: 'Uganda Revenue Authority (URA)',
    documents: ugandaDocuments,
    driverDocuments: ugandaDriverDocuments,
    places: ugandaPlaces,
    customsZones: ugandaPlaces.filter((p) => p.isPort),
    rates: placeholderRates,
  },
};

export const MARKET_CODES = Object.keys(markets) as MarketCode[];

export const getMarket = (code: MarketCode): Market => markets[code];

export const isMarketCode = (value: unknown): value is MarketCode =>
  typeof value === 'string' && (MARKET_CODES as string[]).includes(value);

/** Best-effort market from a country name or ISO code (e.g. a profile's free-text region). */
export function marketFromCountry(country: string | undefined | null): MarketCode | undefined {
  if (!country) return undefined;
  const value = country.trim().toUpperCase();
  if (isMarketCode(value)) return value;
  return MARKET_CODES.find((code) => markets[code].name.toUpperCase() === value);
}
