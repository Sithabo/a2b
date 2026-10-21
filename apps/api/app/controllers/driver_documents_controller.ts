import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import DriverDocument from '#models/driver_document'
import DomainError from '#exceptions/domain_error'
import DriverDocumentTransformer from '#transformers/driver_document_transformer'
import { driverDocumentValidator } from '#validators/driver_verification'
import { uploadDriverDocument, verificationSummary } from '#services/driver_verification_service'

/** The signed-in driver's verification documents. */
export default class DriverDocumentsController {
  /**
   * What the driver has uploaded. The checklist itself is the market's
   * `driverDocuments` (in @a2b/core) and the review status is on their driver
   * profile (`GET /me`).
   */
  async index({ auth, serialize }: HttpContext) {
    const { documents } = await verificationSummary(auth.getUserOrFail())
    return serialize(DriverDocumentTransformer.transform(documents))
  }

  async store({ auth, request, response, serialize }: HttpContext) {
    const { requirementId, file } = await request.validateUsing(driverDocumentValidator)
    const document = await uploadDriverDocument(auth.getUserOrFail(), requirementId, file)
    response.status(201)
    return serialize(DriverDocumentTransformer.transform(document))
  }

  async download({ auth, params, response }: HttpContext) {
    const document = await DriverDocument.query()
      .where('id', params.id)
      .where('driver_id', auth.getUserOrFail().id)
      .first()
    if (!document) throw DomainError.notFound('Document not found')
    return streamDocument(document, response)
  }
}

export async function streamDocument(document: DriverDocument, response: HttpContext['response']) {
  response.header('Content-Type', document.mimeType)
  response.header(
    'Content-Disposition',
    `inline; filename="${document.originalName.replace(/"/g, '')}"`
  )
  // Identity documents: never cache them on shared devices or proxies
  response.header('Cache-Control', 'private, no-store')
  return response.stream(await drive.use().getStream(document.fileKey))
}
