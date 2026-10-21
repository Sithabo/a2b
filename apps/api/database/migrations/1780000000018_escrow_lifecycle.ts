import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Escrow lifecycle: matches that end before funding void their escrow (kept
 * for the payment history) instead of deleting it, unfunded matches have a
 * deadline, every provider call has its own reference, and provider webhooks
 * are recorded once each.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.raw('ALTER TABLE escrows DROP CONSTRAINT escrows_status_check')
    this.schema.raw(
      `ALTER TABLE escrows ADD CONSTRAINT escrows_status_check CHECK (status IN ('AWAITING_DEPOSIT', 'HELD', 'RELEASED', 'REFUNDED', 'VOID'))`
    )
    // One live escrow per load; voided ones stay as history
    this.schema.alterTable('escrows', (table) => {
      table.dropUnique(['load_id'])
      table.timestamp('funding_due_at').nullable()
    })
    this.schema.raw(
      `CREATE UNIQUE INDEX escrows_one_live_per_load ON escrows (load_id) WHERE status <> 'VOID'`
    )
    this.schema.alterTable('escrows', (table) => table.index(['load_id']))
    // Finds matches whose funding window has lapsed
    this.schema.raw(
      `CREATE INDEX escrows_awaiting_due ON escrows (funding_due_at) WHERE status = 'AWAITING_DEPOSIT'`
    )

    // Our reference for each provider call, so a retry is never mistaken for a duplicate
    this.schema.alterTable('payment_transactions', (table) => {
      table.string('reference', 64).nullable().unique()
    })

    this.schema.createTable('payment_events', (table) => {
      table.increments('id')
      table.string('provider', 32).notNullable()
      table.string('event_id').notNullable()
      table.jsonb('payload').notNullable()
      table.timestamp('processed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.unique(['provider', 'event_id'])
    })
  }

  async down() {
    this.schema.dropTable('payment_events')
    this.schema.alterTable('payment_transactions', (table) => table.dropColumn('reference'))
    this.schema.raw('DROP INDEX escrows_awaiting_due')
    this.schema.alterTable('escrows', (table) => table.dropIndex(['load_id']))
    this.schema.raw('DROP INDEX escrows_one_live_per_load')
    this.schema.raw(`DELETE FROM escrows WHERE status = 'VOID'`)
    this.schema.alterTable('escrows', (table) => {
      table.dropColumn('funding_due_at')
      table.unique(['load_id'])
    })
    this.schema.raw('ALTER TABLE escrows DROP CONSTRAINT escrows_status_check')
    this.schema.raw(
      `ALTER TABLE escrows ADD CONSTRAINT escrows_status_check CHECK (status IN ('AWAITING_DEPOSIT', 'HELD', 'RELEASED', 'REFUNDED'))`
    )
  }
}
