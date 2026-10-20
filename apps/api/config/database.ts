import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
import pg from 'pg'

/**
 * Read bigint (int8) columns as numbers rather than strings. Money columns are
 * bigint whole currency units, exact as JS numbers up to 9 quadrillion; this
 * also makes count(*) results numbers.
 */
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number.parseInt(value, 10))

const dbConfig = defineConfig({
  connection: 'pg',

  connections: {
    pg: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      schemaGeneration: {
        enabled: true,
        rulesPaths: ['./database/schema_rules.js'],
      },
      debug: app.inDev,
    },
  },
})

export default dbConfig
