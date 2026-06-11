import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Clipboard,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  ArrowLeft,
  Truck,
  Clock,
  User,
  Star,
  PhoneCall,
  MessageSquare,
  Package,
  Copy,
  Check,
  Compass,
} from "lucide-react-native";
import { useShipmentStore } from "@/store/useShipmentStore";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function ActiveDeliveryScreen() {
  const router = useRouter();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const idToFind = trackingId ? trackingId.replace("#", "") : "";
  const shipments = useShipmentStore((state) => state.shipments);
  const editShipment = useShipmentStore((state) => state.editShipment);

  // Find dynamic shipment or fallback to default
  const shipment =
    shipments.find((s) => s.id === idToFind) ||
    shipments.find((s) => s.status === "ACTIVE") ||
    shipments[0];

  const currentMilestoneIndex = shipment?.milestoneIndex ?? 2;
  const isImport = shipment?.is_import ?? false;

  const handleCallDriver = () => {
    Linking.openURL("tel:+5926000101").catch((err) =>
      console.error("Failed to open dialer:", err)
    );
  };

  const handleMessageDriver = () => {
    const message = `Hi John, regarding shipment #${shipment?.id || "A2B-9874"}`;
    const url = Platform.select({
      ios: `sms:+5926000101&body=${encodeURIComponent(message)}`,
      default: `sms:+5926000101?body=${encodeURIComponent(message)}`,
    });
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open messaging app:", err)
    );
  };

  const copyToClipboard = () => {
    if (shipment?.id) {
      Clipboard.setString(shipment.id);
      Alert.alert("Copied", `Tracking ID #${shipment.id} copied to clipboard!`);
    }
  };

  const handleAdvanceMilestone = () => {
    if (shipment && currentMilestoneIndex < 6) {
      const nextIndex = currentMilestoneIndex + 1;
      editShipment(shipment.id, {
        milestoneIndex: nextIndex,
        // If we reach the last milestone, update status to DELIVERED
        status: nextIndex === 6 ? "DELIVERED" : shipment.status,
      });
    }
  };

  const handleResetMilestones = () => {
    if (shipment) {
      editShipment(shipment.id, {
        milestoneIndex: 0,
        status: "ACTIVE",
      });
    }
  };

  // Helper to format timestamps relative to shipment.createdAt
  const baseDate = new Date(shipment?.createdAt || Date.now());
  const getFormattedTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  const getMilestoneTime = (index: number) => {
    const d = new Date(baseDate.getTime() + index * 90 * 60 * 1000); // 1.5h intervals
    return getFormattedTime(d);
  };

  const pickupName = shipment?.pickup || "Kampala, Makindye";
  const deliveryName = shipment?.delivery || "Jinja, Industrial Area";

  // 7 milestones mapping
  const milestones = [
    {
      key: "DISPATCHED",
      title: "Driver Dispatched",
      location: isImport ? "Georgetown Logistics Hub" : "Kampala Logistics Depot",
      verification: "Contract Locked & Dispatched",
    },
    {
      key: "ARRIVED_AT_PICKUP",
      title: "Gate-In / Arrival at Origin",
      location: isImport ? "Georgetown Port Terminal" : pickupName,
      verification: "Gate-In Recorded",
    },
    {
      key: "DEPARTED_ORIGIN",
      title: "Loaded & Cleared Customs",
      location: isImport ? "GRA Customs Gate" : pickupName + " Exit Gate",
      verification: isImport ? "Cargo Loaded & Customs Cleared" : "Cargo Loaded & Strapped",
    },
    {
      key: "CHOKE_POINT_CLEARED",
      title: "Major Infrastructure Nodes",
      location: isImport ? "Linden Weighbridge" : "Mukono Weighbridge",
      verification: "PASSED (Axle Weight OK)",
    },
    {
      key: "PROXIMITY_ALERT",
      title: "The Proximity Buffer",
      location: isImport ? "Wismar Hub Outskirts" : "Lugazi Outskirts",
      verification: "Proximity Alert (Est: 45 mins)",
    },
    {
      key: "ARRIVED_AT_DELIVERY",
      title: "Arrival at Destination",
      location: deliveryName,
      verification: "Backed into Unloading Dock",
    },
    {
      key: "DELIVERED",
      title: "Cargo Signed & Confirmed",
      location: deliveryName + " Receiving",
      verification: "Proof of Delivery Uploaded",
    },
  ];

  const getMilestoneStatusText = (index: number) => {
    switch (index) {
      case 0:
        return "Driver Dispatched";
      case 1:
        return "Arrived at Pickup";
      case 2:
        return "Departed Origin";
      case 3:
        return "In Transit (Bottleneck Cleared)";
      case 4:
        return "In Transit (Near Destination)";
      case 5:
        return "Arrived at Delivery Point";
      case 6:
        return "Delivered & Signed";
      default:
        return "In Transit";
    }
  };

  const getCargoName = () => {
    if (!shipment) return "General Cargo";
    if (shipment.cargo?.type) {
      return shipment.cargo.type
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ");
    }
    return shipment.cargoType || "General Cargo";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <ScreenHeader
        title="Active Delivery"
        subtitle={getMilestoneStatusText(currentMilestoneIndex)}
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Card (emulates screenshot) */}
        <View style={styles.topCard}>
          <View style={styles.topAvatarContainer}>
            <Package color="#D97706" size={32} />
          </View>
          <Text style={styles.topTitle}>{getCargoName()}</Text>
          <View style={styles.trackingRow}>
            <Text style={styles.trackingIdText}>
              #Tracking ID: {shipment?.id || "A2B-9874"}
            </Text>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={styles.copyBtn}
              activeOpacity={0.6}
            >
              <Copy color="#6B7280" size={14} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Specs Details Card (emulates screenshot grey card) */}
        <View style={styles.specsCard}>
          <View style={styles.specsRow}>
            <Text style={styles.specsLabel}>From:</Text>
            <Text style={styles.specsValue} numberOfLines={1}>
              {pickupName}
            </Text>
          </View>
          <View style={styles.specsRow}>
            <Text style={styles.specsLabel}>Destination:</Text>
            <Text style={styles.specsValue} numberOfLines={1}>
              {deliveryName}
            </Text>
          </View>
          <View style={styles.specsRow}>
            <Text style={styles.specsLabel}>Driver:</Text>
            <Text style={styles.specsValue}>
              {shipment?.driverName || "John Mukasa"}
            </Text>
          </View>
          <View style={styles.specsRow}>
            <Text style={styles.specsLabel}>Weight:</Text>
            <Text style={styles.specsValue}>
              {shipment?.weight || "250"} KG
            </Text>
          </View>
          <View style={[styles.specsRow, styles.specsRowLast]}>
            <Text style={styles.specsLabel}>Status:</Text>
            <Text style={[styles.specsValue, { color: "#0F3D26" }]}>
              {getMilestoneStatusText(currentMilestoneIndex)}
            </Text>
          </View>
        </View>

        {/* Contact Actions (Wired tel: and sms:) */}
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.callButton}
            activeOpacity={0.8}
            onPress={handleCallDriver}
          >
            <PhoneCall color="white" size={16} />
            <Text style={styles.callText}>Call Driver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageButton}
            activeOpacity={0.7}
            onPress={handleMessageDriver}
          >
            <MessageSquare color="#374151" size={16} />
            <Text style={styles.messageText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Vertical Stepper Timeline Component (replacing live map) */}
        <View style={styles.card}>
          <View style={styles.timelineHeader}>
            <Compass color="#0F3D26" size={18} />
            <Text style={styles.cardSectionTitle}>Milestone Tracking Timeline</Text>
          </View>

          <View style={styles.timelineContainer}>
            {milestones.map((item, index) => {
              const isCompleted = index < currentMilestoneIndex;
              const isActive = index === currentMilestoneIndex;
              const isPending = index > currentMilestoneIndex;

              return (
                <View key={item.key} style={styles.timelineItem}>
                  {/* Left Column: Dot & Line */}
                  <View style={styles.indicatorContainer}>
                    <View
                      style={[
                        styles.timelineDot,
                        isCompleted && styles.dotCompleted,
                        isActive && styles.dotActive,
                        isPending && styles.dotPending,
                      ]}
                    >
                      {isActive && <View style={styles.dotActiveInner} />}
                    </View>
                    {index < milestones.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          index < currentMilestoneIndex
                            ? styles.lineCompleted
                            : styles.linePending,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Milestone Info */}
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeaderRow}>
                      <Text
                        style={[
                          styles.timelineTitle,
                          index <= currentMilestoneIndex
                            ? styles.textCompleted
                            : styles.textPending,
                        ]}
                      >
                        {item.title}
                      </Text>
                      {isCompleted && (
                        <Check color="#10B981" size={16} style={styles.checkIcon} />
                      )}
                      {isActive && (
                        <View style={styles.activePill}>
                          <Text style={styles.activePillText}>ACTIVE</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.timelineMetaText}>
                      {isPending ? "--:--" : getMilestoneTime(index)} • {item.location}
                    </Text>

                    <Text
                      style={[
                        styles.timelineVerificationText,
                        index < currentMilestoneIndex
                          ? styles.verificationCompleted
                          : index === currentMilestoneIndex
                          ? styles.verificationActive
                          : styles.verificationPending,
                      ]}
                    >
                      {isPending ? "Pending" : item.verification}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Milestone Simulator Card */}
        <View style={styles.simulatorCard}>
          <View style={styles.simulatorHeader}>
            <Text style={styles.simulatorTitle}>Milestone Simulator</Text>
            <Text style={styles.simulatorSubtitle}>
              Simulate geofenced updates and driver manifest approvals.
            </Text>
          </View>
          <View style={styles.simulatorActions}>
            <TouchableOpacity
              style={[
                styles.simButton,
                currentMilestoneIndex >= 6 && styles.simButtonDisabled,
              ]}
              onPress={handleAdvanceMilestone}
              disabled={currentMilestoneIndex >= 6}
              activeOpacity={0.8}
            >
              <Text style={styles.simButtonText}>Advance Milestone</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simResetButton}
              onPress={handleResetMilestones}
              activeOpacity={0.7}
            >
              <Text style={styles.simResetButtonText}>Reset Progress</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Truck color="#6B7280" size={14} />
            <Text style={styles.cardTitle}>Vehicle Information</Text>
          </View>

          <View style={styles.vehicleGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Vehicle Type</Text>
              <Text style={styles.gridValue}>Lorry (Medium)</Text>
            </View>
            <View style={[styles.gridItem, { alignItems: "flex-end" }]}>
              <Text style={styles.gridLabel}>Capacity</Text>
              <Text style={styles.gridValue}>5 Tons</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Make & Model</Text>
              <Text style={styles.gridValue}>Isuzu FRR</Text>
            </View>
            <View style={[styles.gridItem, { alignItems: "flex-end" }]}>
              <Text style={styles.gridLabel}>Number Plate</Text>
              <View style={styles.plateBox}>
                <Text style={styles.plateText}>UAM 456K</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Bottom */}
      <View
        style={[
          styles.confirmActionContainer,
          { bottom: insets.bottom > 0 ? insets.bottom : 20 },
        ]}
      >
        <TouchableOpacity
          style={styles.confirmButton}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/confirm-delivery",
              params: { trackingId: shipment?.id },
            })
          }
        >
          <Text style={styles.confirmButtonText}>
            {currentMilestoneIndex === 6
              ? "Confirm & Release Funds"
              : "Confirm Delivery"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#0F3D26",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56, // For safe area
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#A7F3D0",
    fontSize: 12,
    fontWeight: "500",
  },
  placeholderIcon: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  topCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  trackingIdText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  copyBtn: {
    padding: 4,
  },
  specsCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    width: "100%",
  },
  specsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  specsRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  specsLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  specsValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    paddingLeft: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactActions: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: "#0F3D26",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#0F3D26",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  callText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  messageButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  messageText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  timelineContainer: {
    width: "100%",
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: "row",
    minHeight: 88,
  },
  indicatorContainer: {
    alignItems: "center",
    width: 16,
    marginRight: 16,
    position: "relative",
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
    zIndex: 10,
  },
  dotCompleted: {
    backgroundColor: "#111827",
  },
  dotActive: {
    backgroundColor: "#111827",
    borderWidth: 3,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  dotActiveInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  dotPending: {
    backgroundColor: "#E5E7EB",
  },
  timelineLine: {
    position: "absolute",
    top: 18,
    bottom: -12,
    left: 6,
    width: 2,
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: "#111827",
  },
  linePending: {
    backgroundColor: "#E5E7EB",
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  textCompleted: {
    color: "#111827",
  },
  textActive: {
    color: "#111827",
  },
  textPending: {
    color: "#9CA3AF",
  },
  checkIcon: {
    marginRight: 4,
  },
  activePill: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  timelineMetaText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
  timelineVerificationText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  verificationCompleted: {
    color: "#0F3D26",
  },
  verificationActive: {
    color: "#D97706",
  },
  verificationPending: {
    color: "#9CA3AF",
  },
  simulatorCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  simulatorHeader: {
    marginBottom: 12,
  },
  simulatorTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B45309",
  },
  simulatorSubtitle: {
    fontSize: 12,
    color: "#78350F",
    marginTop: 2,
  },
  simulatorActions: {
    flexDirection: "row",
    gap: 12,
  },
  simButton: {
    flex: 1,
    backgroundColor: "#D97706",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  simButtonDisabled: {
    backgroundColor: "#FCD34D",
    opacity: 0.6,
  },
  simButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  simResetButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D97706",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  simResetButtonText: {
    color: "#D97706",
    fontWeight: "bold",
    fontSize: 12,
  },
  vehicleGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
  },
  gridItem: {
    width: "50%",
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
  plateBox: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 4,
  },
  plateText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
    color: "#1F2937",
  },
  confirmActionContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#0F3D26",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
