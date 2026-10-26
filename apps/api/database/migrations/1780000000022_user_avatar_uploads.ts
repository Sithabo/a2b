import { BaseSchema } from '@adonisjs/lucid/schema'

/** Profile photos are uploaded to the API and stored privately, like documents. */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('avatar_url', 'avatar_key')
    })
    // Old values were URLs the apps never set; nothing to carry over
    this.defer(async (db) => {
      await db.from(this.tableName).update({ avatar_key: null })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('avatar_key', 'avatar_url')
    })
  }
}
