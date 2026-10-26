import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getMarket } from "@a2b/core";
import { apiErrorMessage, type Data } from "@a2b/api-client";
import { QueryFallback } from "@a2b/features";
import { Button, colors, layout, ScreenHeader, spacing, Text } from "@a2b/ui";
import { FleetDetailsForm, fleetDetailsBody, fleetDetailsOf, isFleetDetailsValid } from "@/components/FleetDetailsForm";
import { api } from "@/lib/session";
import { keys, useFleet, useInvalidate } from "@/lib/queries";

/** The fleet's business details. The market is fixed once the fleet exists. */
export default function EditFleetScreen() {
  const router = useRouter();
  const fleet = useFleet();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScreenHeader title="Edit fleet" onBackPress={() => router.back()} />
      {fleet.data ? (
        <EditFleetForm fleet={fleet.data} onDone={() => router.back()} />
      ) : (
        <QueryFallback error={fleet.error} onRetry={() => fleet.refetch()} />
      )}
    </SafeAreaView>
  );
}

function EditFleetForm({ fleet, onDone }: { fleet: Data.Fleet; onDone: () => void }) {
  const invalidate = useInvalidate();
  const market = getMarket(fleet.market);
  const [details, setDetails] = useState(() => fleetDetailsOf(fleet));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError("");
    setIsSaving(true);
    try {
      await api.fleets.update({ body: fleetDetailsBody(details) });
      await invalidate(keys.fleet);
      onDone();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FleetDetailsForm value={details} onChange={setDetails} market={market} />
        <Text variant="caption" tone="muted">
          {market.flag} Your fleet operates in {market.name}. The market can&apos;t be changed.
        </Text>

        {error ? <Text tone="danger">{error}</Text> : null}

        <Button
          title="Save changes"
          onPress={handleSave}
          loading={isSaving}
          disabled={!isFleetDetailsValid(details, market)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.gutter, gap: spacing.lg, paddingBottom: spacing["4xl"] },
});
