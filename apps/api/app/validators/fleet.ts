import vine from '@vinejs/vine'
import { BODY_TYPES, FLEET_SIZE_TIERS, VEHICLE_CLASSES, VEHICLE_STATUSES } from '@a2b/core'

export const createFleetValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120),
  address: vine.string().trim().maxLength(255).nullable().optional(),
  taxId: vine.string().trim().maxLength(20).nullable().optional(),
  sizeTier: vine.enum(FLEET_SIZE_TIERS),
  primaryCorridor: vine.string().trim().maxLength(120).nullable().optional(),
})

export const createVehicleValidator = vine.create({
  plate: vine.string().trim().minLength(3).maxLength(16),
  make: vine.string().trim().maxLength(60),
  model: vine.string().trim().maxLength(60),
  vehicleClass: vine.enum(VEHICLE_CLASSES),
  bodyType: vine.enum(BODY_TYPES),
  capacityTons: vine.number().positive().max(100),
  assignedDriverId: vine.number().withoutDecimals().positive().nullable().optional(),
})

export const updateVehicleValidator = vine.create({
  assignedDriverId: vine.number().withoutDecimals().positive().nullable().optional(),
  status: vine.enum(VEHICLE_STATUSES).optional(),
})

export const addDriverValidator = vine.create({
  phone: vine.string().trim().minLength(8).maxLength(20),
  fullName: vine.string().trim().maxLength(120).nullable().optional(),
})
