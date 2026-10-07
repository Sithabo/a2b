import { Linking, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Phone, UserPlus, Users } from "lucide-react-native";
import { Badge, Button, Card, colors, EmptyState, IconButton, PlateBadge, radius, spacing, Text } from "@a2b/ui";
import { ScreenScroll } from "@/components/ScreenScroll";
import { useDrivers, useVehicles } from "@/lib/queries";

const VERIFICATION = {
  VERIFIED: { label: "Verified", tone: "success" },
  PENDING: { label: "Pending verification", tone: "warning" },
  REJECTED: { label: "Rejected", tone: "danger" },
} as const;

export default function DriversScreen() {
  const router = useRouter();
  const drivers = useDrivers();
  const vehicles = useVehicles();

  return (
    <ScreenScroll onRefresh={() => drivers.refetch()} refreshing={drivers.isRefetching}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="h1" tone="primary">
            Drivers
          </Text>
          <Text tone="secondary">{drivers.data?.length ?? 0} in your fleet</Text>
        </View>
        <Button title="Add" icon={UserPlus} size="sm" onPress={() => router.push("/drivers/new")} />
      </View>

      {drivers.isSuccess && drivers.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No drivers yet"
          message="Add your drivers by phone number. They sign in to the A2B Driver app with the same number."
          action={<Button title="Add driver" onPress={() => router.push("/drivers/new")} />}
        />
      ) : (
        drivers.data?.map((driver) => {
          const truck = vehicles.data?.find((v) => v.assignedDriverId === driver.id);
          const verification = VERIFICATION[driver.verificationStatus];
          return (
            <Card key={driver.id} style={styles.card} padding="lg">
              <View style={styles.avatar}>
                <Text variant="h3" tone="primary">
                  {(driver.fullName ?? "?").slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text variant="bodyStrong">{driver.fullName ?? "Unnamed driver"}</Text>
                <Text variant="caption" tone="muted">
                  {driver.phone}
                  {driver.completedTrips ? ` · ${driver.completedTrips} trips` : ""}
                </Text>
                <View style={styles.tags}>
                  <Badge label={verification.label} tone={verification.tone} />
                  {truck ? <PlateBadge plate={truck.plate} size="sm" /> : null}
                </View>
              </View>
              <IconButton icon={Phone} accessibilityLabel={`Call ${driver.fullName ?? "driver"}`} onPress={() => Linking.openURL(`tel:${driver.phone}`)} />
            </Card>
          );
        })
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  card: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  tags: { flexDirection: "row", gap: spacing.sm, alignItems: "center", flexWrap: "wrap" },
});
