import { BaseSchema } from '@adonisjs/lucid/schema'

/** One-time SMS codes. Only a hash of the code is stored. */
export default class extends BaseSchema {
  protected tableName = 'phone_otps'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('phone', 20).notNullable().index()
      table.string('code_hash').notNullable()
      table.integer('attempts').notNullable().defaultTo(0)
      table.timestamp('expires_at').notNullable()
      table.timestamp('consumed_at').nullable()
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
