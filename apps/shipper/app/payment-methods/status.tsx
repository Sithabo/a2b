import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { StatusHero } from "@/components/StatusHero";
import { ReceiptCard, ReceiptDivider, ReceiptRow } from "@/components/ReceiptCard";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function PaymentStatusScreen() {
  const router = useRouter();
  const { state } = useLocalSearchParams<{ state: "confirmed" | "unconfirmed" }>();
  
  const isSuccess = state !== "unconfirmed";

  const title = isSuccess ? "Payment Method Added!" : "Failed to Add Card";
  const subtitle = isSuccess
    ? "Your new card is ready for transactions."
    : "We couldn't verify your card details.";

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#0F3D26" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Card Status</Text>
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
            label="Verification:"
            value={isSuccess ? "Successful" : "Declined"}
          />
          <ReceiptRow label="Date:" value={today} />
          
          <ReceiptDivider />
          
          <ReceiptRow label="Secure Vault" value="Active" isBoldValue />
        </ReceiptCard>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Back to Payment Methods"
          onPress={() => router.replace("/payment-methods")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6ED", // Beige theme
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
    color: "#0F3D26",
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
    fontWeight: "900",
    color: "#0F3D26",
    textAlign: "center",
  },
  subHeading: {
    fontSize: 16,
    color: "#57534E",
    textAlign: "center",
  },
  receiptCard: {
    marginTop: 8,
    width: "100%",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: "#F7F6ED",
  },
});
