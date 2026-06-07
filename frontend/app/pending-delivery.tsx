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
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShipmentStore } from "@/store/useShipmentStore";

export default function PendingDeliveryScreen() {
  const router = useRouter();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const idToFind = trackingId ? trackingId.replace("#", "") : "";
  const shipments = useShipmentStore((state) => state.shipments);
  const deleteShipment = useShipmentStore((state) => state.deleteShipment);

  // Find dynamic shipment or fallback to default
  const shipment = shipments.find((s) => s.id === idToFind) || shipments[1];

  const formatCurrency = (val?: string) => {
    if (!val) return "0 GYD";
    const num = parseFloat(val);
    return isNaN(num) ? `${val} GYD` : `${num.toLocaleString("en-US")} GYD`;
  };

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
          onPress: () => {
            deleteShipment(shipment.id);
            router.replace("/(tabs)");
          },
        },
      ]
    );
  };

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
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Waiting Pill */}
        <View style={styles.statusPillContainer}>
          <View style={styles.statusPill}>
            <Clock color="#FFFFFF" size={16} />
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
              <View style={styles.cutoutLeft} />
              <View style={styles.dashedLineHorizontal} />
              <View style={styles.cutoutRight} />
            </View>

            {/* Order Details Metadata */}
            <View style={styles.metadataSection}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Order ID:</Text>
                <Text style={styles.metaValue}>#{shipment.id}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date Posted:</Text>
                <Text style={styles.metaValue}>{formatDate(shipment.createdAt)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Payment Status:</Text>
                <View style={styles.escrowBadge}>
                  <Text style={styles.escrowText}>Escrow Secured</Text>
                  <CheckCircle color="#fff" size={16} fill="#059669" />
                </View>
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

            {/* Tip Box */}
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                <Text style={styles.tipBold}>Tip:</Text> Your offer is within
                the fair market range for this route.
              </Text>
            </View>

            {/* Cancel Order Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5E9",
  },
  header: {
    backgroundColor: "#0F3D26",
    paddingBottom: 16,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
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
    backgroundColor: "#D97706",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 9999,
    width: "100%",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusPillText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  receiptWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
    position: "relative",
  },
  receiptCard: {
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#F9FAFB",
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
    color: "#0F3D26",
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
    borderColor: "#E5E7EB",
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
    backgroundColor: "#F5F5E9",
    zIndex: 2,
  },
  cutoutRight: {
    position: "absolute",
    right: -15,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F5F5E9",
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
    color: "#4B5563",
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  escrowBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  escrowText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#059669",
  },
  solidDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
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
    backgroundColor: "#0F3D26",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0F3D26",
    marginTop: 2,
    marginRight: 16,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineSubLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timelineLocation: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },
  tipBox: {
    marginHorizontal: 24,
    marginTop: 32,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 8,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    color: "#065F46",
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: "bold",
  },
  cancelButton: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "bold",
  },
});
