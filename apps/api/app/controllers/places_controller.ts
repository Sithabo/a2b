import type { HttpContext } from '@adonisjs/core/http'
import { placeDetailsValidator, placeSearchValidator } from '#validators/places'
import { placeDetailsFor, searchPlacesFor } from '#services/places_service'

/** Pickup and drop-off search, limited to the signed-in user's market. */
export default class PlacesController {
  async search({ auth, request }: HttpContext) {
    const { q, session } = await request.validateUsing(placeSearchValidator)
    return { data: await searchPlacesFor(auth.getUserOrFail().market, q ?? '', session) }
  }

  async details({ auth, request }: HttpContext) {
    const { id, session } = await request.validateUsing(placeDetailsValidator)
    return { data: await placeDetailsFor(auth.getUserOrFail().market, id, session) }
  }
}
