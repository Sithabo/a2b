import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { getMarket, parsePhone } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { Button, Card, colors, IconButton, layout, spacing, Text, TextField } from "@a2b/ui";
import { api } from "@/lib/session";
import { keys, useFleet, useInvalidate } from "@/lib/queries";

export default function AddDriverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fleet = useFleet();
  const invalidate = useInvalidate();
  const market = getMarket(fleet.data?.market ?? "UG");

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const phone = parsePhone(number, market);
    if (!phone) {
      setError(`Enter a valid ${market.name} mobile number`);
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await api.fleets.addDriver({ body: { phone, fullName: name.trim() || null } });
      await invalidate(keys.drivers);
      router.back();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text variant="h2" tone="primary" style={{ flex: 1 }}>
          Add driver
        </Text>
        <IconButton icon={X} onPress={() => router.back()} accessibilityLabel="Close" />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.form}>
          <TextField label="Full name" value={name} onChangeText={setName} placeholder="e.g. John Mukasa" />
          <TextField
            label="Mobile number"
            value={number}
            onChangeText={(v) => {
              setNumber(v);
              setError("");
            }}
            placeholder={market.phone.example}
            keyboardType="phone-pad"
            leading={<Text variant="bodyStrong" tone="secondary">{market.phone.callingCode}</Text>}
            error={error || undefined}
            hint="They'll sign in to the A2B Driver app with this number."
          />
        </Card>
        <Button title="Add to fleet" onPress={handleSave} loading={isSaving} disabled={!number.trim()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: layout.gutter,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  content: { padding: layout.gutter, gap: spacing.lg },
  form: { gap: spacing.xl },
});
