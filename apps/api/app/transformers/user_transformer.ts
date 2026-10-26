import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'
import ShipperProfileTransformer from '#transformers/shipper_profile_transformer'
import DriverProfileTransformer from '#transformers/driver_profile_transformer'
import { avatarPathOf } from '#services/avatar_service'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'phone',
        'role',
        'market',
        'fullName',
        'email',
        'createdAt',
      ]),
      /** API path of their photo (show with AuthImage), or null. */
      avatarPath: avatarPathOf(this.resource),
      shipperProfile: ShipperProfileTransformer.transform(
        this.whenLoaded(this.resource.shipperProfile)
      ),
      driverProfile: DriverProfileTransformer.transform(
        this.whenLoaded(this.resource.driverProfile)
      ),
    }
  }
}
