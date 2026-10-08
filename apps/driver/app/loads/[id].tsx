import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, ArrowDown, MapPin } from "lucide-react-native";
import { apiErrorMessage } from "@a2b/api-client";
import { formatMoney, getMarket, statusMeta } from "@a2b/core";
import { cargoLabel } from "@a2b/features";
import { Badge, Button, Card, colors, layout, palette, ScreenHeader, spacing, Text } from "@a2b/ui";
import { cargoNotes } from "@/components/cargoNotes";
import { api } from "@/lib/session";
import { keys, useInvalidate, useLoad } from "@/lib/queries";

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

/** Mission overview for an open load, with the accept CTA. */
export default function LoadOverviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loadId = Number(id);
  const load = useLoad(loadId);
  const invalidate = useInvalidate();
  const [isAccepting, setIsAccepting] = useState(false);

  if (!load.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Load" onBackPress={() => router.back()} />
      </SafeAreaView>
    );
  }
  const l = load.data;
  const notes = cargoNotes(l.cargo, l.isImport);

  const accept = async () => {
    setIsAccepting(true);
    try {
      await api.loads.accept({ params: { id: loadId }, body: {} });
      await invalidate(keys.myLoads, keys.board, keys.load(loadId));
      router.replace({ pathname: "/trip/[id]", params: { id: String(loadId) } });
    } catch (err) {
      Alert.alert("Couldn't accept this load", apiErrorMessage(err));
    } finally {
      setIsAccepting(false);
    }
  };

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
          <Place label="Pickup" value={l.pickupSummary} when={formatDate(l.readyAt)} />
          <ArrowDown size={18} color={colors.textMuted} />
          <Place label="Drop-off" value={l.dropoffSummary} when={`by ${formatDate(l.deadlineAt)}`} />
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

        {l.status === "OPEN" ? (
          <Button title="Accept load" onPress={accept} loading={isAccepting} />
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
    borderRadius: 8,
    backgroundColor: palette.amber[50],
  },
});
