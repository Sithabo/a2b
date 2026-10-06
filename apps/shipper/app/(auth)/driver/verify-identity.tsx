import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield } from "lucide-react-native";
import { FileUpload } from "@/components/ui/FileUpload";
import { colors, palette, Text, Button } from "@a2b/ui";

export default function VerifyIdentityScreen() {
  const router = useRouter();
  const [nationalIdStatus, setNationalIdStatus] = useState<
    "empty" | "completed"
  >("empty");
  const [permitStatus, setPermitStatus] = useState<"empty" | "completed">(
    "empty"
  );
  const [vehicleStatus, setVehicleStatus] = useState<"empty" | "completed">(
    "empty"
  );
  const [isLoading, setIsLoading] = useState(false);

  const mockUpload = (
    setStatus: React.Dispatch<React.SetStateAction<"empty" | "completed">>
  ) => {
    // Simulate upload
    setStatus("completed");
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/(auth)/driver/under-review");
    }, 1500);
  };

  const isFormValid =
    nationalIdStatus === "completed" &&
    permitStatus === "completed" &&
    vehicleStatus === "completed";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={palette.gray[900]} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text variant="display" tone="primary" style={styles.headerTitle}>
            Verify Your Identity
          </Text>
          <Text tone="primary" style={styles.headerSubtitle}>
            Upload the following documents to get started.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.section}>
            <Text tone="primary" style={styles.sectionTitle}>Identity</Text>
            <FileUpload
              label="National ID"
              description="Front and Back"
              status={nationalIdStatus}
              onPress={() => mockUpload(setNationalIdStatus)}
            />
            <FileUpload
              label="Driving Permit"
              description="Valid permit required"
              status={permitStatus}
              onPress={() => mockUpload(setPermitStatus)}
            />
          </View>

          <View style={styles.section}>
            <Text tone="primary" style={styles.sectionTitle}>Vehicle</Text>
            <FileUpload
              label="Vehicle Photo"
              description="Show license plate clearly"
              status={vehicleStatus}
              onPress={() => mockUpload(setVehicleStatus)}
            />
          </View>
        </View>

        <View style={styles.securityNote}>
          <Shield size={24} color={colors.primary} />
          <View style={styles.securityTextContainer}>
            <Text tone="primary" style={styles.securityTitle}>
              Secure Verification
            </Text>
            <Text variant="caption" tone="secondary" style={styles.securityDescription}>
              Your documents are encrypted and only used for verification
              purposes.
            </Text>
          </View>
        </View>

        <Button
          title="Submit Documents"
          size="lg"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!isFormValid}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.ivory[200],
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 52,
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
    marginBottom: 24,
  },
  headerContainer: {
    gap: 8,
    marginBottom: 32,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 18,
    color: palette.gray[500],
  },
  formContainer: {
    gap: 40,
    marginBottom: 40,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: colors.primary,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 4,
  },
  securityNote: {
    backgroundColor: "rgba(15, 61, 38, 0.05)", // Forest/5
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(15, 61, 38, 0.1)",
    alignItems: "center",
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontWeight: "bold",
    color: colors.primary,
    fontSize: 14,
    marginBottom: 2,
  },
  securityDescription: {
    color: palette.gray[500],
  },
});
