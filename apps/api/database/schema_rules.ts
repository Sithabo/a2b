import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

/**
 * Narrows generated column types to the shared domain types in @a2b/core,
 * so models, the API and the apps agree on every enum.
 */
const core = (...typeImports: string[]) => [{ source: '@a2b/core', typeImports }]
const t = (tsType: string, ...typeImports: string[]) => ({
  tsType,
  imports: typeImports.length ? core(...typeImports) : [],
  decorators: [{ name: '@column' }],
})

export default {
  columns: {
    market: t('MarketCode', 'MarketCode'),
  },
  tables: {
    users: { columns: { role: t('UserRole', 'UserRole') } },
    fleets: { columns: { size_tier: t("Fleet['sizeTier']", 'Fleet') } },
    driver_profiles: {
      columns: {
        verification_status: t("'PENDING' | 'VERIFIED' | 'REJECTED'"),
        duty_status: t("'AVAILABLE' | 'OFF_DUTY'"),
      },
    },
    vehicles: {
      columns: {
        vehicle_class: t('VehicleClass', 'VehicleClass'),
        body_type: t('BodyType', 'BodyType'),
        status: t("Vehicle['status']", 'Vehicle'),
      },
    },
    loads: {
      columns: {
        status: t('LoadStatus', 'LoadStatus'),
        cargo_type: t('CargoType', 'CargoType'),
        cargo: t('CargoDetails', 'CargoDetails'),
      },
    },
    load_events: {
      columns: {
        from_status: t('LoadStatus | null', 'LoadStatus'),
        to_status: t('LoadStatus', 'LoadStatus'),
        actor_role: t('StatusActor', 'StatusActor'),
      },
    },
    escrows: { columns: { status: t("'AWAITING_DEPOSIT' | 'HELD' | 'RELEASED' | 'REFUNDED'") } },
    payment_transactions: {
      columns: {
        kind: t("'DEPOSIT' | 'PAYOUT' | 'REFUND'"),
        status: t("'PENDING' | 'SUCCEEDED' | 'FAILED'"),
        raw: t('Record<string, unknown> | null'),
      },
    },
  },
} satisfies SchemaRules
