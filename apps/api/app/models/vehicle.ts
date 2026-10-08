import { VehicleSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Vehicle extends VehicleSchema {
  @belongsTo(() => User, { foreignKey: 'assignedDriverId' })
  declare assignedDriver: BelongsTo<typeof User>
}
