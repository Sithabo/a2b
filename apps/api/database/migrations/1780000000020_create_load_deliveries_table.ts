import { BaseSchema } from '@adonisjs/lucid/schema'

/** Proof of delivery: who received the cargo and a photo of it, taken by the driver at drop-off. */
export default class extends BaseSchema {
  protected tableName = 'load_deliveries'

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
      table.string('receiver_name', 120).notNullable()
      table.string('photo_key').notNullable()
      table.string('photo_mime_type', 100).notNullable()
      table.integer('photo_size_bytes').notNullable()
      table
        .integer('delivered_by')
        .unsigned()
        .nullable()
        .references('users.id')
        .onDelete('SET NULL')
        .index()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
