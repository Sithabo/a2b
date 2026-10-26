import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Clock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Badge,
  Button,
  colors,
  fontFamily,
  layout,
  radius,
  ScreenHeader,
  spacing,
  Text,
  tones,
} from "@a2b/ui";
import { useMarket } from "@/store/useMarket";
import { formatMarketTime, formatMoney, statusMeta } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { api } from "@/lib/session";
import { parseLoadId, trackingLabel, useInvalidateLoads, useShipment } from "@/lib/loads";
import { LoadState } from "@/components/LoadState";
import { LoadDocuments } from "@/components/LoadDocuments";

export default function PendingDeliveryScreen() {
  const router = useRouter();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const insets = useSafeAreaInsets();

  const loadId = parseLoadId(trackingId);
  const { data: shipment, error, refetch } = useShipment(loadId);
  const invalidateLoads = useInvalidateLoads();

  const market = useMarket();
  const formatCurrency = (amount: number) => formatMoney(amount, market);

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to delete this pending order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await api.loads.cancel({ params: { id: loadId! }, body: {} });
              await invalidateLoads();
              router.replace("/(tabs)");
            } catch (err) {
              Alert.alert("Couldn't cancel", apiErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  if (!shipment) return <LoadState error={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader
        title="Order Details"
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Waiting Pill */}
        <View style={styles.statusPillContainer}>
          <Badge
            label={statusMeta[shipment.status].label}
            tone={statusMeta[shipment.status].tone}
            icon={Clock}
            style={styles.statusPill}
          />
        </View>

        {/* Receipt Card Wrapper */}
        <View style={styles.receiptWrapper}>
          {/* Main Card Content */}
          <View style={styles.receiptCard}>
            {/* Top Image & Price */}
            <View style={styles.receiptHeader}>
              <View style={styles.cargoBoxContainer}>
                <Image
                  source={require("@/assets/images/cargo_box.png")}
                  style={styles.cargoImage}
                  contentFit="contain"
                />
              </View>
              <Text variant="display" tone="primary" style={styles.priceText}>
                {formatCurrency(shipment.offerPrice)}
              </Text>
            </View>

            {/* Visual Divider with Cutouts */}
            <View style={styles.dividerRow}>
              <View style={[styles.cutout, styles.cutoutLeft]} />
              <View style={styles.dashedLineHorizontal} />
              <View style={[styles.cutout, styles.cutoutRight]} />
            </View>

            {/* Order Details Metadata */}
            <View style={styles.metadataSection}>
              <View style={styles.metaRow}>
                <Text variant="body" tone="secondary">Order ID:</Text>
                <Text variant="bodyStrong">{trackingLabel(shipment)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text variant="body" tone="secondary">Date Posted:</Text>
                <Text variant="bodyStrong">{formatMarketTime(shipment.createdAt, market, "date")}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text variant="body" tone="secondary">Status:</Text>
                <Badge label={statusMeta[shipment.status].label} tone={statusMeta[shipment.status].tone} dot />
              </View>
            </View>

            <View style={styles.solidDivider} />

            {/* Timeline */}
            <View style={styles.timelineSection}>
              <View style={styles.timelineLine} />

              {/* Pickup */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineTextContainer}>
                  <Text variant="label" tone="muted">PICKUP</Text>
                  <Text variant="bodyStrong" style={styles.timelineLocation}>{shipment.pickupSummary}</Text>
                </View>
              </View>

              {/* Delivery */}
              <View style={[styles.timelineRow, styles.timelineRowSpaced]}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineTextContainer}>
                  <Text variant="label" tone="muted">DELIVERY</Text>
                  <Text variant="bodyStrong" style={styles.timelineLocation}>{shipment.dropoffSummary}</Text>
                </View>
              </View>
            </View>

            <View style={styles.tipBox}>
              <Text variant="bodySm" color={tones.success.fg}>
                <Text variant="bodySm" color={tones.success.fg} style={styles.tipBold}>Tip:</Text> Your offer is within
                the fair market range for this route.
              </Text>
            </View>
          </View>
        </View>

        {/* Customs documents uploaded for an import load */}
        <LoadDocuments load={shipment} style={styles.documentsSection} />
      </ScrollView>

      {/* Sticky Bottom Cancel Action */}
      <View
        style={[
          styles.cancelActionContainer,
          { bottom: insets.bottom > 0 ? insets.bottom : spacing.xl },
        ]}
      >
        <Button
          title="Cancel Order"
          variant="danger"
          fullWidth
          onPress={handleCancelOrder}
        />
      </View>
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
  },
  statusPillContainer: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.sm,
    alignItems: "center",
  },
  statusPill: {
    alignSelf: "center",
  },
  receiptWrapper: {
    paddingHorizontal: layout.gutter,
    marginTop: spacing.lg,
    position: "relative",
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
  receiptHeader: {
    alignItems: "center",
    paddingHorizontal: spacing["2xl"],
  },
  cargoBoxContainer: {
    width: 140,
    height: 140,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  cargoImage: {
    width: 120,
    height: 120,
  },
  priceText: {
    marginBottom: spacing["2xl"],
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    height: 30,
    marginVertical: spacing.sm,
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
    left: -15,
  },
  cutoutRight: {
    right: -15,
  },
  metadataSection: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  solidDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing["2xl"],
    marginVertical: spacing["2xl"],
  },
  timelineSection: {
    paddingHorizontal: spacing["2xl"],
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 31, // centre of the dots: section padding + half the dot - half the line
    top: 10,
    bottom: 30, // ends inside the delivery dot
    width: 2,
    backgroundColor: colors.primary,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineRowSpaced: {
    marginTop: spacing["2xl"],
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginTop: spacing.xxs,
    marginRight: spacing.lg,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineLocation: {
    marginTop: spacing.xs,
  },
  tipBox: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing["3xl"],
    backgroundColor: colors.successMuted,
    borderWidth: 1,
    borderColor: tones.success.bg,
    borderRadius: radius.sm,
    padding: spacing.lg,
  },
  tipBold: {
    fontFamily: fontFamily.bold,
  },
  documentsSection: {
    paddingHorizontal: layout.gutter,
    marginTop: spacing["2xl"],
  },
  cancelActionContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: layout.gutter,
  },
});
