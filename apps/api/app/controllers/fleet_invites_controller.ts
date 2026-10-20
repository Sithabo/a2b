import type { HttpContext } from '@adonisjs/core/http'
import FleetInviteTransformer from '#transformers/fleet_invite_transformer'
import { driverInvites, respondToInvite } from '#services/fleet_service'

/** A driver's view of the fleets inviting them to join. */
export default class FleetInvitesController {
  async index({ auth, serialize }: HttpContext) {
    return serialize(FleetInviteTransformer.transform(await driverInvites(auth.getUserOrFail())))
  }

  async accept({ auth, params, serialize }: HttpContext) {
    const invite = await respondToInvite(auth.getUserOrFail(), Number(params.id), true)
    return serialize(FleetInviteTransformer.transform(invite))
  }

  async decline({ auth, params, serialize }: HttpContext) {
    const invite = await respondToInvite(auth.getUserOrFail(), Number(params.id), false)
    return serialize(FleetInviteTransformer.transform(invite))
  }
}
