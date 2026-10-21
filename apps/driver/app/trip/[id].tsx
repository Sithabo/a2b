import { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, Clock, FileCheck2, Navigation, Phone } from "lucide-react-native";
import type { Data } from "@a2b/api-client";
import { apiErrorCode, apiErrorMessage } from "@a2b/api-client";
import { QueryFallback, useProgressLoad, useReleaseEscrow, useWithdrawLoad } from "@a2b/features";
import { cargoLabel, formatMoney, getMarket, statusMeta } from "@a2b/core";
import {
  Badge,
  Button,
  Card,
  CodePad,
  colors,
  layout,
  palette,
  radius,
  ScreenHeader,
  SlideToConfirm,
  spacing,
  Text,
} from "@a2b/ui";
import { openDirections, useLoad } from "@/lib/queries";
import { ProofOfDelivery } from "@/components/ProofOfDelivery";

/** The driver's job screen; what it shows follows the load's status. */
export default function TripScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loadId = Number(id);
  // Waiting on the shipper to fund escrow: check often. Otherwise a slow refresh.
  const load = useLoad(loadId, (job) =>
    job?.status === "MATCHED" ? 10_000 : job?.status === "DELIVERED" || job?.status === "COMPLETED" ? false : 30_000
  );
  const l = load.data;
  const progressLoad = useProgressLoad(loadId);
  const withdrawal = useWithdrawLoad(loadId);

  if (!l) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Job" onBackPress={() => router.back()} />
        <QueryFallback error={load.error} onRetry={() => load.refetch()} errorMessage="We couldn't load this job." />
      </SafeAreaView>
    );
  }

  const progress = (status: "IN_TRANSIT") => progressLoad.mutate(status);

  const withdraw = () =>
    Alert.alert("Withdraw from this load?", "It goes back on the board for other drivers.", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Withdraw",
        style: "destructive",
        onPress: () => withdrawal.mutate(undefined, { onSuccess: () => router.replace("/(tabs)") }),
      },
    ]);

  const header = (
    <ScreenHeader title={l.reference} subtitle={cargoLabel(l.cargoType)} onBackPress={() => router.back()} />
  );

  // ── Escrow holding state ──────────────────────────────────────────────────
  if (l.status === "MATCHED") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: palette.amber[50] }]} edges={["bottom"]}>
        {header}
        <View style={styles.hold}>
          <View style={styles.holdIcon}>
            <Clock size={56} color={palette.amber[800]} />
          </View>
          <Text variant="display" color={palette.amber[900]} align="center">
            Hold the truck
          </Text>
          <Text variant="bodyLg" color={palette.amber[900]} align="center">
            The shipper is funding escrow for {formatMoney(l.escrow?.amount ?? l.offerPrice, getMarket(l.market))}.
            Don&apos;t drive to pickup yet — the address and contacts appear here as soon as the money is secured.
          </Text>
          {l.escrow?.fundingDueAt && (
            <Text variant="bodySm" color={palette.amber[900]} align="center">
              If it isn&apos;t funded by{" "}
              {new Date(l.escrow.fundingDueAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}, the
              load goes back on the board and you&apos;re free to take another.
            </Text>
          )}
          <Badge label="Checking every few seconds" tone="warning" dot style={{ alignSelf: "center" }} />
        </View>
        <View style={styles.footer}>
          <Button title="Withdraw from load" variant="ghost" onPress={withdraw} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Payout receipt ────────────────────────────────────────────────────────
  if (l.status === "COMPLETED") return <Receipt load={l} onDone={() => router.replace("/(tabs)")} header={header} />;

  // ── Release code ──────────────────────────────────────────────────────────
  if (l.status === "DELIVERED") {
    return <ReleaseCode load={l} header={header} />;
  }

  // ── Pickup / delivery legs ────────────────────────────────────────────────
  const toPickup = l.status === "SECURED";
  const loc = l.location;
  const place = toPickup
    ? { title: "Go to pickup", address: loc?.pickupAddress ?? l.pickupSummary, lat: loc?.pickupLat, lng: loc?.pickupLng, contact: loc?.pickupContactName, phone: loc?.pickupContactPhone, contactRole: "Pickup contact" }
    : { title: "Deliver to", address: loc?.dropoffAddress ?? l.dropoffSummary, lat: loc?.dropoffLat, lng: loc?.dropoffLng, contact: loc?.receiverName, phone: loc?.receiverPhone, contactRole: "Receiver" };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        <Badge label={statusMeta[l.status].label} tone={statusMeta[l.status].tone} dot />

        <Card style={styles.section}>
          <Text variant="label" tone="secondary">
            {place.title}
          </Text>
          <Text variant="h1">{place.address}</Text>
          <Button
            title="Open directions"
            icon={Navigation}
            onPress={() => openDirections({ address: place.address, lat: place.lat, lng: place.lng })}
          />
        </Card>

        {(place.contact || place.phone) && (
          <Card style={[styles.section, styles.row]}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="muted">
                {place.contactRole}
              </Text>
              <Text variant="h3">{place.contact ?? place.phone}</Text>
            </View>
            {place.phone && (
              <Button title="Call" icon={Phone} size="md" onPress={() => Linking.openURL(`tel:${place.phone}`)} />
            )}
          </Card>
        )}

        {l.isImport && (
          <Button
            title="Show customs pass"
            icon={FileCheck2}
            variant="secondary"
            onPress={() => router.push({ pathname: "/customs-pass/[id]", params: { id: String(l.id) } })}
          />
        )}

        <View style={{ marginTop: spacing.lg }}>
          {toPickup ? (
            <SlideToConfirm label="Slide when cargo is loaded" onConfirm={() => progress("IN_TRANSIT")} loading={progressLoad.isPending} />
          ) : (
            <ProofOfDelivery load={l} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReleaseCode({ load, header }: { load: Data.Load; header: React.ReactNode }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  // Errors show under the keypad rather than in an alert
  const release = useReleaseEscrow(load.id, { errorTitle: false });
  const isReleasing = release.isPending;

  const submit = (value: string) => {
    setError("");
    release.mutate(value, {
      onError: (err) => {
        setError(
          apiErrorCode(err) === "E_NO_RELEASE_CODE"
            ? "The shipper hasn't made a code yet. Ask them to open Release Funds in their app."
            : apiErrorMessage(err)
        );
        setCode("");
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h1" tone="primary">
          Enter the release code
        </Text>
        <Text tone="secondary">
          Once the shipper has inspected the cargo they&apos;ll give you a 6-digit code. Entering it releases{" "}
          {formatMoney(load.escrow?.amount ?? load.offerPrice, getMarket(load.market))} to{" "}
          {load.fleetId ? "your fleet" : "you"}.
        </Text>
        <CodePad
          value={code}
          onChange={(v) => {
            setCode(v);
            setError("");
            if (v.length === 6) submit(v);
          }}
          hasError={!!error}
          disabled={isReleasing}
        />
        {error ? <Text tone="danger">{error}</Text> : null}
        <Button title="Release payment" onPress={() => submit(code)} loading={isReleasing} disabled={code.length < 6} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Receipt({ load, header, onDone }: { load: Data.Load; header: React.ReactNode; onDone: () => void }) {
  const market = getMarket(load.market);
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      {header}
      <ScrollView contentContainerStyle={[styles.content, { alignItems: "stretch" }]}>
        <View style={styles.receiptHero}>
          <CheckCircle2 size={72} color={colors.success} />
          <Text variant="display" tone="primary" align="center">
            Payment released
          </Text>
          <Text variant="display" align="center">
            {formatMoney(load.escrow?.amount ?? load.offerPrice, market)}
          </Text>
          <Text tone="secondary" align="center">
            {load.fleetId ? "Paid to your fleet's account." : "Paid to your mobile money account."}
          </Text>
        </View>
        <Card style={styles.section}>
          <Row label="Load" value={load.reference} />
          <Row label="Route" value={`${load.pickupSummary} → ${load.dropoffSummary}`} />
          <Row label="Cargo" value={cargoLabel(load.cargoType)} />
          <Row label="Delivered" value={load.completedAt ? new Date(load.completedAt).toLocaleString("en-GB") : "—"} />
        </Card>
        <Button title="Back to jobs" onPress={onDone} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.lg }}>
      <Text tone="secondary">{label}</Text>
      <Text variant="bodyStrong" style={{ flexShrink: 1, textAlign: "right" }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.gutter, gap: spacing.lg, paddingBottom: spacing["4xl"] },
  section: { gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  hold: { flex: 1, justifyContent: "center", gap: spacing.xl, padding: layout.gutter },
  holdIcon: {
    alignSelf: "center",
    width: 112,
    height: 112,
    borderRadius: radius.pill,
    backgroundColor: palette.amber[200],
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { padding: layout.gutter },
  receiptHero: { alignItems: "center", gap: spacing.md, paddingVertical: spacing["2xl"] },
});
