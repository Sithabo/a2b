import type Vehicle from '#models/vehicle'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class VehicleTransformer extends BaseTransformer<Vehicle> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'plate',
      'make',
      'model',
      'vehicleClass',
      'bodyType',
      'capacityTons',
      'status',
      'assignedDriverId',
    ])
  }
}
