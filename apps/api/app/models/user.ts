import { UserSchema } from '#database/schema'
import { hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import ShipperProfile from '#models/shipper_profile'
import DriverProfile from '#models/driver_profile'

/** Anyone who signs in. Identity is the phone number; there are no passwords. */
export default class User extends UserSchema {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  @hasOne(() => ShipperProfile)
  declare shipperProfile: HasOne<typeof ShipperProfile>

  @hasOne(() => DriverProfile)
  declare driverProfile: HasOne<typeof DriverProfile>
}
