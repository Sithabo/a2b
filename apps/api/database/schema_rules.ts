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

/** bigint money columns, parsed to JS numbers in config/database.ts */
const money = t('number')

export default {
  columns: {
    market: t('MarketCode', 'MarketCode'),
  },
  tables: {
    users: { columns: { role: t('UserRole', 'UserRole') } },
    fleets: { columns: { size_tier: t('FleetSizeTier', 'FleetSizeTier') } },
    fleet_invites: { columns: { status: t('FleetInviteStatus', 'FleetInviteStatus') } },
    driver_profiles: {
      columns: {
        verification_status: t('DriverVerificationStatus', 'DriverVerificationStatus'),
        duty_status: t('DutyStatus', 'DutyStatus'),
      },
    },
    vehicles: {
      columns: {
        vehicle_class: t('VehicleClass', 'VehicleClass'),
        body_type: t('BodyType', 'BodyType'),
        status: t('VehicleStatus', 'VehicleStatus'),
      },
    },
    loads: {
      columns: {
        status: t('LoadStatus', 'LoadStatus'),
        cargo_type: t('CargoType', 'CargoType'),
        cargo: t('CargoDetails', 'CargoDetails'),
        offer_price: money,
      },
    },
    load_events: {
      columns: {
        from_status: t('LoadStatus | null', 'LoadStatus'),
        to_status: t('LoadStatus', 'LoadStatus'),
        actor_role: t('StatusActor', 'StatusActor'),
      },
    },
    escrows: {
      columns: {
        status: t('EscrowStatus', 'EscrowStatus'),
        deposit_method: t('PaymentMethod | null', 'PaymentMethod'),
        amount: money,
      },
    },
    payment_transactions: {
      columns: {
        kind: t('PaymentKind', 'PaymentKind'),
        method: t('PaymentMethod', 'PaymentMethod'),
        status: t('PaymentStatus', 'PaymentStatus'),
        raw: t('Record<string, unknown> | null'),
        amount: money,
      },
    },
  },
} satisfies SchemaRules
