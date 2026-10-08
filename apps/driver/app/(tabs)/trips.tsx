import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { History } from "lucide-react-native";
import { formatMoney, getMarket } from "@a2b/core";
import { LoadCard } from "@a2b/features";
import { Card, colors, EmptyState, palette, spacing, Text } from "@a2b/ui";
import { ScreenScroll } from "@/components/ScreenScroll";
import { useSession } from "@/lib/session";
import { useMyLoads } from "@/lib/queries";

export default function TripsScreen() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const mine = useMyLoads();
  const market = getMarket(user?.market ?? "UG");

  const completed = (mine.data ?? []).filter((l) => l.status === "COMPLETED");
  const earned = completed.reduce((sum, l) => sum + (l.escrow?.amount ?? l.offerPrice), 0);
  const inFleet = !!user?.driverProfile?.fleetId;

  return (
    <ScreenScroll onRefresh={() => mine.refetch()} refreshing={mine.isRefetching}>
      <Text variant="h1" tone="primary">
        Trips
      </Text>

      <Card variant="brand" style={styles.summary}>
        <Text variant="label" color={palette.forest[50]}>
          {inFleet ? "Delivered for your fleet" : "Total earned"}
        </Text>
        <Text variant="display" color={colors.onPrimary}>
          {formatMoney(earned, market)}
        </Text>
        <Text variant="bodySm" color={palette.forest[50]}>
          {completed.length} completed {completed.length === 1 ? "trip" : "trips"}
        </Text>
      </Card>

      {mine.isSuccess && completed.length === 0 ? (
        <EmptyState icon={History} title="No completed trips yet" message="Delivered loads show up here." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {completed.map((load) => (
            <LoadCard
              key={load.id}
              load={load}
              onPress={() => router.push({ pathname: "/trip/[id]", params: { id: String(load.id) } })}
            />
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  summary: { gap: spacing.xs },
});
