import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Rocket } from "lucide-react-native";
import { getMarket } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { Badge, Button, colors, layout, spacing, Text } from "@a2b/ui";
import { EMPTY_FLEET_DETAILS, FleetDetailsForm, fleetDetailsBody, isFleetDetailsValid } from "@/components/FleetDetailsForm";
import { api, useSession } from "@/lib/session";
import { keys, useInvalidate } from "@/lib/queries";

export default function FleetSetupScreen() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const market = getMarket(user?.market ?? "UG");
  const invalidate = useInvalidate();

  const [details, setDetails] = useState(EMPTY_FLEET_DETAILS);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setIsSaving(true);
    try {
      await api.fleets.store({ body: fleetDetailsBody(details) });
      await invalidate(keys.fleet);
      router.replace("/(tabs)");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Badge label="Fleet setup" tone="brand" />
            <Text variant="h1" tone="primary">
              Set up your fleet
            </Text>
            <Text tone="secondary">
              This is the business shippers see on your loads and the account escrow payouts go to.
            </Text>
          </View>

          <FleetDetailsForm value={details} onChange={setDetails} market={market} />

          {error ? <Text tone="danger">{error}</Text> : null}

          <Button
            title="Launch fleet dashboard"
            icon={Rocket}
            onPress={handleSubmit}
            loading={isSaving}
            disabled={!isFleetDetailsValid(details, market)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.gutter, gap: spacing.xl },
  header: { gap: spacing.sm },
});
