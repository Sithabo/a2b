import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusHero } from "@/components/StatusHero";
import { ReceiptCard, ReceiptDivider, ReceiptRow } from "@/components/ReceiptCard";
import { colors, palette, ScreenHeader, Button } from "@a2b/ui";
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
          <Text style={[styles.mainHeading, !isSuccess && { color: palette.red[500] }]}>
            {title}
          </Text>
          <Text style={styles.subHeading}>{subtitle}</Text>
        </View>

        <ReceiptCard style={styles.receiptCard}>
          <ReceiptRow
            label="Status:"
            value={latestShipment ? statusMeta[latestShipment.status].label : isSuccess ? "Posted" : "Declined"}
          />
          <ReceiptRow label="Date:" value={today} />
          <ReceiptRow label="Load ID:" value={loadId} />
          
          <View style={styles.offerRow}>
            <Text style={styles.offerLabel}>Your Offer:</Text>
            <Text style={[styles.offerValue, !isSuccess && { color: palette.red[500] }]}>
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
    color: colors.primary, // brand-forest
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
    color: colors.primary,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 16,
    color: palette.stone[600], // stone-600
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
    color: colors.primary,
  },
  offerValue: {
    fontSize: 22,
    fontWeight: "900", // black
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32, // safe area padding
    backgroundColor: palette.ivory[100],
  },
});
