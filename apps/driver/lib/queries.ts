import { Linking } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Data } from "@a2b/api-client";
import { isActiveStatus } from "@a2b/core";
import { api } from "@/lib/session";

export const keys = {
  myLoads: ["loads", "mine"] as const,
  board: ["loads", "board"] as const,
  load: (id: number) => ["loads", id] as const,
  documents: (id: number) => ["loads", id, "documents"] as const,
};

/** Loads assigned to this driver (dispatched by their fleet or accepted themselves). */
export function useMyLoads() {
  return useQuery({
    queryKey: keys.myLoads,
    queryFn: async () => (await api.loads.index({ query: { scope: "mine" } })).data,
  });
}

/** Open loads in the driver's market. */
export function useLoadBoard(enabled = true) {
  return useQuery({
    queryKey: keys.board,
    enabled,
    queryFn: async () => (await api.loads.index({ query: { scope: "board" } })).data,
  });
}

/** One load; pass pollMs while waiting on the shipper (escrow, release code). */
export function useLoad(id: number | undefined, pollMs?: number) {
  return useQuery({
    queryKey: keys.load(id ?? 0),
    enabled: !!id,
    queryFn: async () => (await api.loads.show({ params: { id: id! } })).data,
    refetchInterval: pollMs,
  });
}

export function useDocuments(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: keys.documents(id ?? 0),
    enabled: !!id && enabled,
    queryFn: async () => (await api.loadDocuments.index({ params: { id: id! } })).data,
  });
}

export function useInvalidate() {
  const queryClient = useQueryClient();
  return (...queryKeys: readonly (readonly unknown[])[]) =>
    Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

/** The job the driver is working on now (dispatched, waiting for escrow, or underway). */
export const currentJob = (loads: Data.Load[] = []) => loads.find((l) => isActiveStatus(l.status)) ?? null;

/** Opens turn-by-turn directions in the phone's maps app. */
export function openDirections(place: { address: string; lat?: number | null; lng?: number | null }) {
  const destination = place.lat != null && place.lng != null ? `${place.lat},${place.lng}` : place.address;
  return Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`);
}
