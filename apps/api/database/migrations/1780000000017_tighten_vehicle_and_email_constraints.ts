import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // A driver drives one truck at a time; accepting a load picks "their" truck.
    this.schema.raw(
      `CREATE UNIQUE INDEX vehicles_one_truck_per_driver ON vehicles (assigned_driver_id) WHERE assigned_driver_id IS NOT NULL`
    )

    // Loads keep pointing at the truck that carried them, so deleting a fleet
    // or owner must not silently delete its trucks (and blank that history).
    this.schema.alterTable('vehicles', (table) => {
      table.dropForeign(['fleet_id'])
      table.dropForeign(['owner_user_id'])
      table.foreign('fleet_id').references('fleets.id').onDelete('RESTRICT')
      table.foreign('owner_user_id').references('users.id').onDelete('RESTRICT')
    })

    // Emails are compared without case: Ann@x.com and ann@x.com are one address.
    this.schema.alterTable('users', (table) => table.dropUnique(['email']))
    this.schema.raw(`CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email))`)
  }

  async down() {
    this.schema.raw('DROP INDEX users_email_lower_unique')
    this.schema.alterTable('users', (table) => table.unique(['email']))

    this.schema.alterTable('vehicles', (table) => {
      table.dropForeign(['fleet_id'])
      table.dropForeign(['owner_user_id'])
      table.foreign('fleet_id').references('fleets.id').onDelete('CASCADE')
      table.foreign('owner_user_id').references('users.id').onDelete('CASCADE')
    })

    this.schema.raw('DROP INDEX vehicles_one_truck_per_driver')
  }
}
