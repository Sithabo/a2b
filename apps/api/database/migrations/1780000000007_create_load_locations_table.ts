import { BaseSchema } from '@adonisjs/lucid/schema'

/** Exact addresses and contacts. Carriers can read this only once the load is SECURED or later. */
export default class extends BaseSchema {
  protected tableName = 'load_locations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('load_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('loads.id')
        .onDelete('CASCADE')
      table.string('pickup_address').notNullable()
      table.double('pickup_lat').nullable()
      table.double('pickup_lng').nullable()
      table.string('pickup_contact_name').nullable()
      table.string('pickup_contact_phone', 20).nullable()
      table.string('dropoff_address').notNullable()
      table.double('dropoff_lat').nullable()
      table.double('dropoff_lng').nullable()
      table.string('receiver_name').nullable()
      table.string('receiver_phone', 20).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
