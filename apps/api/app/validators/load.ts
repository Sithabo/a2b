import vine from '@vinejs/vine'

const place = () =>
  vine.object({
    address: vine.string().trim().minLength(3).maxLength(255),
    lat: vine.number().min(-90).max(90).nullable().optional(),
    lng: vine.number().min(-180).max(180).nullable().optional(),
    contactName: vine.string().trim().maxLength(120).nullable().optional(),
    contactPhone: vine.string().trim().maxLength(20).nullable().optional(),
  })

const cargoTypes = [
  'GENERAL_CARGO',
  'FRAGILE_CARGO',
  'BULK_CARGO',
  'HEAVY_MACHINERY',
  'FOOD_BEVERAGE',
  'CHEMICALS_PHARMA',
] as const

export const createLoadValidator = vine.create({
  pickupSummary: vine.string().trim().minLength(2).maxLength(255),
  dropoffSummary: vine.string().trim().minLength(2).maxLength(255),
  pickup: place(),
  dropoff: place(),
  isImport: vine.boolean(),
  containerId: vine.string().trim().maxLength(60).nullable().optional(),
  cargo: vine.object({
    type: vine.enum(cargoTypes),
    weightKg: vine.number().positive().optional(),
    machinerySector: vine
      .enum([
        'AGRICULTURE',
        'MINING',
        'CONSTRUCTION',
        'FORESTRY',
        'MANUFACTURING',
        'OTHER',
      ] as const)
      .optional(),
    requiresGoInvestWaiver: vine.boolean().optional(),
    bulkType: vine.enum(['DRY_BULK', 'LIQUID_BULK'] as const).optional(),
    volumeCubicMeters: vine.number().positive().optional(),
    requiresHydraulicTipper: vine.boolean().optional(),
    requiresFlatbedLowboy: vine.boolean().optional(),
    storageEnvironment: vine.enum(['AMBIENT', 'CHILLED', 'FROZEN'] as const).optional(),
    chemicalContainer: vine.enum(['TANKER', 'IBC_TOTES', 'DRUMS', 'PALLETS'] as const).optional(),
  }),
  weightKg: vine.number().positive().nullable().optional(),
  offerPrice: vine.number().withoutDecimals().positive(),
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
  method: vine.enum(['mtn', 'airtel', 'mmg', 'card'] as const),
})

export const releaseValidator = vine.create({
  code: vine.string().regex(/^\d{6}$/),
})

export const uploadDocumentValidator = vine.create({
  requirementId: vine.string().trim().maxLength(64),
  file: vine.file({ size: '10mb', extnames: ['jpg', 'jpeg', 'png', 'pdf', 'heic'] }),
})
