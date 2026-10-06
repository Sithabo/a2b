import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Everyone who signs in: shippers, drivers and fleet owners. Identity is the
 * phone number (verified by SMS OTP); there are no passwords.
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('phone', 20).notNullable().unique() // E.164
      table.enum('role', ['shipper', 'driver', 'fleet_owner', 'admin']).notNullable()
      table.enum('market', ['GY', 'UG']).notNullable()
      table.string('full_name').nullable()
      table.string('email', 254).nullable().unique()
      table.string('avatar_url').nullable()
      table.timestamp('phone_verified_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
