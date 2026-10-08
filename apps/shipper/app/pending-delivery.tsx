import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Clock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge, colors, palette, ScreenHeader } from "@a2b/ui";
import { useMarket } from "@/store/useMarket";
import { formatMoney, statusMeta } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { api } from "@/lib/api";
import { parseLoadId, trackingLabel, useInvalidateLoads, useShipment } from "@/lib/loads";
import { LoadState } from "@/components/LoadState";

export default function PendingDeliveryScreen() {
  const router = useRouter();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const insets = useSafeAreaInsets();

  const loadId = parseLoadId(trackingId);
  const { data: shipment, error, refetch } = useShipment(loadId);
  const invalidateLoads = useInvalidateLoads();

  const market = useMarket();
  const formatCurrency = (val?: string) => formatMoney(val, market);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "--";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    } catch {
      return dateStr;
    }
  };

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <View style={styles.statusPill}>
            <Clock color={palette.white} size={16} />
            <Text style={styles.statusPillText}>Waiting for Driver</Text>
          </View>
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
              <Text style={styles.priceText}>{formatCurrency(shipment.offerPrice)}</Text>
            </View>

            {/* Visual Divider with Cutouts */}
            <View style={styles.dividerRow}>
              <View style={[styles.cutoutLeft, { backgroundColor: colors.background }]} />
              <View style={styles.dashedLineHorizontal} />
              <View style={[styles.cutoutRight, { backgroundColor: colors.background }]} />
            </View>

            {/* Order Details Metadata */}
            <View style={styles.metadataSection}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Order ID:</Text>
                <Text style={styles.metaValue}>{trackingLabel(shipment)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date Posted:</Text>
                <Text style={styles.metaValue}>{formatDate(shipment.createdAt)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Status:</Text>
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
                  <Text style={styles.timelineSubLabel}>PICKUP</Text>
                  <Text style={styles.timelineLocation}>{shipment.pickup}</Text>
                </View>
              </View>

              {/* Delivery */}
              <View style={[styles.timelineRow, { marginTop: 28 }]}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineTextContainer}>
                  <Text style={styles.timelineSubLabel}>DELIVERY</Text>
                  <Text style={styles.timelineLocation}>{shipment.delivery}</Text>
                </View>
              </View>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                <Text style={styles.tipBold}>Tip:</Text> Your offer is within
                the fair market range for this route.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Cancel Action */}
      <View
        style={[
          styles.cancelActionContainer,
          { bottom: insets.bottom > 0 ? insets.bottom : 20 },
        ]}
      >
        <TouchableOpacity
          style={styles.stickyCancelButton}
          activeOpacity={0.8}
          onPress={handleCancelOrder}
        >
          <Text style={styles.stickyCancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statusPillContainer: {
    paddingHorizontal: 16,
    marginTop: -16,
    alignItems: "center",
    zIndex: 11,
    paddingTop: 24,
  },
  statusPill: {
    backgroundColor: palette.amber[600],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 9999,
    width: "100%",
    gap: 8,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusPillText: {
    color: palette.white,
    fontWeight: "bold",
    fontSize: 15,
  },
  receiptWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
    position: "relative",
  },
  receiptCard: {
    backgroundColor: palette.white,
    borderRadius: 24,
    paddingVertical: 32,
    position: "relative",
  },
  receiptHeader: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cargoBoxContainer: {
    width: 140,
    height: 140,
    backgroundColor: palette.gray[50],
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cargoImage: {
    width: 120,
    height: 120,
  },
  priceText: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.primary,
    marginBottom: 24,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    height: 30,
    marginVertical: 8,
  },
  dashedLineHorizontal: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderColor: palette.gray[200],
    borderStyle: "dashed",
    marginHorizontal: 15,
  },
  cutoutLeft: {
    position: "absolute",
    left: -15,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    zIndex: 2,
  },
  cutoutRight: {
    position: "absolute",
    right: -15,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    zIndex: 2,
  },
  metadataSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 15,
    color: palette.gray[600],
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: palette.gray[900],
  },
  escrowBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  escrowText: {
    fontSize: 15,
    fontWeight: "bold",
    color: palette.emerald[600],
  },
  solidDivider: {
    height: 1,
    backgroundColor: palette.gray[100],
    marginHorizontal: 24,
    marginVertical: 24,
  },
  timelineSection: {
    paddingHorizontal: 24,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 31,
    top: 10,
    bottom: 24,
    width: 2,
    backgroundColor: colors.primary,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginTop: 2,
    marginRight: 16,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineSubLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: palette.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timelineLocation: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.gray[900],
    marginTop: 4,
  },
  tipBox: {
    marginHorizontal: 24,
    marginTop: 32,
    backgroundColor: palette.emerald[50],
    borderWidth: 1,
    borderColor: palette.emerald[200],
    borderRadius: 8,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    color: palette.emerald[800],
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: "bold",
  },
  cancelActionContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  stickyCancelButton: {
    width: "100%",
    backgroundColor: palette.red[50],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.red[100],
    shadowColor: palette.red[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  stickyCancelButtonText: {
    color: palette.red[500],
    fontSize: 16,
    fontWeight: "bold",
  },
});
