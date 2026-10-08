import type DriverProfile from '#models/driver_profile'
import { BaseTransformer } from '@adonisjs/core/transformers'

/** A driver as seen by their fleet owner (profile + contact). Expects `user` preloaded. */
export default class FleetDriverTransformer extends BaseTransformer<DriverProfile> {
  toObject() {
    return {
      id: this.resource.userId,
      fullName: this.resource.user.fullName,
      phone: this.resource.user.phone,
      ...this.pick(this.resource, [
        'licenseClass',
        'verificationStatus',
        'dutyStatus',
        'ratingAvg',
        'completedTrips',
      ]),
    }
  }
}
