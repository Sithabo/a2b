import { BaseSchema } from '@adonisjs/lucid/schema'

/** Trucks. Owned by a fleet, or by an owner-operator driver (owner_user_id). */
export default class extends BaseSchema {
  protected tableName = 'vehicles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('fleet_id').unsigned().nullable().references('fleets.id').onDelete('CASCADE')
      table
        .integer('owner_user_id')
        .unsigned()
        .nullable()
        .references('users.id')
        .onDelete('CASCADE')
      table
        .integer('assigned_driver_id')
        .unsigned()
        .nullable()
        .references('users.id')
        .onDelete('SET NULL')
      table.enum('market', ['GY', 'UG']).notNullable()
      table.string('plate', 16).notNullable()
      table.string('make').notNullable()
      table.string('model').notNullable()
      table.enum('vehicle_class', ['PICKUP', 'CANTER', 'LORRY', 'TRAILER']).notNullable()
      table
        .enum('body_type', [
          'DRY_BOX',
          'REFRIGERATED',
          'FLATBED',
          'LOWBOY',
          'TIPPER',
          'TANKER',
          'OPEN',
        ])
        .notNullable()
      table.double('capacity_tons').notNullable()
      table.enum('status', ['ACTIVE', 'IDLE', 'MAINTENANCE']).notNullable().defaultTo('IDLE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['market', 'plate'])
    })
    this.schema.raw(
      'ALTER TABLE vehicles ADD CONSTRAINT vehicles_has_owner CHECK (fleet_id IS NOT NULL OR owner_user_id IS NOT NULL)'
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
