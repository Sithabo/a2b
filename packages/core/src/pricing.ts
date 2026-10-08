import type { CargoDetails, VehicleClass } from './domain.ts';
import type { Market } from './markets.ts';

export interface TripEstimateInput {
  distanceKm: number;
  weightTons: number;
  vehicleClass: VehicleClass;
  /** Rush premium, percent of subtotal. */
  urgencyPercent: number;
}

export interface TripEstimate {
  distanceCost: number;
  weightCost: number;
  vehicleFee: number;
  subtotal: number;
  urgencyPremium: number;
  total: number;
}

/** Shipping cost calculator. */
export function estimateTrip(input: TripEstimateInput, market: Market): TripEstimate {
  const { ratePerKm, ratePerTonKm, vehicleFees } = market.rates;
  const distanceCost = input.distanceKm * ratePerKm;
  const weightCost = input.distanceKm * input.weightTons * ratePerTonKm;
  const vehicleFee = vehicleFees[input.vehicleClass];
  const subtotal = distanceCost + weightCost + vehicleFee;
  const urgencyPremium = subtotal * (input.urgencyPercent / 100);
  return { distanceCost, weightCost, vehicleFee, subtotal, urgencyPremium, total: subtotal + urgencyPremium };
}

export interface Surcharge {
  id: string;
  label: string;
  amount: number;
}

/** Sector and equipment surcharges shown in the offer breakdown. */
export function cargoSurcharges(cargo: CargoDetails, market: Market): Surcharge[] {
  const s = market.rates.surcharges;
  const list: Surcharge[] = [];
  switch (cargo.type) {
    case 'GENERAL_CARGO':
      list.push({ id: 'import_license', label: 'Import licence surcharge', amount: s.importLicense });
      break;
    case 'HEAVY_MACHINERY':
      list.push({ id: 'machinery_concession', label: 'Capital equipment concession', amount: s.machineryConcession });
      if (cargo.requiresFlatbedLowboy)
        list.push({ id: 'route_clearance', label: 'Route clearance surcharge', amount: s.flatbedRouteClearance });
      if (cargo.requiresHydraulicTipper) list.push({ id: 'tipper_gate', label: 'Tipper gate fee', amount: s.tipperGate });
      break;
    case 'CHEMICALS_PHARMA':
      list.push({ id: 'hazmat', label: 'Hazardous cargo clearance', amount: s.hazmatClearance });
      break;
    case 'FOOD_BEVERAGE': {
      const env = cargo.storageEnvironment ?? 'AMBIENT';
      const name = { AMBIENT: 'Ambient', CHILLED: 'Chilled', FROZEN: 'Frozen' }[env];
      list.push({ id: 'cold_chain', label: `Safe handling (${name})`, amount: s.coldChain[env] });
      break;
    }
  }
  return list;
}

export interface OfferRecommendation {
  base: number;
  surcharges: Surcharge[];
  recommended: number;
  min: number;
  max: number;
}

export function recommendOffer(cargo: CargoDetails, market: Market, base = market.rates.offerBase): OfferRecommendation {
  const surcharges = cargoSurcharges(cargo, market);
  const recommended = base + surcharges.reduce((sum, x) => sum + x.amount, 0);
  const { below, above } = market.rates.offerRange;
  return { base, surcharges, recommended, min: recommended - below, max: recommended + above };
}
