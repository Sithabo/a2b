import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorCode, type Data } from "@a2b/api-client";
import { isActiveStatus } from "@a2b/core";
import { api } from "@/lib/session";

export const keys = {
  fleet: ["fleet"] as const,
  vehicles: ["fleet", "vehicles"] as const,
  drivers: ["fleet", "drivers"] as const,
  fleetLoads: ["loads", "fleet"] as const,
  board: ["loads", "board"] as const,
  load: (id: number) => ["loads", id] as const,
};

/** The owner's fleet, or null if they haven't set it up yet. */
export function useFleet() {
  return useQuery({
    queryKey: keys.fleet,
    queryFn: async () => {
      try {
        return (await api.fleets.show({})).data;
      } catch (err) {
        if (apiErrorCode(err) === "E_PROFILE_INCOMPLETE") return null;
        throw err;
      }
    },
  });
}

export function useVehicles() {
  return useQuery({ queryKey: keys.vehicles, queryFn: async () => (await api.fleets.vehicles({})).data });
}

export function useDrivers() {
  return useQuery({ queryKey: keys.drivers, queryFn: async () => (await api.fleets.drivers({})).data });
}

/** Loads the fleet has accepted (any status). */
export function useFleetLoads() {
  return useQuery({
    queryKey: keys.fleetLoads,
    queryFn: async () => (await api.loads.index({ query: { scope: "mine" } })).data,
  });
}

/** Open loads in the fleet's market. */
export function useLoadBoard() {
  return useQuery({
    queryKey: keys.board,
    queryFn: async () => (await api.loads.index({ query: { scope: "board" } })).data,
  });
}

export function useLoad(id: number | undefined) {
  return useQuery({
    queryKey: keys.load(id ?? 0),
    enabled: !!id,
    queryFn: async () => (await api.loads.show({ params: { id: id! } })).data,
  });
}

export function useInvalidate() {
  const queryClient = useQueryClient();
  return (...queryKeys: readonly (readonly unknown[])[]) =>
    Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

// ─── Derived roster ───────────────────────────────────────────────────────────

export type TruckState = "ON_LOAD" | "IDLE" | "MAINTENANCE";

export interface RosterTruck {
  vehicle: Data.Vehicle;
  driver: Data.FleetDriver | null;
  /** The load this truck is currently carrying or dispatched to. */
  activeLoad: Data.Load | null;
  state: TruckState;
}

/**
 * Joins trucks with their drivers and current loads. Truck state is derived:
 * on a load if an active fleet load uses it, otherwise its recorded status.
 */
export function buildRoster(
  vehicles: Data.Vehicle[] = [],
  drivers: Data.FleetDriver[] = [],
  loads: Data.Load[] = []
): RosterTruck[] {
  return vehicles.map((vehicle) => {
    const activeLoad = loads.find((l) => l.vehicleId === vehicle.id && isActiveStatus(l.status)) ?? null;
    return {
      vehicle,
      driver: drivers.find((d) => d.id === vehicle.assignedDriverId) ?? null,
      activeLoad,
      state: activeLoad ? "ON_LOAD" : vehicle.status === "MAINTENANCE" ? "MAINTENANCE" : "IDLE",
    };
  });
}

/** Payouts from loads completed in the [from, to) window. */
export function earningsBetween(loads: Data.Load[] = [], from: Date, to: Date) {
  return loads
    .filter((l) => l.status === "COMPLETED" && l.completedAt)
    .filter((l) => {
      const t = new Date(l.completedAt!).getTime();
      return t >= from.getTime() && t < to.getTime();
    })
    .reduce((sum, l) => sum + (l.escrow?.amount ?? l.offerPrice), 0);
}
