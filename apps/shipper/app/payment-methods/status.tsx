import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusHero } from "@/components/StatusHero";
import { ReceiptCard, ReceiptDivider, ReceiptRow } from "@/components/ReceiptCard";
import { Button, colors, layout, ScreenHeader, spacing, Text } from "@a2b/ui";

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
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScreenHeader title="Card Status" onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatusHero state={isSuccess ? "confirmed" : "unconfirmed"} />

        <View style={styles.textCenter}>
          <Text variant="h1" tone={isSuccess ? "primary" : "danger"} align="center">
            {title}
          </Text>
          <Text tone="secondary" align="center">{subtitle}</Text>
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
        <Button
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    alignItems: "center",
  },
  textCenter: {
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: spacing['2xl'],
  },
  receiptCard: {
    marginTop: spacing.sm,
    width: "100%",
  },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
    backgroundColor: colors.background,
  },
});
