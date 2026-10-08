import { BaseSchema } from '@adonisjs/lucid/schema'
import { LOAD_STATUSES } from '@a2b/core'

/** Append-only history of status changes (audit trail and tracking timeline). */
export default class extends BaseSchema {
  protected tableName = 'load_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('load_id')
        .unsigned()
        .notNullable()
        .references('loads.id')
        .onDelete('CASCADE')
        .index()
      table.enum('from_status', [...LOAD_STATUSES]).nullable()
      table.enum('to_status', [...LOAD_STATUSES]).notNullable()
      table.integer('actor_id').unsigned().nullable().references('users.id').onDelete('SET NULL')
      table.enum('actor_role', ['shipper', 'driver', 'fleet_owner', 'system']).notNullable()
      table.string('note').nullable()
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
