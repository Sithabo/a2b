import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Building2, MapPin } from "lucide-react-native";
import { apiErrorMessage } from "@a2b/api-client";
import { api, useSession } from "@/lib/session";
import { useMarket } from "@/store/useMarket";
import { Button, colors, IconButton, spacing, Text, TextField } from "@a2b/ui";

export default function BusinessDetailsScreen() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [region, setRegion] = useState("");
  const market = useMarket();
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useSession((state) => state.setUser);
  const completeOnboarding = useSession((state) => state.completeOnboarding);
  const [error, setError] = useState("");

  const handleCompleteRegistration = async () => {
    if (!companyName || !region) return;
    setError("");
    setIsLoading(true);
    try {
      await api.me.upsertShipperProfile({ body: { companyName, region, isImporter: false } });
      await api.me.update({ body: { fullName: companyName } });
      const { data: me } = await api.me.show({});
      setUser(me);
      completeOnboarding();
      router.replace("/(tabs)");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <IconButton
            icon={ArrowLeft}
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.backButton}
          />

          <View style={styles.headerContainer}>
            <Text variant="display" tone="primary">
              Business Details
            </Text>
            <Text tone="secondary">
              Almost done. Tell us about your operations.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextField
              label="Company / Trading Name"
              leading={<Building2 size={20} color={colors.textPlaceholder} />}
              placeholder="e.g. Acme Logistics"
              value={companyName}
              onChangeText={setCompanyName}
            />

            <TextField
              label="Operating region"
              leading={<MapPin size={20} color={colors.textPlaceholder} />}
              placeholder={market.code === "GY" ? "e.g. Georgetown" : "e.g. Kampala Central"}
              value={region}
              onChangeText={setRegion}
            />

            {error ? <Text tone="danger">{error}</Text> : null}

            <Button
              title="Complete Registration"
              size="lg"
              onPress={handleCompleteRegistration}
              loading={isLoading}
              disabled={!companyName || !region}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing['2xl'],
  },
  backButton: {
    marginBottom: spacing['3xl'],
  },
  headerContainer: {
    gap: spacing.sm,
    marginBottom: spacing['4xl'],
  },
  formContainer: {
    gap: spacing['2xl'],
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
