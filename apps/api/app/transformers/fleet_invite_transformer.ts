import type FleetInvite from '#models/fleet_invite'
import { BaseTransformer } from '@adonisjs/core/transformers'

/** An invite as seen by either side. Expects `fleet` and `driver` preloaded. */
export default class FleetInviteTransformer extends BaseTransformer<FleetInvite> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'status',
        'fleetId',
        'driverId',
        'createdAt',
        'respondedAt',
      ]),
      fleetName: this.resource.fleet.name,
      driverName: this.resource.driver.fullName,
      driverPhone: this.resource.driver.phone,
    }
  }
}
