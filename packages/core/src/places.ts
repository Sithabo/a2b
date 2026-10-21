import type { LocationData } from './domain.ts';

/** What a known place is, which decides its icon and whether it's a customs zone. */
export type PlaceKind = 'port' | 'border' | 'airport' | 'industrial' | 'town';

/**
 * A place A2B knows without a search provider: customs zones (ports, border
 * posts, airport cargo) and the towns and industrial areas loads move between.
 * Shown as suggestions and merged into search results.
 */
export interface MarketPlace extends LocationData {
  kind: PlaceKind;
  /** Town or district, shown under the name. */
  region: string;
  /** Customs zones only: how far from the centre still counts as inside the zone. */
  radiusKm?: number;
}

/** Ports, border posts and airport cargo terminals are customs-controlled. */
export const CUSTOMS_KINDS: readonly PlaceKind[] = ['port', 'border', 'airport'];

const place = (
  id: string,
  name: string,
  region: string,
  kind: PlaceKind,
  latitude: number,
  longitude: number,
  radiusKm?: number
): MarketPlace => ({ id, name, region, kind, latitude, longitude, isPort: CUSTOMS_KINDS.includes(kind), radiusKm });

/*
 * Coordinates are approximate centre points and the zone radii are estimates:
 * confirm both with operations (and the customs authorities' published zone
 * boundaries) before relying on them for port detection.
 */

export const guyanaPlaces: MarketPlace[] = [
  place('gy_port_georgetown', 'Georgetown Wharves (Port Zone)', 'Georgetown', 'port', 6.8114, -58.1672, 1.5),
  place('gy_port_demerara', 'Demerara Terminals (Port Zone)', 'East Bank Demerara', 'port', 6.7901, -58.1812, 1.5),
  place('gy_port_new_amsterdam', 'Port of New Amsterdam', 'Berbice', 'port', 6.2507, -57.5167, 1.5),
  place('gy_airport_cjia', 'Cheddi Jagan International Airport (Cargo)', 'Timehri', 'airport', 6.4985, -58.2541, 2),
  place('gy_border_lethem', 'Lethem Border Crossing (Takutu Bridge)', 'Lethem', 'border', 3.3803, -59.7968, 2),
  place('gy_border_moleson', 'Moleson Creek Ferry Terminal', 'Corentyne', 'border', 5.7833, -57.1667, 2),
  place('gy_industrial_eccles', 'Eccles Industrial Estate', 'East Bank Demerara', 'industrial', 6.7556, -58.1617),
  place('gy_town_georgetown', 'Georgetown', 'Demerara-Mahaica', 'town', 6.8013, -58.1551),
  place('gy_town_new_amsterdam', 'New Amsterdam', 'East Berbice-Corentyne', 'town', 6.249, -57.5176),
  place('gy_town_linden', 'Linden', 'Upper Demerara-Berbice', 'town', 6.0068, -58.3065),
  place('gy_town_parika', 'Parika', 'Essequibo Islands-West Demerara', 'town', 6.8667, -58.4167),
  place('gy_town_bartica', 'Bartica', 'Cuyuni-Mazaruni', 'town', 6.4064, -58.6262),
];

export const ugandaPlaces: MarketPlace[] = [
  place('ug_border_malaba', 'Malaba Border Post', 'Tororo', 'border', 0.6366, 34.2716, 2),
  place('ug_border_busia', 'Busia Border Post', 'Busia', 'border', 0.4633, 34.092, 2),
  place('ug_border_mutukula', 'Mutukula Border Post', 'Kyotera', 'border', -0.9996, 31.4162, 2),
  place('ug_border_elegu', 'Elegu Border Post', 'Adjumani', 'border', 3.58, 32.05, 2),
  place('ug_border_katuna', 'Katuna Border Post', 'Kabale', 'border', -1.422, 29.998, 2),
  place('ug_airport_entebbe', 'Entebbe International Airport (Cargo)', 'Entebbe', 'airport', 0.0424, 32.4435, 2),
  place('ug_port_bell', 'Port Bell', 'Kampala', 'port', 0.2886, 32.6525, 1.5),
  place('ug_industrial_namanve', 'Namanve Industrial Park', 'Mukono', 'industrial', 0.3536, 32.6913),
  place('ug_town_kampala', 'Kampala', 'Central Region', 'town', 0.3476, 32.5825),
  place('ug_town_entebbe', 'Entebbe', 'Wakiso', 'town', 0.0512, 32.4637),
  place('ug_town_jinja', 'Jinja', 'Eastern Region', 'town', 0.4479, 33.2026),
  place('ug_town_mbale', 'Mbale', 'Eastern Region', 'town', 1.0757, 34.1753),
  place('ug_town_mbarara', 'Mbarara', 'Western Region', 'town', -0.6072, 30.6545),
  place('ug_town_gulu', 'Gulu', 'Northern Region', 'town', 2.7746, 32.299),
];

/** Great-circle distance in km. */
export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * The customs zone a point falls in, if any. Searched addresses (from a
 * provider) are matched against the zones so a pickup at the port still starts
 * the import flow even when it wasn't picked from our list.
 */
export function customsZoneAt(places: MarketPlace[], point: { latitude: number; longitude: number }) {
  return (
    places.find((p) => p.isPort && p.radiusKm !== undefined && distanceKm(p, point) <= p.radiusKm) ?? null
  );
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Known places whose name or region contains every word of the query. Customs zones first. */
export function searchPlaces(places: MarketPlace[], query: string, limit = 5) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return places
    .filter((p) => {
      const haystack = normalize(`${p.name} ${p.region}`);
      return words.every((w) => haystack.includes(w));
    })
    .sort((a, b) => Number(b.isPort) - Number(a.isPort))
    .slice(0, limit);
}
