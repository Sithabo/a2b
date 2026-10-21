import type DriverDocument from '#models/driver_document'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class DriverDocumentTransformer extends BaseTransformer<DriverDocument> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'requirementId',
      'originalName',
      'mimeType',
      'sizeBytes',
      'updatedAt',
    ])
  }
}
