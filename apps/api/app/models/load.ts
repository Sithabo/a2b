import { LoadSchema } from '#database/schema'
import { belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Vehicle from '#models/vehicle'
import Escrow from '#models/escrow'
import LoadDocument from '#models/load_document'
import LoadEvent from '#models/load_event'
import LoadLocation from '#models/load_location'

export default class Load extends LoadSchema {
  @belongsTo(() => User, { foreignKey: 'shipperId' })
  declare shipper: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'driverId' })
  declare driver: BelongsTo<typeof User>

  @belongsTo(() => Vehicle)
  declare vehicle: BelongsTo<typeof Vehicle>

  @hasOne(() => LoadLocation)
  declare location: HasOne<typeof LoadLocation>

  @hasOne(() => Escrow)
  declare escrow: HasOne<typeof Escrow>

  @hasMany(() => LoadEvent)
  declare events: HasMany<typeof LoadEvent>

  @hasMany(() => LoadDocument)
  declare documents: HasMany<typeof LoadDocument>
}
