import logger from '@adonisjs/core/services/logger'
import {
  customsZoneAt,
  getMarket,
  searchPlaces,
  type MarketCode,
  type MarketPlace,
} from '@a2b/core'
import DomainError from '#exceptions/domain_error'
import { placesProvider } from '#services/places/index'
import type { PlaceResult, PlacesDriver } from '#services/places/places_driver'

const SUGGESTION_COUNT = 8
const MAX_RESULTS = 10
const CACHE_TTL_MS = 10 * 60_000
const CACHE_MAX_ENTRIES = 500

const fromCatalog = (p: MarketPlace): PlaceResult => ({
  id: `catalog:${p.id}`,
  name: p.name,
  address: p.region,
  isPort: p.isPort,
  latitude: p.latitude,
  longitude: p.longitude,
  source: 'catalog',
})

/**
 * Recent provider suggestions per market and query. Keystrokes repeat a lot
 * ("kam", "kamp"…), and each provider call costs money.
 */
const cache = new Map<string, { at: number; results: PlaceResult[] }>()

async function cachedAutocomplete(
  provider: PlacesDriver,
  market: MarketCode,
  query: string,
  sessionToken?: string
) {
  const key = `${market}:${query.toLowerCase()}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.results
  const results = await provider.autocomplete(query, market, sessionToken)
  if (cache.size >= CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value!)
  cache.set(key, { at: Date.now(), results })
  return results
}

/** Test hook: forget cached provider results. */
export const clearPlacesCache = () => cache.clear()

/**
 * Places matching what the shipper typed, in their market: our known places
 * (customs zones first) followed by the provider's suggestions. With fewer than
 * two characters, returns suggestions (customs zones, then towns).
 */
export async function searchPlacesFor(
  market: MarketCode,
  query: string,
  sessionToken?: string,
  provider: PlacesDriver | null = placesProvider
) {
  const known = getMarket(market).places
  const q = query.trim()
  if (q.length < 2) {
    return [...known]
      .sort((a, b) => Number(b.isPort) - Number(a.isPort))
      .slice(0, SUGGESTION_COUNT)
      .map(fromCatalog)
  }

  const fromUs = searchPlaces(known, q).map(fromCatalog)
  let fromProvider: PlaceResult[] = []
  if (provider) {
    try {
      fromProvider = await cachedAutocomplete(provider, market, q, sessionToken)
    } catch (error) {
      // Our own places still answer the search if the provider is down
      logger.error({ err: error }, 'place search provider failed')
    }
  }
  const names = new Set(fromUs.map((p) => p.name.toLowerCase()))
  return [...fromUs, ...fromProvider.filter((p) => !names.has(p.name.toLowerCase()))].slice(
    0,
    MAX_RESULTS
  )
}

/**
 * A picked place with coordinates. Provider places inside a customs zone are
 * flagged as port pickups, so the import flow starts for an address at the port
 * even when it wasn't picked from our list.
 */
export async function placeDetailsFor(
  market: MarketCode,
  id: string,
  sessionToken?: string,
  provider: PlacesDriver | null = placesProvider
) {
  const [source, placeId] = [id.slice(0, id.indexOf(':')), id.slice(id.indexOf(':') + 1)]
  const known = getMarket(market).places

  if (source === 'catalog') {
    const place = known.find((p) => p.id === placeId)
    if (!place) throw DomainError.notFound('Place not found')
    return fromCatalog(place)
  }
  if (!provider || source !== provider.name || !placeId)
    throw DomainError.notFound('Place not found')

  const place = await provider.details(placeId, market, sessionToken)
  if (!place || place.latitude === null || place.longitude === null) {
    throw DomainError.invalid(
      `This place isn't in ${getMarket(market).name}`,
      'E_UNSUPPORTED_MARKET'
    )
  }
  const zone = customsZoneAt(known, { latitude: place.latitude, longitude: place.longitude })
  return { ...place, isPort: !!zone }
}
