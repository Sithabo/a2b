import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CargoDetails, CargoType, LoadStatus, LocationData, Shipment } from "@a2b/core";
import type { Data } from "@a2b/api-client";
import { api, API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const CARGO_LABELS: Record<CargoType, string> = {
  GENERAL_CARGO: "General Cargo",
  FRAGILE_CARGO: "Fragile Cargo",
  BULK_CARGO: "Bulk Cargo",
  HEAVY_MACHINERY: "Heavy Machinery",
  FOOD_BEVERAGE: "Food & Beverages",
  CHEMICALS_PHARMA: "Chemicals & Pharma",
};

/** Step on the 7-step tracking timeline (active-delivery) for each status. */
const MILESTONE_FOR_STATUS: Partial<Record<LoadStatus, number>> = {
  SECURED: 0,
  IN_TRANSIT: 2,
  DELIVERED: 5,
  COMPLETED: 6,
};

export type ShipmentView = Shipment & {
  /** Exact addresses and the driver unlock once escrow is funded. */
  location: Data.Load["location"];
  carrier: Data.Load["carrier"];
  escrow: Data.Load["escrow"];
};

/** Maps an API load onto the shape the shipper's screens and cards already use. */
export function toShipment(load: Data.Load): ShipmentView {
  const weightKg = load.weightKg ?? load.cargo.weightKg;
  return {
    id: String(load.id),
    reference: load.reference,
    market: load.market,
    pickup: load.pickupSummary,
    delivery: load.dropoffSummary,
    cargoType: CARGO_LABELS[load.cargoType],
    weight: weightKg ? `${weightKg.toLocaleString("en-US")} kg` : "—",
    offerPrice: String(load.offerPrice),
    status: load.status,
    createdAt: load.createdAt ?? new Date().toISOString(),
    deliveryDate: load.deadlineAt ?? load.readyAt ?? load.createdAt ?? new Date().toISOString(),
    acceptedByDriver: load.driverId !== null,
    driverId: load.driverId !== null ? String(load.driverId) : undefined,
    driverName: load.carrier?.driverName ?? undefined,
    is_import: load.isImport,
    pickupLocation: null,
    dropoffLocation: null,
    cargo: load.cargo,
    containerId: load.containerId ?? undefined,
    milestoneIndex: MILESTONE_FOR_STATUS[load.status],
    readyAt: load.readyAt ?? undefined,
    deadlineAt: load.deadlineAt ?? undefined,
    location: load.location,
    carrier: load.carrier,
    escrow: load.escrow,
  };
}

/** "#A2B-7K3P9Q" (falls back to the numeric id). */
export const trackingLabel = (s: Pick<Shipment, "id" | "reference">) => `#${s.reference ?? s.id}`;

export const loadKeys = {
  all: ["loads"] as const,
  mine: () => ["loads", "mine"] as const,
  detail: (id: number) => ["loads", id] as const,
};

export function useMyShipments() {
  return useQuery({
    queryKey: loadKeys.mine(),
    queryFn: async () => (await api.loads.index({ query: { scope: "mine" } })).data.map(toShipment),
  });
}

/** One load. Pass `pollMs` on screens waiting for the driver (e.g. the release-code screen). */
export function useShipment(id: number | undefined, options: { pollMs?: number } = {}) {
  return useQuery({
    queryKey: loadKeys.detail(id ?? 0),
    enabled: !!id,
    queryFn: async () => toShipment((await api.loads.show({ params: { id: id! } })).data),
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
export function shipmentRoute(s: Pick<Shipment, "id" | "status">) {
  const params = { trackingId: s.id };
  switch (s.status) {
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

export interface NewLoadInput {
  pickup: LocationData | null;
  dropoff: LocationData | null;
  cargo: CargoDetails;
  offerPrice: number;
  isImport: boolean;
  containerId?: string;
  readyAt?: string;
  deadlineAt?: string;
}

/** Request body for POST /loads from the create-load wizard's state. */
export function newLoadBody(input: NewLoadInput) {
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

/**
 * Uploads one customs document scan. Uses fetch directly because React Native's
 * FormData file objects ({ uri, name, type }) aren't Blobs, which the typed client expects.
 */
export async function uploadLoadDocument(
  loadId: number,
  requirementId: string,
  file: { uri: string; name: string; mimeType?: string }
) {
  const form = new FormData();
  form.append("requirementId", requirementId);
  form.append("file", { uri: file.uri, name: file.name, type: file.mimeType ?? "image/jpeg" } as unknown as Blob);

  const response = await fetch(`${API_URL}/api/v1/loads/${loadId}/documents`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${useAuthStore.getState().token ?? ""}`,
    },
    body: form,
  });
  if (!response.ok) {
    // Same shape as typed-client errors so apiErrorMessage() works on it.
    throw { response: await response.json().catch(() => undefined) };
  }
}
