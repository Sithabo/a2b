import { BaseSchema } from '@adonisjs/lucid/schema'
import { LOAD_STATUSES } from '@a2b/core'

/**
 * The public "index card" of a load — what carriers browse on the load board.
 * Exact addresses and contacts live in load_locations and unlock only after escrow is funded.
 */
export default class extends BaseSchema {
  protected tableName = 'loads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('reference', 12).notNullable().unique() // shown to users, e.g. "A2B-7K3P9Q"
      table
        .integer('shipper_id')
        .unsigned()
        .notNullable()
        .references('users.id')
        .onDelete('RESTRICT')
      table.enum('market', ['GY', 'UG']).notNullable()
      table
        .enum('status', [...LOAD_STATUSES])
        .notNullable()
        .defaultTo('DRAFT')

      // Carrier (set when MATCHED)
      table.integer('driver_id').unsigned().nullable().references('users.id').onDelete('SET NULL')
      table.integer('fleet_id').unsigned().nullable().references('fleets.id').onDelete('SET NULL')
      table
        .integer('vehicle_id')
        .unsigned()
        .nullable()
        .references('vehicles.id')
        .onDelete('SET NULL')

      // Public summary
      table.string('pickup_summary').notNullable()
      table.string('dropoff_summary').notNullable()
      table.boolean('is_import').notNullable().defaultTo(false)
      table.string('container_id').nullable()
      table
        .enum('cargo_type', [
          'GENERAL_CARGO',
          'FRAGILE_CARGO',
          'BULK_CARGO',
          'HEAVY_MACHINERY',
          'FOOD_BEVERAGE',
          'CHEMICALS_PHARMA',
        ])
        .notNullable()
      table.jsonb('cargo').notNullable() // CargoDetails from @a2b/core
      table.double('weight_kg').nullable()
      table.integer('offer_price').notNullable() // whole units of the market currency
      table.timestamp('ready_at').nullable()
      table.timestamp('deadline_at').nullable()

      // Lifecycle timestamps
      table.timestamp('posted_at').nullable()
      table.timestamp('matched_at').nullable()
      table.timestamp('secured_at').nullable()
      table.timestamp('in_transit_at').nullable()
      table.timestamp('delivered_at').nullable()
      table.timestamp('completed_at').nullable()
      table.timestamp('cancelled_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['market', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
