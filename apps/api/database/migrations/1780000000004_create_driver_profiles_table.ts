import { BaseSchema } from '@adonisjs/lucid/schema'

/** Driver-specific data. fleet_id is null for independent owner-operators. */
export default class extends BaseSchema {
  protected tableName = 'driver_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('users.id')
        .onDelete('CASCADE')
      table.integer('fleet_id').unsigned().nullable().references('fleets.id').onDelete('SET NULL')
      table.string('license_number').nullable()
      table.string('license_class').nullable()
      table
        .enum('verification_status', ['PENDING', 'VERIFIED', 'REJECTED'])
        .notNullable()
        .defaultTo('PENDING')
      table.enum('duty_status', ['AVAILABLE', 'OFF_DUTY']).notNullable().defaultTo('OFF_DUTY')
      table.double('rating_avg').nullable()
      table.integer('completed_trips').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
