import type DriverProfile from '#models/driver_profile'
import { BaseTransformer } from '@adonisjs/core/transformers'
import { avatarPathOf } from '#services/avatar_service'

/** A driver as seen by their fleet owner (profile + contact). Expects `user` preloaded. */
export default class FleetDriverTransformer extends BaseTransformer<DriverProfile> {
  toObject() {
    return {
      id: this.resource.userId,
      fullName: this.resource.user.fullName,
      phone: this.resource.user.phone,
      avatarPath: avatarPathOf(this.resource.user),
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
