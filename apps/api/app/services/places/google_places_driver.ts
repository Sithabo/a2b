import type { MarketCode } from '@a2b/core'
import type { PlaceResult, PlacesDriver } from '#services/places/places_driver'

const API = 'https://places.googleapis.com/v1'

interface AutocompleteResponse {
  suggestions?: {
    placePrediction?: {
      placeId: string
      text?: { text: string }
      structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } }
    }
  }[]
}

interface PlaceResponse {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  location?: { latitude: number; longitude: number }
  addressComponents?: { shortText?: string; types?: string[] }[]
}

/** Google Places API (New): Autocomplete + Place Details, limited to the market's country. */
export default class GooglePlacesDriver implements PlacesDriver {
  readonly name = 'google' as const

  constructor(
    private readonly apiKey: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async autocomplete(query: string, market: MarketCode, sessionToken?: string) {
    const response = await this.fetchImpl(`${API}/places:autocomplete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': this.apiKey },
      body: JSON.stringify({
        input: query,
        includedRegionCodes: [market.toLowerCase()],
        languageCode: 'en',
        ...(sessionToken ? { sessionToken } : {}),
      }),
    })
    if (!response.ok) throw new Error(`Google Places autocomplete failed (${response.status})`)
    const body = (await response.json()) as AutocompleteResponse
    return (body.suggestions ?? []).flatMap(({ placePrediction: p }): PlaceResult[] =>
      p
        ? [
            {
              id: `google:${p.placeId}`,
              name: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
              address: p.structuredFormat?.secondaryText?.text ?? '',
              isPort: false,
              latitude: null,
              longitude: null,
              source: 'google',
            },
          ]
        : []
    )
  }

  async details(placeId: string, market: MarketCode, sessionToken?: string) {
    const url = new URL(`${API}/places/${encodeURIComponent(placeId)}`)
    if (sessionToken) url.searchParams.set('sessionToken', sessionToken)
    const response = await this.fetchImpl(url, {
      headers: {
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,addressComponents',
      },
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Google Places details failed (${response.status})`)
    const body = (await response.json()) as PlaceResponse
    const country = body.addressComponents?.find((c) => c.types?.includes('country'))?.shortText
    if (!body.location || (country && country.toUpperCase() !== market)) return null
    return {
      id: `google:${body.id}`,
      name: body.displayName?.text ?? body.formattedAddress ?? '',
      address: body.formattedAddress ?? '',
      isPort: false,
      latitude: body.location.latitude,
      longitude: body.location.longitude,
      source: 'google' as const,
    }
  }
}
