import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import drive from '@adonisjs/drive/services/main'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { getMarket, type DriverReviewDecision, type MarketCode } from '@a2b/core'
import DriverDocument from '#models/driver_document'
import DriverProfile from '#models/driver_profile'
import DriverReview from '#models/driver_review'
import type User from '#models/user'
import DomainError from '#exceptions/domain_error'
import { notifyBySms } from '#services/sms/index'

/*
|--------------------------------------------------------------------------
| Driver verification (KYC)
|--------------------------------------------------------------------------
|
| A driver uploads the documents their market requires. Once every document
| and their licence number are in, they join the review queue (submitted_at).
| Staff mark them VERIFIED or REJECTED (with a note saying what to fix).
|
| Anything a review relied on changing — a document replaced, the licence
| number edited — sends the driver back to PENDING for a fresh review, so a
| VERIFIED badge always matches what staff actually saw.
|
*/

export const driverRequirements = (market: MarketCode) => getMarket(market).driverDocuments

async function driverProfileOf(driver: User, trx?: TransactionClientContract) {
  if (driver.role !== 'driver') throw DomainError.forbidden('Only drivers get verified')
  const profile = await DriverProfile.query({ client: trx })
    .where('user_id', driver.id)
    .if(trx, (q) => q.forUpdate())
    .first()
  if (!profile) throw DomainError.invalid('Add your licence details first', 'E_PROFILE_INCOMPLETE')
  return profile
}

/** Everything a review needs: each required document and the licence number. */
async function isComplete(
  profile: DriverProfile,
  market: MarketCode,
  trx: TransactionClientContract
) {
  if (!profile.licenseNumber) return false
  const uploaded = await DriverDocument.query({ client: trx })
    .where('driver_id', profile.userId)
    .select('requirement_id')
  const have = new Set(uploaded.map((d) => d.requirementId))
  return driverRequirements(market).every((r) => have.has(r.id))
}

/**
 * Call after anything a review looked at changes. Puts the driver back in
 * PENDING and (re)joins the queue if their submission is complete.
 */
export async function onVerificationInputChanged(
  profile: DriverProfile,
  market: MarketCode,
  trx: TransactionClientContract
) {
  profile.useTransaction(trx)
  const wasReviewed = profile.verificationStatus !== 'PENDING'
  const complete = await isComplete(profile, market, trx)
  profile.verificationStatus = 'PENDING'
  if (!complete) profile.submittedAt = null
  else if (wasReviewed || !profile.submittedAt) profile.submittedAt = DateTime.now()
  await profile.save()
}

/** Upload (or replace) the file for one of the market's driver documents. */
export async function uploadDriverDocument(
  driver: User,
  requirementId: string,
  file: MultipartFile
) {
  if (!driverRequirements(driver.market).some((r) => r.id === requirementId)) {
    throw DomainError.invalid('Unknown document type for this market', 'E_UNKNOWN_DOCUMENT')
  }
  const key = `drivers/${driver.id}/${requirementId}-${randomUUID()}.${file.extname}`
  // moveFromFs (not file.moveToDisk) keeps this compiling without Drive's MultipartFile augmentation
  await drive.use().moveFromFs(file.tmpPath!, key)

  const { document, replacedKey } = await db.transaction(async (trx) => {
    const profile = await driverProfileOf(driver, trx)
    const existing = await DriverDocument.query({ client: trx })
      .where('driver_id', driver.id)
      .where('requirement_id', requirementId)
      .first()
    const saved = await DriverDocument.updateOrCreate(
      { driverId: driver.id, requirementId },
      {
        fileKey: key,
        originalName: file.clientName,
        mimeType: `${file.type}/${file.subtype}`,
        sizeBytes: file.size,
      },
      { client: trx }
    )
    await onVerificationInputChanged(profile, driver.market, trx)
    return { document: saved, replacedKey: existing?.fileKey }
  })
  if (replacedKey) await drive.use().delete(replacedKey)
  return document
}

/** The driver's verification state with their market's checklist. */
export async function verificationSummary(driver: User) {
  const profile = await driverProfileOf(driver)
  const documents = await DriverDocument.query().where('driver_id', driver.id)
  return { profile, documents, requirements: driverRequirements(driver.market) }
}

/** Drivers waiting for review, oldest submission first. */
export function reviewQueue() {
  return DriverProfile.query()
    .where('verification_status', 'PENDING')
    .whereNotNull('submitted_at')
    .preload('user')
    .orderBy('submitted_at', 'asc')
}

/**
 * Staff decision on a driver. Verifying needs a complete submission;
 * rejecting needs a note telling the driver what to fix. The driver gets an SMS.
 */
export async function reviewDriver(
  driverId: number,
  decision: DriverReviewDecision,
  note: string | null,
  reviewerId: number | null
) {
  if (decision === 'REJECTED' && !note?.trim()) {
    throw DomainError.invalid('Tell the driver what to fix', 'E_INVALID')
  }
  const profile = await db.transaction(async (trx) => {
    const found = await DriverProfile.query({ client: trx })
      .where('user_id', driverId)
      .forUpdate()
      .preload('user')
      .first()
    if (!found) throw DomainError.notFound('Driver not found')
    if (decision === 'VERIFIED' && !found.submittedAt) {
      throw DomainError.conflict(
        "This driver hasn't uploaded every document yet",
        'E_DOCUMENTS_MISSING'
      )
    }
    found.useTransaction(trx)
    found.merge({
      verificationStatus: decision,
      reviewedAt: DateTime.now(),
      reviewedBy: reviewerId,
      reviewNote: decision === 'REJECTED' ? note!.trim() : null,
      // A rejected driver re-enters the queue when they upload replacements
      submittedAt: decision === 'REJECTED' ? null : found.submittedAt,
    })
    await found.save()
    await DriverReview.create(
      { driverId, reviewerId, decision, note: note?.trim() || null },
      { client: trx }
    )
    return found
  })

  await notifyBySms(
    profile.user.phone,
    decision === 'VERIFIED'
      ? 'Your A2B driver account is verified. You can now accept loads on your own.'
      : `We couldn't verify your A2B driver documents: ${profile.reviewNote}. Open the A2B Driver app to upload new ones.`
  )
  return profile
}
