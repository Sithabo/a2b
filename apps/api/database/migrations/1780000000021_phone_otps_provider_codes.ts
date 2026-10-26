import { BaseSchema } from '@adonisjs/lucid/schema'

/** Codes sent with Twilio Verify are kept by Twilio, so those rows have no hash. */
export default class extends BaseSchema {
  protected tableName = 'phone_otps'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('code_hash').nullable().alter()
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.from(this.tableName).whereNull('code_hash').delete()
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.string('code_hash').notNullable().alter()
    })
  }
}
