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
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Building2, MapPin } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";

export default function BusinessDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [companyName, setCompanyName] = useState("");
  const [region, setRegion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);

  const handleCompleteRegistration = () => {
    if (!companyName || !region) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      signUp({
        name: companyName, // Default name to company name for now
        phone: (params.phone as string) || "",
        company: companyName,
        region: region,
        role: (params.role as string) || "shipper",
      });
      router.replace("/(tabs)");
    }, 1500);
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
            <ArrowLeft size={20} color={Colors.light.gray[900]} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <ThemedText type="title" style={styles.headerTitle}>
              Business Details
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Almost done. Tell us about your operations.
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            {/* Company Name */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                Company / Trading Name
              </ThemedText>
              <View style={styles.inputWrapper}>
                <Building2 size={20} color={Colors.light.gray[400]} />
                <TextInput
                  placeholder="e.g. Acme Logistics"
                  placeholderTextColor={Colors.light.gray[400]}
                  style={styles.textInput}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>
            </View>

            {/* Operating Region */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                Preferred Operating Region
              </ThemedText>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color={Colors.light.gray[400]} />
                <TextInput
                  placeholder="e.g. Nairobi Hub"
                  placeholderTextColor={Colors.light.gray[400]}
                  style={styles.textInput}
                  value={region}
                  onChangeText={setRegion}
                />
              </View>
            </View>

            <Button
              title="Complete Registration"
              size="lg"
              onPress={handleCompleteRegistration}
              isLoading={isLoading}
              disabled={!companyName || !region}
              style={styles.submitButton}
              textStyle={styles.submitButtonText}
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
    backgroundColor: Colors.light.ivory,
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.gray[200],
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
    color: Colors.light.gray[600],
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontWeight: "600",
    color: Colors.light.primary,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.light.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.light.gray[900],
  },
  submitButton: {
    marginTop: 16,
    // backgroundColor: "#000000",
    borderRadius: 12,
  },
  submitButtonText: {
    // color: "#FFFFFF",
    fontWeight: "bold",
  },
});
