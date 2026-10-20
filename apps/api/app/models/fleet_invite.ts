import { FleetInviteSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Fleet from '#models/fleet'
import User from '#models/user'

/** A fleet owner's request for an existing driver to join their fleet. */
export default class FleetInvite extends FleetInviteSchema {
  @belongsTo(() => Fleet)
  declare fleet: BelongsTo<typeof Fleet>

  @belongsTo(() => User, { foreignKey: 'driverId' })
  declare driver: BelongsTo<typeof User>
}
