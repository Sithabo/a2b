import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { History, Wrench } from "lucide-react-native";
import { bodyTypes, formatMoney, getMarket, marketDateTime, marketParts, vehicleClasses } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { Badge, Button, Card, ChipGroup, colors, EmptyState, layout, PlateBadge, ScreenHeader, spacing, Text } from "@a2b/ui";
import { LoadCard, notify } from "@a2b/features";
import { truckStateMeta } from "@/components/TruckCard";
import { api } from "@/lib/session";
import { buildRoster, earningsBetween, keys, useDrivers, useFleet, useFleetLoads, useInvalidate, useVehicles } from "@/lib/queries";


const NO_DRIVER = "none";

export default function TruckDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fleet = useFleet();
  const vehicles = useVehicles();
  const drivers = useDrivers();
  const loads = useFleetLoads();
  const invalidate = useInvalidate();
  const [isSaving, setIsSaving] = useState(false);

  const market = getMarket(fleet.data?.market ?? "UG");
  const truck = useMemo(
    () => buildRoster(vehicles.data, drivers.data, loads.data).find((t) => t.vehicle.id === Number(id)),
    [vehicles.data, drivers.data, loads.data, id]
  );

  if (!truck) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Truck" onBackPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const { vehicle, driver, activeLoad, state } = truck;
  const trips = (loads.data ?? []).filter((l) => l.vehicleId === vehicle.id && l.status === "COMPLETED");
  // The month as the fleet's market sees it, not the phone's timezone
  const today = marketParts(new Date(), market);
  const monthStart = marketDateTime(market, today.year, today.month, 1);
  const monthEarnings = earningsBetween(trips, monthStart, new Date());

  const update = async (body: { assignedDriverId?: number | null; status?: "IDLE" | "MAINTENANCE" }) => {
    setIsSaving(true);
    try {
      await api.fleets.updateVehicle({ params: { id: vehicle.id }, body });
      await invalidate(keys.vehicles);
    } catch (err) {
      notify("Couldn't update truck", apiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScreenHeader title={vehicle.plate} subtitle={`${vehicle.make} ${vehicle.model}`} onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.section}>
          <View style={styles.row}>
            <PlateBadge plate={vehicle.plate} size="lg" />
            <Badge label={truckStateMeta[state].label} tone={truckStateMeta[state].tone} dot />
          </View>
          <View style={styles.specs}>
            <Spec label="Size" value={vehicleClasses[vehicle.vehicleClass].label} />
            <Spec label="Body" value={bodyTypes[vehicle.bodyType].label} />
            <Spec label="Capacity" value={`${vehicle.capacityTons} t`} />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text variant="label" tone="secondary">
            Driver
          </Text>
          {drivers.data?.length ? (
            <ChipGroup
              value={driver ? String(driver.id) : NO_DRIVER}
              onChange={(value) => update({ assignedDriverId: value === NO_DRIVER ? null : Number(value) })}
              options={[
                ...drivers.data.map((d) => ({ value: String(d.id), label: d.fullName ?? d.phone })),
                { value: NO_DRIVER, label: "No driver" },
              ]}
            />
          ) : (
            <Button title="Add a driver" variant="secondary" size="md" onPress={() => router.push("/drivers/new")} />
          )}
          <Text variant="caption" tone="muted">
            {activeLoad
              ? "Changing the driver doesn't affect the load already dispatched. A driver drives one truck, so picking one takes them off their other truck."
              : "A driver drives one truck, so picking one takes them off their other truck."}
          </Text>
        </Card>

        {activeLoad && (
          <View style={styles.section}>
            <Text variant="h3">Current load</Text>
            <LoadCard
              load={activeLoad}
              onPress={() => router.push({ pathname: "/loads/[id]", params: { id: String(activeLoad.id) } })}
            />
          </View>
        )}

        <Card variant="brand" style={styles.section}>
          <Text variant="label" color={colors.onPrimary}>
            Earned this month
          </Text>
          <Text variant="display" color={colors.onPrimary}>
            {formatMoney(monthEarnings, market)}
          </Text>
          <Text variant="caption" color={colors.onPrimary}>
            {trips.length} completed {trips.length === 1 ? "trip" : "trips"} all time
          </Text>
        </Card>

        <View style={styles.section}>
          <Text variant="h3">Completed trips</Text>
          {trips.length ? (
            trips.map((load) => (
              <LoadCard
                key={load.id}
                load={load}
                onPress={() => router.push({ pathname: "/loads/[id]", params: { id: String(load.id) } })}
              />
            ))
          ) : (
            <EmptyState icon={History} title="No trips yet" message="Completed loads for this truck show up here." />
          )}
        </View>

        {!activeLoad && (
          <Button
            title={state === "MAINTENANCE" ? "Back in service" : "Mark as in maintenance"}
            icon={Wrench}
            variant={state === "MAINTENANCE" ? "primary" : "secondary"}
            loading={isSaving}
            onPress={() => update({ status: state === "MAINTENANCE" ? "IDLE" : "MAINTENANCE" })}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.gutter, gap: spacing.lg, paddingBottom: spacing["4xl"] },
  section: { gap: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  specs: { flexDirection: "row", gap: spacing.md },
});
