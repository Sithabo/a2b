import { useMemo, useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowDown, Clock, MapPin, Phone, ShieldCheck, Truck } from "lucide-react-native";
import { formatMoney, getMarket, statusMeta, vehicleClasses } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import {
  Badge,
  Button,
  Card,
  ChipGroup,
  colors,
  EmptyState,
  layout,
  palette,
  PlateBadge,
  ScreenHeader,
  spacing,
  Text,
} from "@a2b/ui";
import { cargoLabel } from "@/components/LoadCard";
import { api } from "@/lib/session";
import { buildRoster, keys, useDrivers, useFleetLoads, useInvalidate, useLoad, useVehicles } from "@/lib/queries";

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default function LoadDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loadId = Number(id);
  const load = useLoad(loadId);
  const vehicles = useVehicles();
  const drivers = useDrivers();
  const fleetLoads = useFleetLoads();
  const invalidate = useInvalidate();
  const [truckId, setTruckId] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const idleTrucks = useMemo(
    () =>
      buildRoster(vehicles.data, drivers.data, fleetLoads.data).filter((t) => t.state === "IDLE" && t.driver),
    [vehicles.data, drivers.data, fleetLoads.data]
  );

  if (!load.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Load" onBackPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const l = load.data;
  const market = getMarket(l.market);
  const meta = statusMeta[l.status];
  const isOpen = l.status === "OPEN";
  const isOurs = l.fleetId !== null;

  const run = async (action: () => Promise<unknown>, failTitle: string) => {
    setIsWorking(true);
    try {
      await action();
      await invalidate(keys.load(loadId), keys.board, keys.fleetLoads);
    } catch (err) {
      Alert.alert(failTitle, apiErrorMessage(err));
    } finally {
      setIsWorking(false);
    }
  };

  const dispatch = () =>
    run(() => api.loads.accept({ params: { id: loadId }, body: { vehicleId: Number(truckId) } }), "Couldn't dispatch");

  const withdraw = () =>
    Alert.alert("Withdraw from this load?", "It goes back on the load board for other carriers.", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Withdraw",
        style: "destructive",
        onPress: () => run(() => api.loads.withdraw({ params: { id: loadId } }), "Couldn't withdraw"),
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScreenHeader title={l.reference} subtitle={cargoLabel(l.cargoType)} onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <Card style={styles.section}>
          <Badge label={meta.label} tone={meta.tone} dot />
          <Text variant="display" tone="primary">
            {formatMoney(l.escrow?.amount ?? l.offerPrice, market)}
          </Text>
          <View style={styles.route}>
            <Place icon={MapPin} label="Pickup" value={l.location?.pickupAddress ?? l.pickupSummary} />
            <ArrowDown size={16} color={colors.textMuted} style={{ marginLeft: 2 }} />
            <Place icon={MapPin} label="Drop-off" value={l.location?.dropoffAddress ?? l.dropoffSummary} />
          </View>
          <View style={styles.specs}>
            <Spec label="Ready" value={formatDate(l.readyAt)} />
            <Spec label="Deliver by" value={formatDate(l.deadlineAt)} />
            <Spec label="Weight" value={l.weightKg ? `${(l.weightKg / 1000).toFixed(1)} t` : "—"} />
          </View>
          {l.isImport && (
            <Badge label={`Customs zone pickup${l.containerId ? ` · ${l.containerId}` : ""}`} tone="warning" />
          )}
        </Card>

        {/* Escrow holding state */}
        {l.status === "MATCHED" && (
          <Card style={[styles.section, styles.amber]}>
            <View style={styles.row}>
              <Clock size={20} color={palette.amber[800]} />
              <Text variant="bodyStrong" color={palette.amber[800]} style={{ flex: 1 }}>
                Waiting for the shipper to fund escrow
              </Text>
            </View>
            <Text variant="bodySm" color={palette.amber[900]}>
              Hold the truck until payment is secured. Pickup address and contacts unlock as soon as it is.
            </Text>
          </Card>
        )}

        {/* Unlocked once escrow is funded */}
        {l.location && isOurs && (
          <Card style={styles.section}>
            <View style={styles.row}>
              <ShieldCheck size={20} color={colors.success} />
              <Text variant="bodyStrong" style={{ flex: 1 }}>
                Escrow secured — {formatMoney(l.escrow?.amount ?? l.offerPrice, market)} held for you
              </Text>
            </View>
            <Contact label="Pickup contact" name={l.location.pickupContactName} phone={l.location.pickupContactPhone} />
            <Contact label="Receiver" name={l.location.receiverName} phone={l.location.receiverPhone} />
          </Card>
        )}

        {l.carrier && (
          <Card style={styles.section}>
            <Text variant="label" tone="secondary">
              Dispatched
            </Text>
            <View style={styles.row}>
              <Text variant="bodyStrong" style={{ flex: 1 }}>
                {l.carrier.driverName ?? "Driver"}
              </Text>
              {l.carrier.vehicle && <PlateBadge plate={l.carrier.vehicle.plate} size="sm" />}
            </View>
            {l.carrier.vehicle && (
              <Text variant="caption" tone="muted">
                {l.carrier.vehicle.make} {l.carrier.vehicle.model} ·{" "}
                {vehicleClasses[l.carrier.vehicle.vehicleClass].label}
              </Text>
            )}
          </Card>
        )}

        {isOpen && (
          <View style={styles.section}>
            <Text variant="h3">Dispatch a truck</Text>
            {idleTrucks.length ? (
              <>
                <ChipGroup
                  value={truckId}
                  onChange={setTruckId}
                  options={idleTrucks.map((t) => ({
                    value: String(t.vehicle.id),
                    label: `${t.vehicle.plate} · ${t.driver?.fullName ?? t.driver?.phone}`,
                  }))}
                />
                <Button title="Accept & dispatch" icon={Truck} onPress={dispatch} loading={isWorking} disabled={!truckId} />
              </>
            ) : (
              <EmptyState
                icon={Truck}
                title="No idle trucks with a driver"
                message="Free up a truck or assign a driver to an idle one to take this load."
              />
            )}
          </View>
        )}

        {l.status === "MATCHED" && isOurs && (
          <Button title="Withdraw from load" variant="ghost" onPress={withdraw} loading={isWorking} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Place({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" }}>
      <Icon size={18} color={colors.primary} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text variant="caption" tone="muted">
          {label}
        </Text>
        <Text variant="bodyStrong">{value}</Text>
      </View>
    </View>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="bodySm">{value}</Text>
    </View>
  );
}

function Contact({ label, name, phone }: { label: string; name: string | null; phone: string | null }) {
  if (!name && !phone) return null;
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text variant="caption" tone="muted">
          {label}
        </Text>
        <Text variant="bodyStrong">{name ?? phone}</Text>
      </View>
      {phone && (
        <Button title="Call" icon={Phone} size="sm" variant="secondary" onPress={() => Linking.openURL(`tel:${phone}`)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.gutter, gap: spacing.lg, paddingBottom: spacing["4xl"] },
  section: { gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  route: { gap: spacing.xs },
  specs: { flexDirection: "row", gap: spacing.md },
  amber: { backgroundColor: palette.amber[50], borderColor: palette.amber[200] },
});
