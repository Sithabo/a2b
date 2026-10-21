import type { MarketCode } from '@a2b/core'

/** A place as the apps see it: from our catalog or from the search provider. */
export interface PlaceResult {
  /** `catalog:<id>` or `<provider>:<id>`; pass back to /places/details. */
  id: string
  name: string
  /** Town, district or full address, shown under the name. */
  address: string
  /** Inside a customs zone (port, border post, airport cargo): starts the import flow. */
  isPort: boolean
  /** Search suggestions from a provider have no coordinates until /places/details. */
  latitude: number | null
  longitude: number | null
  source: 'catalog' | 'google'
}

/**
 * An external place-search provider. Calls run on the server (keys never ship
 * in the apps), restricted to the user's market. A session token groups one
 * search's keystrokes and the final details call (Google bills per session).
 */
export interface PlacesDriver {
  readonly name: 'google'
  autocomplete(query: string, market: MarketCode, sessionToken?: string): Promise<PlaceResult[]>
  /** Full place with coordinates, or null if it isn't in the market. */
  details(placeId: string, market: MarketCode, sessionToken?: string): Promise<PlaceResult | null>
}
