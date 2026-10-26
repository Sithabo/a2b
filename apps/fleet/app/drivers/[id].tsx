import { useState } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Phone, Truck, UserMinus } from "lucide-react-native";
import { vehicleClasses } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { Avatar, confirmAction, QueryFallback } from "@a2b/features";
import { Badge, Button, Card, colors, layout, PlateBadge, ScreenHeader, spacing, Text } from "@a2b/ui";
import { verificationMeta } from "@/components/driverMeta";
import { api } from "@/lib/session";
import { keys, useDrivers, useInvalidate, useVehicles } from "@/lib/queries";

export default function DriverDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const drivers = useDrivers();
  const vehicles = useVehicles();
  const invalidate = useInvalidate();
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState("");

  const driver = drivers.data?.find((d) => d.id === Number(id));

  if (!driver) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Driver" onBackPress={() => router.back()} />
        <QueryFallback
          error={drivers.error ?? (drivers.data ? new Error("Driver not found") : null)}
          onRetry={() => drivers.refetch()}
          errorMessage="This driver isn't in your fleet."
        />
      </SafeAreaView>
    );
  }

  const name = driver.fullName ?? "Unnamed driver";
  const truck = vehicles.data?.find((v) => v.assignedDriverId === driver.id);
  const verification = verificationMeta[driver.verificationStatus];
  const rating = driver.ratingAvg !== null ? Number(driver.ratingAvg) : null;

  const remove = async () => {
    const confirmed = await confirmAction({
      title: `Remove ${name} from your fleet?`,
      message: `They keep their A2B account but can no longer take your fleet's jobs${
        truck ? `, and they come off ${truck.plate}` : ""
      }. You can add them again later.`,
      confirmLabel: "Remove driver",
      destructive: true,
    });
    if (!confirmed) return;
    setError("");
    setIsRemoving(true);
    try {
      await api.fleets.removeDriver({ params: { id: driver.id } });
      router.back();
      await invalidate(keys.drivers, keys.vehicles);
    } catch (err) {
      setError(apiErrorMessage(err));
      setIsRemoving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScreenHeader title="Driver" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.section}>
          <View style={styles.identity}>
            <Avatar path={driver.avatarPath} name={driver.fullName ?? driver.phone} size={64} />
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text variant="h3">{name}</Text>
              <Text tone="secondary">{driver.phone}</Text>
              <View style={styles.tags}>
                <Badge label={verification.label} tone={verification.tone} />
                <Badge
                  label={driver.dutyStatus === "AVAILABLE" ? "Available" : "Off duty"}
                  tone={driver.dutyStatus === "AVAILABLE" ? "brand" : "neutral"}
                  dot
                />
              </View>
            </View>
          </View>
          <View style={styles.specs}>
            <Spec label="Trips" value={String(driver.completedTrips)} />
            <Spec label="Rating" value={rating ? `${rating.toFixed(1)} ★` : "—"} />
            <Spec label="Licence" value={driver.licenseClass ? `Class ${driver.licenseClass}` : "—"} />
          </View>
          <Button
            title={`Call ${driver.fullName?.split(" ")[0] ?? "driver"}`}
            icon={Phone}
            variant="secondary"
            size="md"
            onPress={() => Linking.openURL(`tel:${driver.phone}`)}
          />
        </Card>

        <View style={styles.section}>
          <Text variant="h3">Truck</Text>
          {truck ? (
            <Card
              padding="lg"
              style={styles.truck}
              onPress={() => router.push({ pathname: "/trucks/[id]", params: { id: String(truck.id) } })}
              accessibilityLabel={`Truck ${truck.plate}`}
            >
              <PlateBadge plate={truck.plate} size="sm" />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {truck.make} {truck.model}
                </Text>
                <Text variant="caption" tone="muted">
                  {vehicleClasses[truck.vehicleClass].label} · {truck.capacityTons} t
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </Card>
          ) : (
            <Card variant="muted" padding="lg" style={styles.truck}>
              <Truck size={20} color={colors.textMuted} />
              <Text tone="muted" style={{ flex: 1 }}>
                Not driving a truck. Assign them from a truck&apos;s page.
              </Text>
            </Card>
          )}
        </View>

        <View style={styles.section}>
          {error ? <Text tone="danger">{error}</Text> : null}
          <Button title="Remove from fleet" icon={UserMinus} variant="danger" onPress={remove} loading={isRemoving} />
          <Text variant="caption" tone="muted">
            Drivers on an active job can&apos;t be removed until it&apos;s delivered.
          </Text>
        </View>
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
  identity: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  tags: { flexDirection: "row", gap: spacing.sm, alignItems: "center", flexWrap: "wrap" },
  specs: { flexDirection: "row", gap: spacing.md },
  truck: { flexDirection: "row", alignItems: "center", gap: spacing.md },
});
