/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Database
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  // Phone OTP
  SMS_DRIVER: Env.schema.enum(['log'] as const),
  /** Comma-separated "+256700000001=123456" pairs accepted without sending an SMS (dev/test only). */
  OTP_TEST_NUMBERS: Env.schema.string.optional(),
  /**
   * Return the code in the /auth/otp response so dev builds can show it on screen.
   * Only honoured with SMS_DRIVER=log and never in production.
   */
  OTP_EXPOSE_CODES: Env.schema.boolean.optional(),

  // Rate limiting — "database" in deployed environments, "memory" in tests
  LIMITER_STORE: Env.schema.enum.optional(['database', 'memory'] as const),

  // Escrow payments
  PAYMENT_DRIVER: Env.schema.enum(['mock'] as const),
  /** Verifies payment provider webhooks. Without it, webhooks are rejected. */
  PAYMENT_WEBHOOK_SECRET: Env.schema.string.optional(),
  /** Minutes a shipper has to fund escrow before the load returns to the board (default 240). */
  ESCROW_FUNDING_WINDOW_MINUTES: Env.schema.number.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs'] as const),

  // Place search: "catalog" uses only A2B's curated places; "google" adds Google Places
  PLACES_PROVIDER: Env.schema.enum.optional(['catalog', 'google'] as const),
  /** Server-side key with the Places API (New) enabled; never sent to the apps. */
  GOOGLE_MAPS_API_KEY: Env.schema.string.optional(),
})
