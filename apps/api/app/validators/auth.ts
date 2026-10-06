import vine from '@vinejs/vine'

const phone = () => vine.string().trim().minLength(8).maxLength(20)

export const requestOtpValidator = vine.create({
  phone: phone(),
})

export const verifyOtpValidator = vine.create({
  phone: phone(),
  code: vine
    .string()
    .fixedLength(6)
    .regex(/^\d{6}$/),
  /** Required the first time a number signs in; decides which app experience they get. */
  role: vine.enum(['shipper', 'driver', 'fleet_owner'] as const).optional(),
})
