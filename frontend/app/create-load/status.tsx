import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { StatusHero } from "@/components/StatusHero";
import { ReceiptCard, ReceiptDivider, ReceiptRow } from "@/components/ReceiptCard";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function StatusScreen() {
  const router = useRouter();
  const { state } = useLocalSearchParams<{ state: "confirmed" | "unconfirmed" }>();
  
  // Default to confirmed if not explicitly failed (for safety/demo)
  const isSuccess = state !== "unconfirmed";

  const title = isSuccess ? "Load Posted Successfully!" : "Load Submission Failed";
  const subtitle = isSuccess
    ? "Your offer is now live for drivers"
    : "We couldn't securely place your funds in escrow.";

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const loadId = "#A2B-" + Math.floor(1000 + Math.random() * 9000);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#0F3D26" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Post Status</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatusHero state={isSuccess ? "confirmed" : "unconfirmed"} />

        <View style={styles.textCenter}>
          <Text style={[styles.mainHeading, !isSuccess && { color: "#EF4444" }]}>
            {title}
          </Text>
          <Text style={styles.subHeading}>{subtitle}</Text>
        </View>

        <ReceiptCard style={styles.receiptCard}>
          <ReceiptRow
            label="Payment Status:"
            value={isSuccess ? "Escrow Secured" : "Declined"}
          />
          <ReceiptRow label="Date:" value={today} />
          <ReceiptRow label="Load ID:" value={loadId} />
          
          <View style={styles.offerRow}>
            <Text style={styles.offerLabel}>Your Offer:</Text>
            <Text style={[styles.offerValue, !isSuccess && { color: "#EF4444" }]}>
              150,000 UGX
            </Text>
          </View>

          <ReceiptDivider />

          <ReceiptRow label="Total" value="150,000 UGX" isBoldValue />
        </ReceiptCard>
      </ScrollView>

      {/* Persistent Bottom Action */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Back to Home"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6ED", // Beige background matching the image
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26", // brand-forest
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  textCenter: {
    alignItems: "center",
    gap: 8,
    marginVertical: 24,
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: "900", // black
    color: "#0F3D26",
    textAlign: "center",
  },
  subHeading: {
    fontSize: 16,
    color: "#57534E", // stone-600
    textAlign: "center",
  },
  receiptCard: {
    marginTop: 8,
  },
  offerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 4,
  },
  offerLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  offerValue: {
    fontSize: 22,
    fontWeight: "900", // black
    color: "#0F3D26",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32, // safe area padding
    backgroundColor: "#F7F6ED",
  },
});
