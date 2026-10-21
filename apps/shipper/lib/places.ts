import { useQuery } from "@tanstack/react-query";
import type { LocationData } from "@a2b/core";
import { api } from "@/lib/session";

/** A random token that groups one search's requests (the provider bills per search session). */
export function newSearchSession() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Places in the shipper's market matching `query` (our known places first). */
export function usePlaceSearch(query: string, session: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["places", q.toLowerCase()],
    enabled: q.length >= 2,
    staleTime: 5 * 60_000,
    queryFn: async () => (await api.places.search({ query: { q, session } })).data,
  });
}

type PlaceResult = Awaited<ReturnType<typeof api.places.search>>["data"][number];

/** Turns a search result into a location for the load, fetching coordinates if the result had none. */
export async function resolvePlace(place: PlaceResult, session: string): Promise<LocationData> {
  const full =
    place.latitude === null || place.longitude === null
      ? (await api.places.details({ query: { id: place.id, session } })).data
      : place;
  return {
    id: full.id,
    name: full.name,
    address: full.address ? `${full.name}, ${full.address}` : full.name,
    latitude: full.latitude!,
    longitude: full.longitude!,
    isPort: full.isPort,
  };
}

export type { PlaceResult };
