import type DriverProfile from '#models/driver_profile'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class DriverProfileTransformer extends BaseTransformer<DriverProfile> {
  toObject() {
    return this.pick(this.resource, [
      'fleetId',
      'licenseNumber',
      'licenseClass',
      'verificationStatus',
      'dutyStatus',
      'ratingAvg',
      'completedTrips',
    ])
  }
}
