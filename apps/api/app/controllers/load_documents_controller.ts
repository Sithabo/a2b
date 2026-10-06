import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import drive from '@adonisjs/drive/services/main'
import { getMarket } from '@a2b/core'
import Load from '#models/load'
import LoadDocument from '#models/load_document'
import DomainError from '#exceptions/domain_error'
import LoadDocumentTransformer from '#transformers/load_document_transformer'
import { uploadDocumentValidator } from '#validators/load'
import { actorFor, canSeeLocation } from '#services/load_access'
import type User from '#models/user'

/** Documents are visible to the shipper, and to the carrier once escrow is funded (the customs pass). */
async function findForDocuments(id: number, user: User) {
  const load = await Load.find(id)
  if (!load || !(await canSeeLocation(load, user))) {
    throw new DomainError('Load not found', { status: 404, code: 'E_NOT_FOUND' })
  }
  return load
}

export default class LoadDocumentsController {
  async index({ auth, params, serialize }: HttpContext) {
    const load = await findForDocuments(Number(params.id), auth.getUserOrFail())
    const docs = await LoadDocument.query().where('load_id', load.id).orderBy('id')
    return serialize(LoadDocumentTransformer.transform(docs))
  }

  /** Upload (or replace) the file for one requirement from the market's document catalog. */
  async store({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const load = await findForDocuments(Number(params.id), user)
    if ((await actorFor(load, user)) !== 'shipper') throw DomainError.forbidden()
    if (load.status !== 'DRAFT')
      throw DomainError.conflict('Documents can only change while the load is a draft')

    const { requirementId, file } = await request.validateUsing(uploadDocumentValidator)
    if (!getMarket(load.market).documents.some((doc) => doc.id === requirementId)) {
      throw DomainError.invalid('Unknown document type for this market', 'E_UNKNOWN_DOCUMENT')
    }

    const key = `loads/${load.id}/${requirementId}-${randomUUID()}.${file.extname}`
    // moveFromFs (not file.moveToDisk) so this file type-checks without Drive's
    // MultipartFile augmentation — the apps compile it via @a2b/api-client.
    await drive.use().moveFromFs(file.tmpPath!, key)

    const existing = await LoadDocument.query()
      .where('load_id', load.id)
      .where('requirement_id', requirementId)
      .first()
    if (existing) await drive.use().delete(existing.fileKey)
    const doc = await LoadDocument.updateOrCreate(
      { loadId: load.id, requirementId },
      {
        fileKey: key,
        originalName: file.clientName,
        mimeType: `${file.type}/${file.subtype}`,
        sizeBytes: file.size,
        uploadedBy: user.id,
      }
    )
    response.status(201)
    return serialize(LoadDocumentTransformer.transform(doc))
  }

  /** Streams the file to an authorized viewer. */
  async download({ auth, params, response }: HttpContext) {
    const load = await findForDocuments(Number(params.id), auth.getUserOrFail())
    const doc = await LoadDocument.query()
      .where('load_id', load.id)
      .where('id', params.documentId)
      .first()
    if (!doc) throw new DomainError('Document not found', { status: 404, code: 'E_NOT_FOUND' })
    response.header('Content-Type', doc.mimeType)
    response.header(
      'Content-Disposition',
      `inline; filename="${doc.originalName.replace(/"/g, '')}"`
    )
    return response.stream(await drive.use().getStream(doc.fileKey))
  }
}
