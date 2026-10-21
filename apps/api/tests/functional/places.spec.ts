import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import GooglePlacesDriver from '#services/places/google_places_driver'
import type { PlaceResult, PlacesDriver } from '#services/places/places_driver'
import { clearPlacesCache, placeDetailsFor, searchPlacesFor } from '#services/places_service'
import { makeUser, dataOf } from '#tests/helpers'

/** Records what the driver sends and answers with canned Google responses. */
function fakeFetch(respond: (url: string, init?: RequestInit) => unknown, status = 200) {
  const calls: { url: string; init?: RequestInit }[] = []
  const impl = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init })
    return new Response(JSON.stringify(respond(String(url), init)), { status })
  }) as typeof fetch
  return { impl, calls }
}

/** A provider whose answers the test controls. */
function fakeProvider(overrides: Partial<PlacesDriver> = {}): PlacesDriver {
  return {
    name: 'google',
    autocomplete: async () => [],
    details: async () => null,
    ...overrides,
  }
}

const suggestion = (id: string, name: string): PlaceResult => ({
  id: `google:${id}`,
  name,
  address: 'Kampala, Uganda',
  isPort: false,
  latitude: null,
  longitude: null,
  source: 'google',
})

test.group('Place search (catalog)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('suggests the market’s customs zones first, and only that market', async ({
    client,
    assert,
  }) => {
    const ugandan = await makeUser('shipper', 'UG')
    const guyanese = await makeUser('shipper', 'GY')

    const ug = dataOf(await client.get('/api/v1/places').loginAs(ugandan))
    assert.isTrue(ug[0].isPort)
    assert.isTrue(ug.every((p: PlaceResult) => p.id.startsWith('catalog:ug_')))

    const gy = dataOf(await client.get('/api/v1/places').qs({ q: 'malaba' }).loginAs(guyanese))
    assert.lengthOf(gy, 0) // Malaba is in Uganda
  })

  test('finds known places and returns their coordinates', async ({ client, assert }) => {
    const shipper = await makeUser('shipper', 'UG')
    const [malaba] = dataOf(await client.get('/api/v1/places').qs({ q: 'malaba' }).loginAs(shipper))
    assert.equal(malaba.name, 'Malaba Border Post')
    assert.isTrue(malaba.isPort)

    const details = await client
      .get('/api/v1/places/details')
      .qs({ id: malaba.id })
      .loginAs(shipper)
    details.assertBodyContains({ data: { name: 'Malaba Border Post', isPort: true } })
    assert.isNumber(dataOf(details).latitude)

    ;(
      await client.get('/api/v1/places/details').qs({ id: 'catalog:nowhere' }).loginAs(shipper)
    ).assertStatus(404)
    // No provider configured in tests
    ;(
      await client.get('/api/v1/places/details').qs({ id: 'google:abc' }).loginAs(shipper)
    ).assertStatus(404)
  })

  test('needs a signed-in user', async ({ client }) => {
    ;(await client.get('/api/v1/places').qs({ q: 'kampala' })).assertStatus(401)
  })
})

