import vine from '@vinejs/vine'

export const updateMeValidator = vine.create({
  fullName: vine.string().trim().maxLength(120).optional(),
  email: vine.string().trim().email().maxLength(254).optional(),
  avatarUrl: vine.string().url().optional(),
})

export const shipperProfileValidator = vine.create({
  companyName: vine.string().trim().minLength(2).maxLength(120),
  region: vine.string().trim().maxLength(120).nullable().optional(),
  isImporter: vine.boolean(),
  taxId: vine.string().trim().maxLength(20).nullable().optional(),
})

export const driverProfileValidator = vine.create({
  licenseNumber: vine.string().trim().maxLength(40),
  licenseClass: vine.string().trim().maxLength(10).optional(),
  dutyStatus: vine.enum(['AVAILABLE', 'OFF_DUTY'] as const).optional(),
})
