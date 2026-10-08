import type LoadEvent from '#models/load_event'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class LoadEventTransformer extends BaseTransformer<LoadEvent> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'fromStatus',
      'toStatus',
      'actorRole',
      'note',
      'createdAt',
    ])
  }
}
