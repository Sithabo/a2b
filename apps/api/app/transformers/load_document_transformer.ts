import type LoadDocument from '#models/load_document'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class LoadDocumentTransformer extends BaseTransformer<LoadDocument> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'requirementId',
      'originalName',
      'mimeType',
      'sizeBytes',
      'createdAt',
    ])
  }
}
