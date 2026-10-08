import vine from '@vinejs/vine'
import { bodyTypes, vehicleClasses } from '@a2b/core'

export const createFleetValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120),
  address: vine.string().trim().maxLength(255).nullable().optional(),
  taxId: vine.string().trim().maxLength(20).nullable().optional(),
  sizeTier: vine.enum(['1-5', '6-20', '20+'] as const),
  primaryCorridor: vine.string().trim().maxLength(120).nullable().optional(),
})

export const createVehicleValidator = vine.create({
  plate: vine.string().trim().minLength(3).maxLength(16),
  make: vine.string().trim().maxLength(60),
  model: vine.string().trim().maxLength(60),
  vehicleClass: vine.enum(Object.keys(vehicleClasses) as (keyof typeof vehicleClasses)[]),
  bodyType: vine.enum(Object.keys(bodyTypes) as (keyof typeof bodyTypes)[]),
  capacityTons: vine.number().positive().max(100),
  assignedDriverId: vine.number().withoutDecimals().nullable().optional(),
})

export const updateVehicleValidator = vine.create({
  assignedDriverId: vine.number().withoutDecimals().nullable().optional(),
  status: vine.enum(['ACTIVE', 'IDLE', 'MAINTENANCE'] as const).optional(),
})

export const addDriverValidator = vine.create({
  phone: vine.string().trim().minLength(8).maxLength(20),
  fullName: vine.string().trim().maxLength(120).nullable().optional(),
})
