import { getMarket, marketFromCountry, marketFromPhone, type Market, type MarketCode } from '@a2b/core';
import { useAuthStore } from './useAuthStore';

/** Used until a profile has a market (e.g. sessions created before markets existed). */
const DEFAULT_MARKET: MarketCode = 'UG';

/** The signed-in user's market. */
export function useMarket(): Market {
  const profile = useAuthStore((state) => state.userProfile);
  const code =
    profile?.market ??
    marketFromCountry(profile?.region) ??
    (profile?.phone ? marketFromPhone(profile.phone) : undefined) ??
    DEFAULT_MARKET;
  return getMarket(code);
}
