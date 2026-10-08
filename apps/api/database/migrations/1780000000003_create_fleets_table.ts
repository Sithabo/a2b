import { BaseSchema } from '@adonisjs/lucid/schema'

/** A carrier company. Owned by a fleet_owner user; drivers and vehicles belong to it. */
export default class extends BaseSchema {
  protected tableName = 'fleets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('owner_id').unsigned().notNullable().references('users.id').onDelete('RESTRICT')
      table.enum('market', ['GY', 'UG']).notNullable()
      table.string('name').notNullable()
      table.string('address').nullable()
      table.string('tax_id', 20).nullable()
      table.enum('size_tier', ['1-5', '6-20', '20+']).notNullable()
      table.string('primary_corridor').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
