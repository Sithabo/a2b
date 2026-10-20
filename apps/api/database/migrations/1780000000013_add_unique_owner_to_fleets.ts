import { BaseSchema } from '@adonisjs/lucid/schema'

/** One fleet per owner, enforced by the database so a double-tap can't create two. */
export default class extends BaseSchema {
  protected tableName = 'fleets'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['owner_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['owner_id'])
    })
  }
}
