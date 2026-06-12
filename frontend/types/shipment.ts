export type ShipmentStatus = 'OPEN' | 'MATCHED' | 'SECURED' | 'ACTIVE' | 'COMPLETED' | 'DRAFT_PENDING_DOCS' | 'DELIVERED';

export type CargoType = 
  | 'GENERAL_CARGO'
  | 'FRAGILE_CARGO'
  | 'BULK_CARGO'
  | 'HEAVY_MACHINERY'
  | 'FOOD_BEVERAGE'
  | 'CHEMICALS_PHARMA';

export type MachinerySector =
  | 'AGRICULTURE'
  | 'MINING'
  | 'CONSTRUCTION'
  | 'FORESTRY'
  | 'MANUFACTURING'
  | 'OTHER';

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
  
  // Bulk Cargo Specifics
  bulkType?: 'DRY_BULK' | 'LIQUID_BULK';
  volumeCubicMeters?: number;
  requiresHydraulicTipper?: boolean;

  // Milestone 3 Overhaul Specifics
  requiresFlatbedLowboy?: boolean;
  storageEnvironment?: 'AMBIENT' | 'CHILLED' | 'FROZEN';
  chemicalContainer?: 'TANKER' | 'IBC_TOTES' | 'DRUMS' | 'PALLETS';
}

export interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  is_port: boolean;
  cargo_restrictions?: string[];
}

export interface Shipment {
  id: string;
  pickup: string;
  delivery: string;
  cargoType: string;
  weight: string;
  offerPrice: string;
  status: ShipmentStatus;
  createdAt: string;
  deliveryDate: string;
  acceptedByDriver: boolean;
  driverId?: string;
  driverName?: string;
  
  // Compliance / Milestone 3 attributes
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