test.group('Place search (provider)', (group) => {
  group.each.setup(() => clearPlacesCache())

  test('our places come first, then the provider’s, without duplicates', async ({ assert }) => {
    const provider = fakeProvider({
      autocomplete: async () => [
        suggestion('1', 'Malaba Border Post'),
        suggestion('2', 'Malaba Market'),
      ],
    })
    const results = await searchPlacesFor('UG', 'malaba', 'session-1', provider)
    assert.deepEqual(
      results.map((r) => r.name),
      ['Malaba Border Post', 'Malaba Market']
    )
    assert.equal(results[0].source, 'catalog')
  })

  test('a provider outage still returns our places', async ({ assert }) => {
    const provider = fakeProvider({
      autocomplete: async () => {
        throw new Error('quota exceeded')
      },
    })
    const results = await searchPlacesFor('UG', 'jinja', undefined, provider)
    assert.deepEqual(
      results.map((r) => r.name),
      ['Jinja']
    )
  })

  test('repeated keystrokes are served from the cache', async ({ assert }) => {
    let calls = 0
    const provider = fakeProvider({
      autocomplete: async () => {
        calls += 1
        return [suggestion('9', 'Nakawa Market')]
      },
    })
    await searchPlacesFor('UG', 'nakawa', undefined, provider)
    await searchPlacesFor('UG', 'Nakawa', undefined, provider)
    assert.equal(calls, 1)
  })

  test('an address inside a customs zone starts the import flow', async ({ assert }) => {
    const provider = fakeProvider({
      details: async () => ({
        ...suggestion('gate', 'Malaba Customs Yard'),
        latitude: 0.6372,
        longitude: 34.2705,
      }),
    })
    const atBorder = await placeDetailsFor('UG', 'google:gate', 's', provider)
    assert.isTrue(atBorder.isPort)

    const inTown = await placeDetailsFor(
      'UG',
      'google:town',
      's',
      fakeProvider({
        details: async () => ({
          ...suggestion('town', 'Shop'),
          latitude: 0.3476,
          longitude: 32.5825,
        }),
      })
    )
    assert.isFalse(inTown.isPort)
  })

  test('places outside the market are refused', async ({ assert }) => {
    await assert.rejects(
      () =>
        placeDetailsFor('UG', 'google:nairobi', 's', fakeProvider({ details: async () => null })),
      /isn't in Uganda/
    )
  })
})

test.group('Google Places driver', () => {
  test('autocomplete is limited to the market and keeps the key server-side', async ({
    assert,
  }) => {
    const { impl, calls } = fakeFetch(() => ({
      suggestions: [
        {
          placePrediction: {
            placeId: 'ChIJ123',
            text: { text: 'Nakasero Market, Kampala, Uganda' },
            structuredFormat: {
              mainText: { text: 'Nakasero Market' },
              secondaryText: { text: 'Kampala, Uganda' },
            },
          },
        },
      ],
    }))
    const driver = new GooglePlacesDriver('test-key', impl)
    const results = await driver.autocomplete('nakasero', 'UG', 'session-7')

    const body = JSON.parse(String(calls[0].init?.body))
    assert.deepEqual(body.includedRegionCodes, ['ug'])
    assert.equal(body.sessionToken, 'session-7')
    assert.equal((calls[0].init?.headers as Record<string, string>)['X-Goog-Api-Key'], 'test-key')
    assert.deepEqual(results, [
      {
        id: 'google:ChIJ123',
        name: 'Nakasero Market',
        address: 'Kampala, Uganda',
        isPort: false,
        latitude: null,
        longitude: null,
        source: 'google',
      },
    ])
  })

  test('details returns coordinates, and refuses another country', async ({ assert }) => {
    const place = (country: string) => ({
      id: 'ChIJ123',
      displayName: { text: 'Nakasero Market' },
      formattedAddress: 'Nakasero, Kampala, Uganda',
      location: { latitude: 0.317, longitude: 32.58 },
      addressComponents: [{ shortText: country, types: ['country', 'political'] }],
    })
    const ug = fakeFetch(() => place('UG'))
    const found = await new GooglePlacesDriver('k', ug.impl).details('ChIJ123', 'UG', 's1')
    assert.equal(found?.latitude, 0.317)
    assert.include(ug.calls[0].url, 'sessionToken=s1')
    assert.include(
      (ug.calls[0].init?.headers as Record<string, string>)['X-Goog-FieldMask'],
      'location'
    )

    const ke = fakeFetch(() => place('KE'))
    assert.isNull(await new GooglePlacesDriver('k', ke.impl).details('ChIJ123', 'UG'))
  })

  test('provider errors surface instead of returning nothing', async ({ assert }) => {
    const { impl } = fakeFetch(() => ({ error: 'denied' }), 403)
    await assert.rejects(() => new GooglePlacesDriver('k', impl).autocomplete('x y', 'UG'), /403/)
  })
})
