import env from '#start/env'
import type { PlacesDriver } from '#services/places/places_driver'
import GooglePlacesDriver from '#services/places/google_places_driver'

/** The external search provider, or null to search only our curated catalog (dev and tests). */
function makeDriver(): PlacesDriver | null {
  if (env.get('PLACES_PROVIDER', 'catalog') !== 'google') return null
  const key = env.get('GOOGLE_MAPS_API_KEY')
  if (!key) throw new Error('PLACES_PROVIDER=google needs GOOGLE_MAPS_API_KEY')
  return new GooglePlacesDriver(key)
}

export const placesProvider: PlacesDriver | null = makeDriver()
