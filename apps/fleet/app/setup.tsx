import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Building2, Rocket, Truck } from "lucide-react-native";
import { getMarket, isValidTaxId, type Fleet } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { Badge, Button, Card, ChipGroup, colors, layout, spacing, Text, TextField } from "@a2b/ui";
import { api, useSession } from "@/lib/session";
import { keys, useInvalidate } from "@/lib/queries";

const SIZE_TIERS: { value: Fleet["sizeTier"]; label: string }[] = [
  { value: "1-5", label: "1–5 trucks" },
  { value: "6-20", label: "6–20 trucks" },
  { value: "20+", label: "20+ trucks" },
];

export default function FleetSetupScreen() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const market = getMarket(user?.market ?? "UG");
  const invalidate = useInvalidate();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [sizeTier, setSizeTier] = useState<Fleet["sizeTier"]>("1-5");
  const [taxId, setTaxId] = useState("");
  const [corridor, setCorridor] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const taxIdError = taxId && !isValidTaxId(taxId, market) ? `${market.taxId.issuer} TINs are ${market.taxId.hint}` : "";

  const handleSubmit = async () => {
    setError("");
    setIsSaving(true);
    try {
      await api.fleets.store({
        body: {
          name: name.trim(),
          address: address.trim() || null,
          sizeTier,
          taxId: taxId.trim() || null,
          primaryCorridor: corridor.trim() || null,
        },
      });
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

          <Card style={styles.form}>
            <TextField
              label="Company name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Apex Logistics Ltd"
              leading={<Building2 size={20} color={colors.textMuted} />}
            />
            <TextField
              label="Business address"
              value={address}
              onChangeText={setAddress}
              placeholder="Office or yard address"
            />

            <View style={styles.field}>
              <Text variant="label" tone="secondary">
                Fleet size
              </Text>
              <ChipGroup options={SIZE_TIERS} value={sizeTier} onChange={setSizeTier} />
            </View>

            <TextField
              label={`${market.taxId.issuer} tax ID (TIN)`}
              value={taxId}
              onChangeText={(v) => setTaxId(v.replace(/\D/g, ""))}
              placeholder={market.taxId.hint}
              keyboardType="number-pad"
              error={taxIdError || undefined}
              hint="Optional now; needed before your first payout."
            />
            <TextField
              label="Main corridor"
              value={corridor}
              onChangeText={setCorridor}
              placeholder={market.code === "UG" ? "e.g. Kampala → Malaba" : "e.g. Georgetown → Linden"}
              leading={<Truck size={20} color={colors.textMuted} />}
            />
          </Card>

          {error ? <Text tone="danger">{error}</Text> : null}

          <Button
            title="Launch fleet dashboard"
            icon={Rocket}
            onPress={handleSubmit}
            loading={isSaving}
            disabled={name.trim().length < 2 || !!taxIdError}
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
  form: { gap: spacing.xl },
  field: { gap: spacing.sm },
});
