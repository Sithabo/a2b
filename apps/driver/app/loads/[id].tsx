import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, ArrowDown, MapPin } from "lucide-react-native";
import { cargoLabel, formatMarketTime, formatMoney, getMarket, statusMeta } from "@a2b/core";
import { Badge, Button, Card, colors, layout, palette, radius, ScreenHeader, spacing, Text } from "@a2b/ui";
import { cargoNotes } from "@/components/cargoNotes";
import { QueryFallback, useAcceptLoad } from "@a2b/features";
import { useLoad } from "@/lib/queries";
import { useSession } from "@/lib/session";


/** Mission overview for an open load, with the accept CTA. */
export default function LoadOverviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loadId = Number(id);
  const load = useLoad(loadId);
  // Drivers accept loads themselves only once verified (fleets can still dispatch them)
  const isVerified = useSession((st) => st.user?.driverProfile?.verificationStatus === "VERIFIED");
  const accept = useAcceptLoad(loadId);

  if (!load.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Load" onBackPress={() => router.back()} />
        <QueryFallback error={load.error} onRetry={() => load.refetch()} errorMessage="We couldn't load this load." />
      </SafeAreaView>
    );
  }
  const l = load.data;
  const notes = cargoNotes(l.cargo, l.isImport);

  const acceptLoad = () =>
    accept.mutate({}, { onSuccess: () => router.replace({ pathname: "/trip/[id]", params: { id: String(loadId) } }) });

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScreenHeader title={l.reference} subtitle={cargoLabel(l.cargoType)} onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.section}>
          <Text variant="label" tone="secondary">
            You earn
          </Text>
          <Text variant="display" tone="primary">
            {formatMoney(l.offerPrice, getMarket(l.market))}
          </Text>
          <Text variant="caption" tone="muted">
            Held in escrow by the shipper before pickup, paid out when you enter their release code.
          </Text>
        </Card>

        <Card style={styles.section}>
          <Place label="Pickup" value={l.pickupSummary} when={formatMarketTime(l.readyAt, getMarket(l.market), "weekdayDateTime")} />
          <ArrowDown size={18} color={colors.textMuted} />
          <Place label="Drop-off" value={l.dropoffSummary} when={`by ${formatMarketTime(l.deadlineAt, getMarket(l.market), "weekdayDateTime")}`} />
          <Text variant="caption" tone="muted">
            Exact addresses and contacts unlock once the shipper funds escrow.
          </Text>
        </Card>

        <Card style={styles.section}>
          <View style={styles.row}>
            <Spec label="Cargo" value={cargoLabel(l.cargoType)} />
            <Spec label="Weight" value={l.weightKg ? `${(l.weightKg / 1000).toFixed(1)} t` : "—"} />
          </View>
          {notes.map((note) => (
            <View key={note} style={styles.note}>
              <AlertTriangle size={18} color={palette.amber[800]} />
              <Text variant="bodySm" color={palette.amber[900]} style={{ flex: 1 }}>
                {note}
              </Text>
            </View>
          ))}
        </Card>

        {l.status === "OPEN" && !isVerified ? (
          <Card style={styles.notice} padding="lg">
            <Text variant="bodySm" color={palette.amber[900]}>
              Your licence is still being verified. Until then you can take the jobs your fleet dispatches to you.
            </Text>
          </Card>
        ) : l.status === "OPEN" ? (
          <Button title="Accept load" onPress={acceptLoad} loading={accept.isPending} />
        ) : (
          <Badge label={statusMeta[l.status].label} tone={statusMeta[l.status].tone} dot />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Place({ label, value, when }: { label: string; value: string; when: string }) {
  return (
    <View style={{ flexDirection: "row", gap: spacing.md }}>
      <MapPin size={22} color={colors.primary} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="caption" tone="muted">
          {label}
        </Text>
        <Text variant="h3">{value}</Text>
        <Text variant="bodySm" tone="secondary">
          {when}
        </Text>
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
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.gutter, gap: spacing.lg, paddingBottom: spacing["4xl"] },
  section: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  note: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: palette.amber[50],
  },
  notice: { backgroundColor: colors.warningMuted, borderColor: colors.warningMuted },
});
