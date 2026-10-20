import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * A fleet owner asking a driver who already uses A2B to join their fleet.
 * The driver joins only when they accept; until then their loads and payouts
 * stay their own.
 */
export default class extends BaseSchema {
  protected tableName = 'fleet_invites'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('fleet_id').unsigned().notNullable().references('fleets.id').onDelete('CASCADE')
      table
        .integer('driver_id')
        .unsigned()
        .notNullable()
        .references('users.id')
        .onDelete('CASCADE')
        .index()
      table
        .enum('status', ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'])
        .notNullable()
        .defaultTo('PENDING')
      table.timestamp('responded_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // At most one open invite per fleet and driver
    this.schema.raw(
      `CREATE UNIQUE INDEX fleet_invites_one_pending ON ${this.tableName} (fleet_id, driver_id) WHERE status = 'PENDING'`
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
