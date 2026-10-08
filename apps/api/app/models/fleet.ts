import { FleetSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import DriverProfile from '#models/driver_profile'
import Vehicle from '#models/vehicle'

export default class Fleet extends FleetSchema {
  @hasMany(() => Vehicle)
  declare vehicles: HasMany<typeof Vehicle>

  @hasMany(() => DriverProfile)
  declare drivers: HasMany<typeof DriverProfile>
}
