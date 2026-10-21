/**
 * Domain vocabulary shared by the API (validators, database checks, models)
 * and every app. Each enum is a const list; its type is derived from the list
 * so the two can't drift. Entity shapes (a load, a fleet…) are not defined
 * here: they come from the API's transformers via `@a2b/api-client`'s `Data`.
 */

// ─── People ───────────────────────────────────────────────────────────────────

export const USER_ROLES = ['shipper', 'driver', 'fleet_owner', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Roles a new account can sign up as (admins are created by staff). */
export const SIGN_UP_ROLES = ['shipper', 'driver', 'fleet_owner'] as const satisfies readonly UserRole[];
export type SignUpRole = (typeof SIGN_UP_ROLES)[number];

export const DRIVER_VERIFICATION_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED'] as const;
export type DriverVerificationStatus = (typeof DRIVER_VERIFICATION_STATUSES)[number];

export const DUTY_STATUSES = ['AVAILABLE', 'OFF_DUTY'] as const;
export type DutyStatus = (typeof DUTY_STATUSES)[number];

// ─── Fleets ───────────────────────────────────────────────────────────────────

export const FLEET_SIZE_TIERS = ['1-5', '6-20', '20+'] as const;
export type FleetSizeTier = (typeof FLEET_SIZE_TIERS)[number];

export const FLEET_INVITE_STATUSES = ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'] as const;
export type FleetInviteStatus = (typeof FLEET_INVITE_STATUSES)[number];

// ─── Cargo ────────────────────────────────────────────────────────────────────

export const CARGO_TYPES = [
  'GENERAL_CARGO',
  'FRAGILE_CARGO',
  'BULK_CARGO',
  'HEAVY_MACHINERY',
  'FOOD_BEVERAGE',
  'CHEMICALS_PHARMA',
] as const;
export type CargoType = (typeof CARGO_TYPES)[number];

export const cargoTypes: Record<CargoType, { label: string }> = {
  GENERAL_CARGO: { label: 'General cargo' },
  FRAGILE_CARGO: { label: 'Fragile cargo' },
  BULK_CARGO: { label: 'Bulk cargo' },
  HEAVY_MACHINERY: { label: 'Heavy machinery' },
  FOOD_BEVERAGE: { label: 'Food & beverages' },
  CHEMICALS_PHARMA: { label: 'Chemicals & pharma' },
};

export const cargoLabel = (type: CargoType) => cargoTypes[type].label;

export const MACHINERY_SECTORS = [
  'AGRICULTURE',
  'MINING',
  'CONSTRUCTION',
  'FORESTRY',
  'MANUFACTURING',
  'OTHER',
] as const;
export type MachinerySector = (typeof MACHINERY_SECTORS)[number];

export const BULK_TYPES = ['DRY_BULK', 'LIQUID_BULK'] as const;
export type BulkType = (typeof BULK_TYPES)[number];

export const STORAGE_ENVIRONMENTS = ['AMBIENT', 'CHILLED', 'FROZEN'] as const;
export type StorageEnvironment = (typeof STORAGE_ENVIRONMENTS)[number];

export const CHEMICAL_CONTAINERS = ['TANKER', 'IBC_TOTES', 'DRUMS', 'PALLETS'] as const;
export type ChemicalContainer = (typeof CHEMICAL_CONTAINERS)[number];

/** What's being moved. Stored as JSON on the load; `type` is also a column for filtering. */
export interface CargoDetails {
  type: CargoType;
  weightKg?: number;
  dimensions?: {
    lengthMeters: number;
    widthMeters: number;
    heightMeters: number;
  };
  machinerySector?: MachinerySector;
  requiresGoInvestWaiver?: boolean;

  // Bulk
  bulkType?: BulkType;
  volumeCubicMeters?: number;
  requiresHydraulicTipper?: boolean;

  requiresFlatbedLowboy?: boolean;
  storageEnvironment?: StorageEnvironment;
  chemicalContainer?: ChemicalContainer;
}

// ─── Places ───────────────────────────────────────────────────────────────────

/** A place picked in the app (search result or customs zone), before it becomes a load address. */
export interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Inside a customs-controlled zone (port, border post, inland depot). */
  isPort: boolean;
  /** Full street address when the place came from search; the load stores it as the exact address. */
  address?: string;
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

/** Size class — drives pricing and load matching. */
export const VEHICLE_CLASSES = ['PICKUP', 'CANTER', 'LORRY', 'TRAILER'] as const;
export type VehicleClass = (typeof VEHICLE_CLASSES)[number];

export const vehicleClasses: Record<VehicleClass, { label: string; capacityTons: [number, number] }> = {
  PICKUP: { label: 'Pickup', capacityTons: [0.5, 1.5] },
  CANTER: { label: 'Canter', capacityTons: [3, 5] },
  LORRY: { label: 'Lorry', capacityTons: [7, 12] },
  TRAILER: { label: 'Trailer', capacityTons: [20, 40] },
};

/** What sits on the chassis — drives which cargo a truck can take. */
export const BODY_TYPES = ['DRY_BOX', 'REFRIGERATED', 'FLATBED', 'LOWBOY', 'TIPPER', 'TANKER', 'OPEN'] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const bodyTypes: Record<BodyType, { label: string }> = {
  DRY_BOX: { label: 'Dry cargo box' },
  REFRIGERATED: { label: 'Refrigerated' },
  FLATBED: { label: 'Flatbed' },
  LOWBOY: { label: 'Lowboy' },
  TIPPER: { label: 'Tipper' },
  TANKER: { label: 'Tanker' },
  OPEN: { label: 'Open body' },
};

export const VEHICLE_STATUSES = ['ACTIVE', 'IDLE', 'MAINTENANCE'] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];
