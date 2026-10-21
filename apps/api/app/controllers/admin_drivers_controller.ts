import type { HttpContext } from '@adonisjs/core/http'
import DriverDocument from '#models/driver_document'
import DriverProfile from '#models/driver_profile'
import DriverReview from '#models/driver_review'
import DomainError from '#exceptions/domain_error'
import DriverDocumentTransformer from '#transformers/driver_document_transformer'
import FleetDriverTransformer from '#transformers/fleet_driver_transformer'
import DriverProfileTransformer from '#transformers/driver_profile_transformer'
import { reviewDriverValidator, reviewQueueValidator } from '#validators/driver_verification'
import {
  driverRequirements,
  reviewDriver,
  reviewQueue,
} from '#services/driver_verification_service'
import { streamDocument } from '#controllers/driver_documents_controller'

/** Staff review of driver verification (admin role only). */
export default class AdminDriversController {
  /** The review queue (PENDING, oldest first), or drivers with another status. */
  async index({ request, serialize }: HttpContext) {
    const { status } = await request.validateUsing(reviewQueueValidator)
    const drivers =
      !status || status === 'PENDING'
        ? await reviewQueue()
        : await DriverProfile.query()
            .where('verification_status', status)
            .preload('user')
            .orderBy('reviewed_at', 'desc')
            .limit(100)
    return serialize(FleetDriverTransformer.transform(drivers))
  }

  /** One driver's licence details, documents against the checklist, and review history. */
  async show({ params, serialize }: HttpContext) {
    const profile = await DriverProfile.query().where('user_id', params.id).preload('user').first()
    if (!profile) throw DomainError.notFound('Driver not found')
    const documents = await DriverDocument.query().where('driver_id', profile.userId)
    const reviews = await DriverReview.query()
      .where('driver_id', profile.userId)
      .orderBy('id', 'desc')
    return serialize({
      driver: FleetDriverTransformer.transform(profile),
      profile: DriverProfileTransformer.transform(profile),
      requirements: driverRequirements(profile.user.market),
      documents: DriverDocumentTransformer.transform(documents),
      reviews: reviews.map((r) => ({
        decision: r.decision,
        note: r.note,
        reviewerId: r.reviewerId,
        createdAt: r.createdAt.toISO(),
      })),
    })
  }

  async document({ params, response }: HttpContext) {
    const document = await DriverDocument.query()
      .where('id', params.documentId)
      .where('driver_id', params.id)
      .first()
    if (!document) throw DomainError.notFound('Document not found')
    return streamDocument(document, response)
  }

  async review({ auth, params, request, serialize }: HttpContext) {
    const { decision, note } = await request.validateUsing(reviewDriverValidator)
    const profile = await reviewDriver(
      Number(params.id),
      decision,
      note ?? null,
      auth.getUserOrFail().id
    )
    return serialize(DriverProfileTransformer.transform(profile))
  }
}
