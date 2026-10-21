import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Check, FileText, Share2 } from "lucide-react-native";
import { Button, colors, radius, ScreenHeader, spacing, Text } from "@a2b/ui";
import { useMarket } from "@/store/useMarket";
import { cargoLabel, formatMoney, paymentMethods } from "@a2b/core";
import { parseLoadId, trackingLabel, useShipment } from "@/lib/loads";
import { LoadState } from "@/components/LoadState";

export default function OfficialReceiptScreen() {
  const router = useRouter();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const { data: shipment, error, refetch } = useShipment(parseLoadId(trackingId));

  const market = useMarket();
  const formatCurrency = (amount: number) => formatMoney(amount, market);

  if (!shipment) return <LoadState error={error} onRetry={refetch} />;
  const vehicle = shipment.carrier?.vehicle;

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader title="Official Receipt" onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successCircle}>
            <Check color={colors.onPrimary} size={48} strokeWidth={3} />
          </View>
        </View>

        {/* Title */}
        <Text variant="h1" tone="primary" style={styles.title}>Job Completed!</Text>

        {/* Receipt Wrapper */}
        <View style={styles.receiptWrapper}>
          <View style={styles.receiptCard}>

            {/* Metadata Rows */}
            <View style={styles.metadataSection}>
              <View style={styles.metaRow}>
                <Text variant="bodySm" tone="secondary" style={styles.metaLabel}>Load ID:</Text>
                <Text variant="bodyStrong" align="right" style={styles.metaValue}>
                  {trackingLabel(shipment)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text variant="bodySm" tone="secondary" style={styles.metaLabel}>Driver:</Text>
                <Text variant="bodyStrong" align="right" style={styles.metaValue}>
                  {shipment.carrier?.driverName ?? "—"}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text variant="bodySm" tone="secondary" style={styles.metaLabel}>Pickup:</Text>
                <Text variant="bodyStrong" align="right" style={styles.metaValue} numberOfLines={2}>
                  {shipment.pickupSummary}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text variant="bodySm" tone="secondary" style={styles.metaLabel}>Delivery:</Text>
                <Text variant="bodyStrong" align="right" style={styles.metaValue} numberOfLines={2}>
                  {shipment.dropoffSummary}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text variant="bodySm" tone="secondary" style={styles.metaLabel}>Vehicle:</Text>
                <Text variant="bodyStrong" align="right" style={styles.metaValue}>
                  {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.plate})` : "—"}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text variant="bodySm" tone="secondary" style={styles.metaLabel}>Load Type:</Text>
                <Text variant="bodyStrong" align="right" style={styles.metaValue}>
                  {cargoLabel(shipment.cargoType)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text variant="bodySm" tone="secondary" style={styles.metaLabel}>Payment Method:</Text>
                <Text variant="bodyStrong" align="right" style={styles.metaValue}>
                  {shipment.escrow?.depositMethod ? paymentMethods[shipment.escrow.depositMethod].label : "—"}
                </Text>
              </View>
            </View>

            {/* Cutout Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.cutout, styles.cutoutLeft]} />
              <View style={styles.dashedLineHorizontal} />
              <View style={[styles.cutout, styles.cutoutRight]} />
            </View>

            {/* Price Footer */}
            <View style={styles.priceSection}>
              <Text variant="h3" tone="primary">Amount Paid:</Text>
              <Text variant="h2" tone="primary">{formatCurrency(shipment.escrow?.amount ?? shipment.offerPrice)}</Text>
            </View>

          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Not wired up yet: these were TouchableOpacitys without an onPress. */}
          <Button title="Download PDF" variant="secondary" icon={FileText} fullWidth onPress={() => {}} />

          <Button title="Share via WhatsApp" variant="secondary" icon={Share2} fullWidth onPress={() => {}} />

          <Button
            title="Back to Home"
            fullWidth
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)")}
          />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing["4xl"],
    alignItems: "center",
  },
  successIconContainer: {
    marginTop: spacing["2xl"],
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: spacing["3xl"],
  },
  receiptWrapper: {
    width: "100%",
    paddingHorizontal: spacing["2xl"],
    position: "relative",
    marginBottom: spacing["3xl"],
  },
  receiptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing["3xl"],
    position: "relative",
    overflow: "hidden", // clips the outer half of the cutouts
  },
  metadataSection: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  metaLabel: {
    flex: 1,
  },
  metaValue: {
    flex: 1,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    height: 30, // height of the cutout
    marginTop: spacing["2xl"],
    marginBottom: spacing.lg,
  },
  dashedLineHorizontal: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    marginHorizontal: spacing.lg,
  },
  cutout: {
    position: "absolute",
    top: 0,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 2,
  },
  cutoutLeft: {
    left: -15, // Pull outside the card
  },
  cutoutRight: {
    right: -15,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing["2xl"],
  },
  actionsContainer: {
    width: "100%",
    paddingHorizontal: spacing["2xl"],
    gap: spacing.md,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
});
