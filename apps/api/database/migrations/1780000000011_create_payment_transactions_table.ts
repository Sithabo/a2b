import { BaseSchema } from '@adonisjs/lucid/schema'

/** Money movements against an escrow, as reported by the payment provider. */
export default class extends BaseSchema {
  protected tableName = 'payment_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('escrow_id')
        .unsigned()
        .notNullable()
        .references('escrows.id')
        .onDelete('RESTRICT')
        .index()
      table.enum('kind', ['DEPOSIT', 'PAYOUT', 'REFUND']).notNullable()
      table.string('provider', 32).notNullable()
      table.string('method', 16).notNullable()
      table.string('provider_ref').nullable()
      table.integer('amount').notNullable()
      table.string('currency', 3).notNullable()
      table.enum('status', ['PENDING', 'SUCCEEDED', 'FAILED']).notNullable().defaultTo('PENDING')
      table.jsonb('raw').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['provider', 'provider_ref'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
