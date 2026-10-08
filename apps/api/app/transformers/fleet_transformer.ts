import type Fleet from '#models/fleet'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class FleetTransformer extends BaseTransformer<Fleet> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'market',
      'address',
      'taxId',
      'sizeTier',
      'primaryCorridor',
    ])
  }
}
