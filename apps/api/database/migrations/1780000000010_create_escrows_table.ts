import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * One escrow per matched load. Funds are held from deposit until the driver enters the
 * shipper's 6-digit release code (stored only as a hash).
 */
export default class extends BaseSchema {
  protected tableName = 'escrows'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('load_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('loads.id')
        .onDelete('RESTRICT')
      table.integer('amount').notNullable()
      table.string('currency', 3).notNullable()
      table
        .enum('status', ['AWAITING_DEPOSIT', 'HELD', 'RELEASED', 'REFUNDED'])
        .notNullable()
        .defaultTo('AWAITING_DEPOSIT')
      table.string('deposit_method', 16).nullable() // mtn | airtel | mmg | card
      table.string('release_code_hash').nullable()
      table.timestamp('release_code_expires_at').nullable()
      table.integer('release_attempts').notNullable().defaultTo(0)
      table.timestamp('held_at').nullable()
      table.timestamp('released_at').nullable()
      table.timestamp('refunded_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
