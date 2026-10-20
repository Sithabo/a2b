import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Money is whole units of the market currency. A 32-bit integer tops out at
 * about 2.1 billion, which a large UGX load (or any sum of them) can pass.
 * bigint is read back as a JS number (see config/database.ts), exact up to
 * 9 quadrillion.
 */
const MONEY_COLUMNS = [
  ['loads', 'offer_price'],
  ['escrows', 'amount'],
  ['payment_transactions', 'amount'],
] as const

export default class extends BaseSchema {
  async up() {
    for (const [tableName, column] of MONEY_COLUMNS) {
      this.schema.alterTable(tableName, (table) => {
        table.bigInteger(column).notNullable().alter()
      })
    }
  }

  async down() {
    for (const [tableName, column] of MONEY_COLUMNS) {
      this.schema.alterTable(tableName, (table) => {
        table.integer(column).notNullable().alter()
      })
    }
  }
}
