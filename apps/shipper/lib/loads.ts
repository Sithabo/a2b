import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CargoDetails, LoadStatus, LocationData } from "@a2b/core";
import type { Data } from "@a2b/api-client";
import { api, session } from "@/lib/session";

/** A load as the API returns it to the shipper who posted it. */
export type Load = Data.Load;

/** "2,500 kg", from the load's weight or its cargo details. */
export function weightLabel(load: Pick<Load, "weightKg" | "cargo">) {
  const kg = load.weightKg ?? load.cargo.weightKg;
  return kg ? `${kg.toLocaleString("en-US")} kg` : "—";
}

/** When the shipment is due: its delivery deadline, else when it's ready, else when it was posted. */
export const dueDate = (load: Pick<Load, "deadlineAt" | "readyAt" | "createdAt">) =>
  load.deadlineAt ?? load.readyAt ?? load.createdAt;

/** Step on the 7-step tracking timeline (active-delivery) for each status. */
const MILESTONE_FOR_STATUS: Partial<Record<LoadStatus, number>> = {
  SECURED: 0,
  IN_TRANSIT: 2,
  DELIVERED: 5,
  COMPLETED: 6,
};

export const milestoneIndex = (load: Pick<Load, "status">) => MILESTONE_FOR_STATUS[load.status] ?? 0;

/** "#A2B-7K3P9Q" */
export const trackingLabel = (load: Pick<Load, "reference">) => `#${load.reference}`;

export const loadKeys = {
  all: ["loads"] as const,
  mine: () => ["loads", "mine"] as const,
  detail: (id: number) => ["loads", id] as const,
};

export function useMyShipments() {
  return useQuery({
    queryKey: loadKeys.mine(),
    queryFn: async () => (await api.loads.index({ query: { scope: "mine" } })).data,
  });
}

/** One load. Pass `pollMs` on screens waiting for the driver (e.g. the release-code screen). */
export function useShipment(id: number | undefined, options: { pollMs?: number } = {}) {
  return useQuery({
    queryKey: loadKeys.detail(id ?? 0),
    enabled: !!id,
    queryFn: async () => (await api.loads.show({ params: { id: id! } })).data,
    refetchInterval: options.pollMs,
  });
}

/** Refetch everything load-related after a mutation. */
export function useInvalidateLoads() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: loadKeys.all });
}

/** Screens receive `trackingId` like "#12" or "12"; returns the numeric load id. */
export function parseLoadId(param: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(param) ? param[0] : param;
  const id = Number(String(raw ?? "").replace("#", ""));
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

/** Which screen shows a shipment best, given where it is in its lifecycle. */
export function shipmentRoute(load: Pick<Load, "id" | "status">) {
  const params = { trackingId: String(load.id) };
  switch (load.status) {
    case "MATCHED":
      return { pathname: "/match-pay/driver-found" as const, params };
    case "SECURED":
    case "IN_TRANSIT":
    case "DELIVERED":
      return { pathname: "/active-delivery" as const, params };
    case "COMPLETED":
      return { pathname: "/official-receipt" as const, params };
    default:
      return { pathname: "/pending-delivery" as const, params };
  }
}

/** What the create-load wizard collects; also what an unfinished import draft keeps. */
export interface NewLoadInput {
  pickup: LocationData | null;
  dropoff: LocationData | null;
  cargo: CargoDetails;
  /** Whole units of the market currency. */
  offerPrice: number;
  isImport: boolean;
  containerId?: string;
  readyAt?: string;
  deadlineAt?: string;
}

/** The POST /loads request body, as the API's validator defines it. */
export type CreateLoadBody = Parameters<typeof api.loads.store>[0]["body"];

/** Request body for POST /loads from the create-load wizard's state. */
export function newLoadBody(input: NewLoadInput): CreateLoadBody {
  const place = (loc: LocationData | null) => ({
    address: loc?.name ?? "",
    lat: loc?.latitude ?? null,
    lng: loc?.longitude ?? null,
  });
  return {
    pickupSummary: input.pickup?.name ?? "",
    dropoffSummary: input.dropoff?.name ?? "",
    pickup: place(input.pickup),
    dropoff: place(input.dropoff),
    isImport: input.isImport,
    containerId: input.containerId ?? null,
    cargo: input.cargo,
    weightKg: input.cargo.weightKg ?? null,
    offerPrice: Math.round(input.offerPrice),
    readyAt: input.readyAt ?? null,
    deadlineAt: input.deadlineAt ?? null,
  };
}

/** Uploads one customs document scan for a draft load. */
export function uploadLoadDocument(
  loadId: number,
  requirementId: string,
  file: { uri: string; name: string; mimeType?: string }
) {
  return session.upload(`loads/${loadId}/documents`, { requirementId }, file);
}
