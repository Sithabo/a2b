import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'
import ShipperProfileTransformer from '#transformers/shipper_profile_transformer'
import DriverProfileTransformer from '#transformers/driver_profile_transformer'

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
        'avatarUrl',
        'createdAt',
      ]),
      shipperProfile: ShipperProfileTransformer.transform(
        this.whenLoaded(this.resource.shipperProfile)
      ),
      driverProfile: DriverProfileTransformer.transform(
        this.whenLoaded(this.resource.driverProfile)
      ),
    }
  }
}
