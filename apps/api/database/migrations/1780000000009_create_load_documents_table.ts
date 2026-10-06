import { BaseSchema } from '@adonisjs/lucid/schema'

/** Customs documents attached to a load; requirement_id refers to the @a2b/core catalog. */
export default class extends BaseSchema {
  protected tableName = 'load_documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('load_id').unsigned().notNullable().references('loads.id').onDelete('CASCADE')
      table.string('requirement_id', 64).notNullable()
      table.string('file_key').notNullable()
      table.string('original_name').notNullable()
      table.string('mime_type', 100).notNullable()
      table.integer('size_bytes').notNullable()
      table
        .integer('uploaded_by')
        .unsigned()
        .notNullable()
        .references('users.id')
        .onDelete('RESTRICT')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['load_id', 'requirement_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
