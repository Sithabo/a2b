import vine from '@vinejs/vine'
import { DRIVER_REVIEW_DECISIONS } from '@a2b/core'

export const driverDocumentValidator = vine.create({
  requirementId: vine.string().trim().maxLength(64),
  file: vine.file({ size: '10mb', extnames: ['jpg', 'jpeg', 'png', 'heic', 'pdf'] }),
})

export const reviewDriverValidator = vine.create({
  decision: vine.enum(DRIVER_REVIEW_DECISIONS),
  /** Required when rejecting: what the driver should fix. */
  note: vine.string().trim().maxLength(500).nullable().optional(),
})

export const reviewQueueValidator = vine.create({
  status: vine.enum(['PENDING', 'VERIFIED', 'REJECTED'] as const).optional(),
})
