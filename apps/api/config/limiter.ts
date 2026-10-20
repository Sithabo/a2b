import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  default: env.get('LIMITER_STORE', 'database'),
  stores: {
    /** Shared across API instances; table created by the rate_limits migration. */
    database: stores.database({ tableName: 'rate_limits' }),
    /** Per-process; used by the test suite. */
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
