import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock } from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useShipmentStore } from "@/store/useShipmentStore";

export default function ReleaseFundsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const updateShipmentStatus = useShipmentStore((state) => state.updateShipmentStatus);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} />
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#111827" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Release Funds</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Give this 6-digit code to the driver{"\n"}to release payment.
        </Text>

        {/* Big Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeText}>482 915</Text>
        </View>

        {/* Demo Button to simulate Driver Entry */}
        <TouchableOpacity
          style={styles.demoButton}
          activeOpacity={0.8}
          onPress={() => {
            const idToFind = trackingId ? trackingId.replace("#", "") : "";
            if (idToFind) {
              updateShipmentStatus(idToFind, "COMPLETED");
            }
            router.replace({ pathname: "/official-receipt", params: { trackingId } });
          }}
        >
          <Text style={styles.demoButtonText}>[Demo: Simulate Driver Entering Code]</Text>
        </TouchableOpacity>

        {/* Expiration Timer */}
        <View style={styles.timerRow}>
          <Clock color="#D97706" size={16} />
          <Text style={styles.timerText}>Expires in 09:52</Text>
        </View>

        <Text style={styles.warningText}>
          Only give this code if you have{"\n"}inspected your goods.
        </Text>
      </View>

      {/* Bottom Actions */}
      <View style={[styles.actionSection, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Remake Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.textButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text style={styles.textButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5E9",
  },
  header: {
    backgroundColor: "#F5F5E9",
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    paddingTop: 24,
  },
  instructionText: {
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  codeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  codeText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#0F3D26",
    letterSpacing: 2,
  },
  demoButton: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 32,
  },
  demoButtonText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "bold",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  timerText: {
    color: "#D97706",
    fontSize: 14,
    fontWeight: "bold",
  },
  warningText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 40, // standard safe area bottom padding space
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#0F3D26",
    borderRadius: 9999,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  textButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  textButtonText: {
    color: "#0F3D26",
    fontSize: 16,
    fontWeight: "bold",
  },
});
