import { getMarket, marketFromPhone, type Market, type MarketCode } from '@a2b/core';
import { useSession } from '@/lib/session';

/** Used until a profile has loaded. */
const DEFAULT_MARKET: MarketCode = 'UG';

/** The signed-in shipper's market (from their account, which the API derives from their phone). */
export function useMarket(): Market {
  const user = useSession((s) => s.user);
  return getMarket(user?.market ?? (user?.phone ? marketFromPhone(user.phone) : undefined) ?? DEFAULT_MARKET);
}
