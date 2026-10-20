import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Postgres doesn't index foreign keys on its own. These cover the lists the
 * apps page through (newest first) and every FK a delete has to check.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('loads', (table) => {
      // "My loads" for each kind of user, newest first
      table.index(['shipper_id', 'id'], 'loads_shipper_id_id_index')
      table.index(['driver_id', 'id'], 'loads_driver_id_id_index')
      table.index(['fleet_id', 'id'], 'loads_fleet_id_id_index')
      table.index(['vehicle_id'], 'loads_vehicle_id_index')
    })
    // The load board: open loads in a market, newest first
    this.schema.raw(
      `CREATE INDEX loads_open_board_index ON loads (market, id DESC) WHERE status = 'OPEN'`
    )

    this.schema.alterTable('driver_profiles', (table) => table.index(['fleet_id']))
    this.schema.alterTable('vehicles', (table) => {
      table.index(['fleet_id'])
      table.index(['owner_user_id'])
    })
    this.schema.alterTable('auth_access_tokens', (table) => table.index(['tokenable_id']))
    this.schema.alterTable('load_events', (table) => table.index(['actor_id']))
    this.schema.alterTable('load_documents', (table) => table.index(['uploaded_by']))
    this.schema.alterTable('fleet_invites', (table) => table.index(['fleet_id']))
  }

  async down() {
    this.schema.alterTable('loads', (table) => {
      table.dropIndex(['shipper_id', 'id'], 'loads_shipper_id_id_index')
      table.dropIndex(['driver_id', 'id'], 'loads_driver_id_id_index')
      table.dropIndex(['fleet_id', 'id'], 'loads_fleet_id_id_index')
      table.dropIndex(['vehicle_id'], 'loads_vehicle_id_index')
    })
    this.schema.raw('DROP INDEX loads_open_board_index')
    this.schema.alterTable('driver_profiles', (table) => table.dropIndex(['fleet_id']))
    this.schema.alterTable('vehicles', (table) => {
      table.dropIndex(['fleet_id'])
      table.dropIndex(['owner_user_id'])
    })
    this.schema.alterTable('auth_access_tokens', (table) => table.dropIndex(['tokenable_id']))
    this.schema.alterTable('load_events', (table) => table.dropIndex(['actor_id']))
    this.schema.alterTable('load_documents', (table) => table.dropIndex(['uploaded_by']))
    this.schema.alterTable('fleet_invites', (table) => table.dropIndex(['fleet_id']))
  }
}
