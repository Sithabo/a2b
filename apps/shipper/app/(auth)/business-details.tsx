import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
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
import { colors, palette, Text, Button } from "@a2b/ui";

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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={palette.gray[900]} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text variant="display" tone="primary" style={styles.headerTitle}>
              Business Details
            </Text>
            <Text tone="primary" style={styles.headerSubtitle}>
              Almost done. Tell us about your operations.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Company Name */}
            <View style={styles.inputGroup}>
              <Text tone="primary" style={styles.inputLabel}>
                Company / Trading Name
              </Text>
              <View style={styles.inputWrapper}>
                <Building2 size={20} color={palette.gray[400]} />
                <TextInput
                  placeholder="e.g. Acme Logistics"
                  placeholderTextColor={palette.gray[400]}
                  style={styles.textInput}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>
            </View>

            {/* Operating Region */}
            <View style={styles.inputGroup}>
              <Text tone="primary" style={styles.inputLabel}>
                Operating region
              </Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color={palette.gray[400]} />
                <TextInput
                  placeholder={market.code === "GY" ? "e.g. Georgetown" : "e.g. Kampala Central"}
                  placeholderTextColor={palette.gray[400]}
                  style={styles.textInput}
                  value={region}
                  onChangeText={setRegion}
                />
              </View>
            </View>

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
    backgroundColor: palette.ivory[200],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.gray[200],
    marginBottom: 32,
  },
  headerContainer: {
    gap: 8,
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 16,
    color: palette.gray[600],
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: palette.gray[900],
  },
  submitButton: {
    marginTop: 16,
  },
});
