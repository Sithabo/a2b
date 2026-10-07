import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { PlusCircle, Truck } from "lucide-react-native";
import { formatMoney, getMarket } from "@a2b/core";
import { Button, Card, ChipGroup, colors, EmptyState, palette, radius, spacing, Text } from "@a2b/ui";
import { ScreenScroll } from "@/components/ScreenScroll";
import { TruckCard, truckStateMeta } from "@/components/TruckCard";
import { buildRoster, earningsBetween, useDrivers, useFleet, useFleetLoads, useVehicles, type TruckState } from "@/lib/queries";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
type Filter = "ALL" | TruckState;

export default function FleetDashboard() {
  const router = useRouter();
  const fleet = useFleet();
  const vehicles = useVehicles();
  const drivers = useDrivers();
  const loads = useFleetLoads();
  const [filter, setFilter] = useState<Filter>("ALL");

  const market = getMarket(fleet.data?.market ?? "UG");
  const roster = useMemo(() => buildRoster(vehicles.data, drivers.data, loads.data), [vehicles.data, drivers.data, loads.data]);

  const counts = { ON_LOAD: 0, IDLE: 0, MAINTENANCE: 0 } as Record<TruckState, number>;
  roster.forEach((t) => counts[t.state]++);
  const utilization = roster.length ? counts.ON_LOAD / roster.length : 0;

  const now = new Date();
  const thisWeek = earningsBetween(loads.data, new Date(now.getTime() - WEEK_MS), now);
  const lastWeek = earningsBetween(loads.data, new Date(now.getTime() - 2 * WEEK_MS), new Date(now.getTime() - WEEK_MS));
  const change = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;

  const shown = filter === "ALL" ? roster : roster.filter((t) => t.state === filter);
  const refreshing = vehicles.isRefetching || loads.isRefetching || drivers.isRefetching;
  const refresh = () => {
    vehicles.refetch();
    drivers.refetch();
    loads.refetch();
  };

  return (
    <ScreenScroll onRefresh={refresh} refreshing={refreshing}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Truck color={colors.onPrimary} size={22} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="h2" tone="primary" numberOfLines={1}>
            {fleet.data?.name ?? "Your fleet"}
          </Text>
          <Text variant="caption" tone="muted">
            {market.flag} {fleet.data?.primaryCorridor ?? market.name}
          </Text>
        </View>
      </View>

      <Card variant="brand" padding="xl" style={styles.hero}>
        <Text variant="label" color={palette.forest[50]}>
          Earned this week
        </Text>
        <View style={styles.heroRow}>
          <Text variant="display" color={colors.onPrimary}>
            {formatMoney(thisWeek, market)}
          </Text>
          {change !== null && (
            <Text variant="bodyStrong" color={change >= 0 ? palette.emerald[200] : palette.red[100]}>
              {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
            </Text>
          )}
        </View>

        <View style={styles.utilization}>
          <View style={styles.utilRow}>
            <Text variant="bodySm" color={colors.onPrimary}>
              Trucks on a load
            </Text>
            <Text variant="bodyStrong" color={colors.onPrimary}>
              {counts.ON_LOAD} of {roster.length}
            </Text>
          </View>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${Math.round(utilization * 100)}%` }]} />
          </View>
        </View>

        <View style={styles.stats}>
          {(Object.keys(truckStateMeta) as TruckState[]).map((s) => (
            <View key={s} style={styles.stat}>
              <Text variant="h1" color={colors.onPrimary}>
                {counts[s]}
              </Text>
              <Text variant="caption" color={palette.forest[50]}>
                {truckStateMeta[s].label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text variant="h2">Trucks</Text>
        <Button title="Add truck" icon={PlusCircle} size="sm" variant="secondary" onPress={() => router.push("/trucks/new")} />
      </View>

      {roster.length > 0 && (
        <ChipGroup
          scroll
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ALL", label: `All (${roster.length})` },
            ...(Object.keys(truckStateMeta) as TruckState[]).map((s) => ({
              value: s,
              label: `${truckStateMeta[s].label} (${counts[s]})`,
            })),
          ]}
        />
      )}

      {vehicles.isSuccess && roster.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Add your first truck"
          message="Register a truck, assign a driver, then dispatch it to open loads."
          action={<Button title="Register truck" onPress={() => router.push("/trucks/new")} />}
        />
      ) : (
        shown.map((truck) => (
          <TruckCard
            key={truck.vehicle.id}
            truck={truck}
            onPress={() => router.push({ pathname: "/trucks/[id]", params: { id: String(truck.vehicle.id) } })}
            onAssignDriver={() => router.push({ pathname: "/trucks/[id]", params: { id: String(truck.vehicle.id) } })}
            onFindLoad={() => router.push("/(tabs)/loads")}
          />
        ))
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  logo: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { gap: spacing.lg },
  heroRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm },
  utilization: { gap: spacing.sm },
  utilRow: { flexDirection: "row", justifyContent: "space-between" },
  bar: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4, backgroundColor: palette.emerald[400] },
  stats: { flexDirection: "row", gap: spacing.sm },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
});
