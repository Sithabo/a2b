import type ShipperProfile from '#models/shipper_profile'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ShipperProfileTransformer extends BaseTransformer<ShipperProfile> {
  toObject() {
    return this.pick(this.resource, ['companyName', 'region', 'isImporter', 'taxId'])
  }
}
