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
  Modal,
  Pressable,
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
  Phone,
  Mail,
  X,
} from "lucide-react-native";
import { useShipmentStore } from "@/store/useShipmentStore";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DriverContactCard } from "@/components/DriverContactCard";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";

export default function ActiveDeliveryScreen() {
  const router = useRouter();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const [vehicleModalVisible, setVehicleModalVisible] = React.useState(false);

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
      console.error("Failed to open dialer:", err),
    );
  };

  const handleMessageDriver = () => {
    const message = `Hi John, regarding shipment #${shipment?.id || "A2B-9874"}`;
    const url = Platform.select({
      ios: `sms:+5926000101&body=${encodeURIComponent(message)}`,
      default: `sms:+5926000101?body=${encodeURIComponent(message)}`,
    });
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open messaging app:", err),
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
  const baseDate = (() => {
    if (!shipment?.createdAt) return new Date();
    const d = new Date(shipment.createdAt);
    return isNaN(d.getTime()) ? new Date() : d;
  })();
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
      location: isImport
        ? "Georgetown Logistics Hub"
        : "Kampala Logistics Depot",
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
      verification: isImport
        ? "Cargo Loaded & Customs Cleared"
        : "Cargo Loaded & Strapped",
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
    <View style={[styles.container, { backgroundColor: theme.whiteAsh }]}>
      {/* Header */}
      <ScreenHeader
        title="Active Delivery"
        // subtitle={getMilestoneStatusText(currentMilestoneIndex)}
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
          <View>
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

        {/* Driver Contact Card (Clickable to show Vehicle Modal) */}
        <DriverContactCard
          driverName={shipment?.driverName || "Guy Hawkins"}
          onPressCard={() => setVehicleModalVisible(true)}
          onCallPress={handleCallDriver}
          onMessagePress={handleMessageDriver}
        />

        {/* Vertical Stepper Timeline Component (replacing live map) */}
        {/* <View style={styles.card}> */}
        {/* <View style={styles.timelineHeader}>
          <Compass color="#0F3D26" size={18} />
          <Text style={styles.cardSectionTitle}>
            Milestone Tracking Timeline
          </Text>
        </View> */}

        <View style={styles.timelineContainer}>
          <MilestoneTimeline
            milestones={milestones}
            currentMilestoneIndex={currentMilestoneIndex}
            getMilestoneTime={getMilestoneTime}
          />
        </View>
        {/* </View> */}

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
        {/* <View style={styles.card}>
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
        </View> */}
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

      {/* Vehicle Info Modal */}
      <Modal
        visible={vehicleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVehicleModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVehicleModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle/Indicator */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Driver & Vehicle Info</Text>
              <TouchableOpacity
                onPress={() => setVehicleModalVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.6}
              >
                <X color="#374151" size={20} />
              </TouchableOpacity>
            </View>

            {/* Driver Profile Summary */}
            <View style={styles.modalDriverSummary}>
              <Image
                source={require("@/assets/images/driver_avatar.png")}
                style={styles.modalDriverAvatar}
                contentFit="cover"
              />
              <View style={styles.modalDriverText}>
                <Text style={styles.modalDriverName}>
                  {shipment?.driverName || "Guy Hawkins"}
                </Text>
                <Text style={styles.modalDriverRole}>
                  Delivery Partner • Verified
                </Text>
                <View style={styles.modalRatingRow}>
                  <Star color="#D97706" size={14} fill="#D97706" />
                  <Text style={styles.modalRatingText}>
                    4.9 (124 deliveries)
                  </Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.modalDivider} />

            {/* Vehicle Details Title */}
            <View style={styles.modalSectionHeader}>
              <Truck color="#0F3D26" size={18} />
              <Text style={styles.modalSectionTitle}>Vehicle Details</Text>
            </View>

            {/* Vehicle Details Grid */}
            <View style={styles.modalGrid}>
              <View style={styles.modalGridItem}>
                <Text style={styles.modalGridLabel}>Vehicle Type</Text>
                <Text style={styles.modalGridValue}>Lorry (Medium)</Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.modalGridLabel}>Capacity</Text>
                <Text style={styles.modalGridValue}>5 Tons (5,000 KG)</Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.modalGridLabel}>Make & Model</Text>
                <Text style={styles.modalGridValue}>Isuzu FRR</Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.modalGridLabel}>Number Plate</Text>
                <View style={styles.modalPlateBox}>
                  <Text style={styles.modalPlateText}>UAM 456K</Text>
                </View>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.modalGridLabel}>Cargo Area</Text>
                <Text style={styles.modalGridValue}>5.4m x 2.2m x 2.1m</Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.modalGridLabel}>Compliance Status</Text>
                <View style={styles.complianceBadge}>
                  <View style={styles.complianceDot} />
                  <Text style={styles.complianceText}>Active & Insured</Text>
                </View>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.8}
              onPress={() => setVehicleModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Got It</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    // backgroundColor: "#FFFFFF",
    // borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    gap: 24,
    // borderWidth: 1,
    // borderColor: "#F3F4F6",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
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
    // textAlign: "center",
  },
  trackingRow: {
    flexDirection: "row",
    // alignItems: "center",
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
    // borderBottomWidth: 1,
    // borderBottomColor: "#E5E7EB",
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
    paddingHorizontal: 25,
    paddingVertical: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalDriverSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalDriverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
  },
  modalDriverText: {
    marginLeft: 16,
    flex: 1,
  },
  modalDriverName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  modalDriverRole: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  modalRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  modalRatingText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },
  modalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F3D26",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
    columnGap: 16,
    marginBottom: 24,
  },
  modalGridItem: {
    width: "47%",
  },
  modalGridLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalGridValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalPlateBox: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignSelf: "flex-start",
  },
  modalPlateText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1F2937",
  },
  complianceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  complianceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  complianceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  modalButton: {
    width: "100%",
    backgroundColor: "#0F3D26",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
