import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusHero } from "@/components/StatusHero";
import { ReceiptCard, ReceiptDivider, ReceiptRow } from "@/components/ReceiptCard";
import { colors, layout, spacing, ScreenHeader, Button, Text } from "@a2b/ui";
import { useMarket } from "@/store/useMarket";
import { formatMoney, statusMeta } from "@a2b/core";
import { parseLoadId, trackingLabel, useShipment } from "@/lib/loads";

export default function StatusScreen() {
  const router = useRouter();
  const { state, trackingId } = useLocalSearchParams<{ state: "confirmed" | "unconfirmed"; trackingId?: string }>();
  const { data: latestShipment } = useShipment(parseLoadId(trackingId));

  // Default to confirmed if not explicitly failed (for safety/demo)
  const isSuccess = state !== "unconfirmed";

  const title = isSuccess ? "Load Posted Successfully!" : "Load Submission Failed";
  const subtitle = isSuccess
    ? "Your offer is now live for drivers"
    : "We couldn't securely place your funds in escrow.";

  const dateObj = latestShipment?.createdAt ? new Date(latestShipment.createdAt) : new Date();
  const today = dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  
  const loadId = latestShipment ? trackingLabel(latestShipment) : "—";
  const market = useMarket();
  const formattedPrice = latestShipment ? formatMoney(latestShipment.offerPrice, market) : "—";

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Post Status"
        onBackPress={() => router.back()}
      />

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
            label="Status:"
            value={latestShipment ? statusMeta[latestShipment.status].label : isSuccess ? "Posted" : "Declined"}
          />
          <ReceiptRow label="Date:" value={today} />
          <ReceiptRow label="Load ID:" value={loadId} />
          
          <View style={styles.offerRow}>
            <Text variant="h2" tone="primary">Your Offer:</Text>
            <Text variant="h1" tone={isSuccess ? "primary" : "danger"}>
              {formattedPrice}
            </Text>
          </View>

          <ReceiptDivider />

          <ReceiptRow label="Total" value={formattedPrice} isBoldValue />
        </ReceiptCard>
      </ScrollView>

      {/* Persistent Bottom Action */}
      <View style={styles.footer}>
        <Button
          title="Back to Home"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Beige background matching the image
  },
  scrollContent: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["4xl"],
    alignItems: "center",
  },
  textCenter: {
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: spacing["2xl"],
  },
  receiptCard: {
    marginTop: spacing.sm,
  },
  offerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing["2xl"],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"], // safe area padding
    backgroundColor: colors.background,
  },
});
