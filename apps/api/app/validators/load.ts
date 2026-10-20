import vine from '@vinejs/vine'
import {
  BULK_TYPES,
  CARGO_TYPES,
  CHEMICAL_CONTAINERS,
  MACHINERY_SECTORS,
  PAYMENT_METHODS,
  STORAGE_ENVIRONMENTS,
} from '@a2b/core'

/** One trillion whole units: far above any real load in GYD or UGX. */
export const MAX_OFFER_PRICE = 1_000_000_000_000

const place = () =>
  vine.object({
    address: vine.string().trim().minLength(3).maxLength(255),
    lat: vine.number().min(-90).max(90).nullable().optional(),
    lng: vine.number().min(-180).max(180).nullable().optional(),
    contactName: vine.string().trim().maxLength(120).nullable().optional(),
    contactPhone: vine.string().trim().maxLength(20).nullable().optional(),
  })

export const createLoadValidator = vine.create({
  pickupSummary: vine.string().trim().minLength(2).maxLength(255),
  dropoffSummary: vine.string().trim().minLength(2).maxLength(255),
  pickup: place(),
  dropoff: place(),
  isImport: vine.boolean(),
  containerId: vine.string().trim().maxLength(60).nullable().optional(),
  cargo: vine.object({
    type: vine.enum(CARGO_TYPES),
    weightKg: vine.number().positive().optional(),
    dimensions: vine
      .object({
        lengthMeters: vine.number().min(0),
        widthMeters: vine.number().min(0),
        heightMeters: vine.number().min(0),
      })
      .optional(),
    machinerySector: vine.enum(MACHINERY_SECTORS).optional(),
    requiresGoInvestWaiver: vine.boolean().optional(),
    bulkType: vine.enum(BULK_TYPES).optional(),
    volumeCubicMeters: vine.number().positive().optional(),
    requiresHydraulicTipper: vine.boolean().optional(),
    requiresFlatbedLowboy: vine.boolean().optional(),
    storageEnvironment: vine.enum(STORAGE_ENVIRONMENTS).optional(),
    chemicalContainer: vine.enum(CHEMICAL_CONTAINERS).optional(),
  }),
  weightKg: vine.number().positive().nullable().optional(),
  // Whole currency units; the cap only rejects typos and overflow
  offerPrice: vine.number().withoutDecimals().positive().max(MAX_OFFER_PRICE),
  readyAt: vine
    .date({ formats: ['iso8601'] })
    .nullable()
    .optional(),
  deadlineAt: vine
    .date({ formats: ['iso8601'] })
    .nullable()
    .optional(),
})

export const listLoadsValidator = vine.create({
  /** mine = loads you posted or carry; board = open loads in your market (carriers). */
  scope: vine.enum(['mine', 'board'] as const).optional(),
  page: vine.number().withoutDecimals().min(1).optional(),
})

export const acceptLoadValidator = vine.create({
  vehicleId: vine.number().withoutDecimals().optional(),
  driverId: vine.number().withoutDecimals().optional(),
})

export const cancelLoadValidator = vine.create({
  reason: vine.string().trim().maxLength(255).optional(),
})

export const progressValidator = vine.create({
  status: vine.enum(['IN_TRANSIT', 'DELIVERED'] as const),
})

export const depositValidator = vine.create({
  method: vine.enum(PAYMENT_METHODS),
})

export const releaseValidator = vine.create({
  code: vine.string().regex(/^\d{6}$/),
})

export const uploadDocumentValidator = vine.create({
  requirementId: vine.string().trim().maxLength(64),
  file: vine.file({ size: '10mb', extnames: ['jpg', 'jpeg', 'png', 'pdf', 'heic'] }),
})
