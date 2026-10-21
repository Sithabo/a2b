import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Driver KYC: the documents a driver uploads, when they're ready for review,
 * the latest decision on the profile, and every decision in a review log.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('driver_documents', (table) => {
      table.increments('id')
      table.integer('driver_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table.string('requirement_id', 64).notNullable() // from the market's driverDocuments catalog
      table.string('file_key').notNullable()
      table.string('original_name').notNullable()
      table.string('mime_type', 100).notNullable()
      table.integer('size_bytes').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['driver_id', 'requirement_id'])
    })

    this.schema.alterTable('driver_profiles', (table) => {
      /** Set when every required document and the licence number are in; the review queue's order. */
      table.timestamp('submitted_at').nullable()
      table.timestamp('reviewed_at').nullable()
      table
        .integer('reviewed_by')
        .unsigned()
        .nullable()
        .references('users.id')
        .onDelete('SET NULL')
        .index()
      /** Shown to the driver when they're rejected (what to fix). */
      table.string('review_note', 500).nullable()
    })
    this.schema.raw(
      `CREATE INDEX driver_profiles_review_queue ON driver_profiles (submitted_at) WHERE verification_status = 'PENDING' AND submitted_at IS NOT NULL`
    )

    this.schema.createTable('driver_reviews', (table) => {
      table.increments('id')
      table
        .integer('driver_id')
        .unsigned()
        .notNullable()
        .references('users.id')
        .onDelete('CASCADE')
        .index()
      table
        .integer('reviewer_id')
        .unsigned()
        .nullable()
        .references('users.id')
        .onDelete('SET NULL')
        .index()
      table.enum('decision', ['VERIFIED', 'REJECTED']).notNullable()
      table.string('note', 500).nullable()
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable('driver_reviews')
    this.schema.raw('DROP INDEX driver_profiles_review_queue')
    this.schema.alterTable('driver_profiles', (table) => {
      table.dropColumn('review_note')
      table.dropColumn('reviewed_by')
      table.dropColumn('reviewed_at')
      table.dropColumn('submitted_at')
    })
    this.schema.dropTable('driver_documents')
  }
}
