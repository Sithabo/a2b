import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IdCard, UserRound } from "lucide-react-native";
import { apiErrorMessage } from "@a2b/api-client";
import { Badge, Button, Card, ChipGroup, colors, layout, spacing, Text, TextField } from "@a2b/ui";
import { api, session, useSession } from "@/lib/session";

const LICENSE_CLASSES = ["B", "C", "CE", "D"].map((c) => ({ value: c, label: `Class ${c}` }));

/** One-time driver details: name and driving licence (needed before accepting loads). */
export default function ProfileSetupScreen() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const inFleet = !!user?.driverProfile?.fleetId;

  const [name, setName] = useState(user?.fullName ?? "");
  const [license, setLicense] = useState("");
  const [licenseClass, setLicenseClass] = useState<string>("C");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError("");
    setIsSaving(true);
    try {
      await api.me.update({ body: { fullName: name.trim() } });
      await api.me.upsertDriverProfile({ body: { licenseNumber: license.trim().toUpperCase(), licenseClass } });
      await session.refreshUser();
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
            <Badge label={inFleet ? "Fleet driver" : "Owner-operator"} tone="brand" />
            <Text variant="h1" tone="primary">
              Your driver details
            </Text>
            <Text tone="secondary">
              {inFleet
                ? "Your fleet added you. Add your licence so A2B can verify you before your first job."
                : "Add your licence so A2B can verify you. Once verified you can take loads from the board."}
            </Text>
          </View>

          <Card style={styles.form}>
            <TextField
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="As on your licence"
              leading={<UserRound size={20} color={colors.textMuted} />}
            />
            <TextField
              label="Driving licence number"
              value={license}
              onChangeText={setLicense}
              autoCapitalize="characters"
              autoCorrect={false}
              leading={<IdCard size={20} color={colors.textMuted} />}
            />
            <View style={{ gap: spacing.sm }}>
              <Text variant="label" tone="secondary">
                Licence class
              </Text>
              <ChipGroup options={LICENSE_CLASSES} value={licenseClass} onChange={setLicenseClass} />
            </View>
          </Card>

          {error ? <Text tone="danger">{error}</Text> : null}
          <Button
            title="Continue"
            onPress={handleSave}
            loading={isSaving}
            disabled={name.trim().length < 2 || license.trim().length < 3}
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
});
