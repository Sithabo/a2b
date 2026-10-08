import type { MarketCode } from './markets.ts';
import type { LoadStatus } from './status.ts';

export type UserRole = 'shipper' | 'driver' | 'fleet_owner' | 'admin';

// ─── Cargo ────────────────────────────────────────────────────────────────────

export type CargoType =
  | 'GENERAL_CARGO'
  | 'FRAGILE_CARGO'
  | 'BULK_CARGO'
  | 'HEAVY_MACHINERY'
  | 'FOOD_BEVERAGE'
  | 'CHEMICALS_PHARMA';

export type MachinerySector = 'AGRICULTURE' | 'MINING' | 'CONSTRUCTION' | 'FORESTRY' | 'MANUFACTURING' | 'OTHER';

export type StorageEnvironment = 'AMBIENT' | 'CHILLED' | 'FROZEN';
export type ChemicalContainer = 'TANKER' | 'IBC_TOTES' | 'DRUMS' | 'PALLETS';

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
  bulkType?: 'DRY_BULK' | 'LIQUID_BULK';
  volumeCubicMeters?: number;
  requiresHydraulicTipper?: boolean;

  requiresFlatbedLowboy?: boolean;
  storageEnvironment?: StorageEnvironment;
  chemicalContainer?: ChemicalContainer;
}

// ─── Places ───────────────────────────────────────────────────────────────────

export interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Inside a customs-controlled zone (port, border post, inland depot). */
  is_port: boolean;
  cargo_restrictions?: string[];
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

/** Size class — drives pricing and load matching. */
export type VehicleClass = 'PICKUP' | 'CANTER' | 'LORRY' | 'TRAILER';

export const vehicleClasses: Record<VehicleClass, { label: string; capacityTons: [number, number] }> = {
  PICKUP: { label: 'Pickup', capacityTons: [0.5, 1.5] },
  CANTER: { label: 'Canter', capacityTons: [3, 5] },
  LORRY: { label: 'Lorry', capacityTons: [7, 12] },
  TRAILER: { label: 'Trailer', capacityTons: [20, 40] },
};

/** What sits on the chassis — drives which cargo a truck can take. */
export type BodyType = 'DRY_BOX' | 'REFRIGERATED' | 'FLATBED' | 'LOWBOY' | 'TIPPER' | 'TANKER' | 'OPEN';

export const bodyTypes: Record<BodyType, { label: string }> = {
  DRY_BOX: { label: 'Dry cargo box' },
  REFRIGERATED: { label: 'Refrigerated' },
  FLATBED: { label: 'Flatbed' },
  LOWBOY: { label: 'Lowboy' },
  TIPPER: { label: 'Tipper' },
  TANKER: { label: 'Tanker' },
  OPEN: { label: 'Open body' },
};

export interface Vehicle {
  id: string;
  fleetId?: string;
  market: MarketCode;
  plate: string;
  make: string;
  model: string;
  vehicleClass: VehicleClass;
  bodyType: BodyType;
  capacityTons: number;
  assignedDriverId?: string;
  status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE';
}

// ─── People & companies ───────────────────────────────────────────────────────

export interface Driver {
  id: string;
  name: string;
  phone: string;
  market: MarketCode;
  /** Independent owner-operators have no fleet. */
  fleetId?: string;
  licenseClass?: string;
  rating?: number;
  completedTrips?: number;
}

export interface Fleet {
  id: string;
  name: string;
  market: MarketCode;
  taxId?: string;
  sizeTier: '1-5' | '6-20' | '20+';
  primaryCorridor?: string;
}

// ─── Loads ────────────────────────────────────────────────────────────────────

export interface Load {
  id: string;
  /** Older locally-stored loads may not have one; treat as the user's market. */
  market?: MarketCode;
  pickup: string;
  delivery: string;
  cargoType: string;
  weight: string;
  offerPrice: string;
  status: LoadStatus;
  createdAt: string;
  deliveryDate: string;
  acceptedByDriver: boolean;
  driverId?: string;
  driverName?: string;

  is_import: boolean;
  pickupLocation: LocationData | null;
  dropoffLocation: LocationData | null;
  cargo?: CargoDetails;
  containerId?: string;
  uploadedDocuments?: {
    billOfLading: boolean;
    commercialInvoice: boolean;
    formC21: boolean;
    goInvestLetter?: boolean;
  };
  documents?: { [key: string]: { name: string; size: string } };
  milestoneIndex?: number;
  readyAt?: string;
  deadlineAt?: string;
}

/** The shipper app's name for a load. */
export type Shipment = Load;
