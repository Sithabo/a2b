import React from "react";
import {
  View,
  ScrollView,
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
import {
  Truck,
  Package,
  Copy,
  X,
} from "lucide-react-native";
import { DriverContactCard } from "@/components/DriverContactCard";
import { LoadState } from "@/components/LoadState";
import { milestoneIndex, parseLoadId, trackingLabel, useShipment, weightLabel } from "@/lib/loads";
import { cargoLabel, formatMoney, getMarket, vehicleClasses } from "@a2b/core";
import { useCancelLoad } from "@a2b/features";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import {
  Button,
  Card,
  colors,
  elevation,
  IconButton,
  layout,
  palette,
  PlateBadge,
  radius,
  ScreenHeader,
  spacing,
  Text,
} from "@a2b/ui";

export default function ActiveDeliveryScreen() {
  const router = useRouter();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const insets = useSafeAreaInsets();

  const [vehicleModalVisible, setVehicleModalVisible] = React.useState(false);

  // Milestones come from the driver; poll while the load is moving.
  const { data: shipment, error, refetch } = useShipment(parseLoadId(trackingId), { pollMs: 30_000 });
  const cancel = useCancelLoad(parseLoadId(trackingId) ?? 0);

  // Until the driver picks up, the shipper can still cancel and get the escrow back
  const confirmCancel = () => {
    if (!shipment) return;
    Alert.alert(
      "Cancel this shipment?",
      `The driver hasn't picked up yet. You'll get a full refund of ${formatMoney(shipment.escrow?.amount ?? shipment.offerPrice, getMarket(shipment.market))}.`,
      [
        { text: "Keep shipment", style: "cancel" },
        {
          text: "Cancel & refund",
          style: "destructive",
          onPress: () => cancel.mutate(undefined, { onSuccess: () => router.replace("/(tabs)") }),
        },
      ]
    );
  };

  const currentMilestoneIndex = shipment ? milestoneIndex(shipment) : 0;
  const isImport = shipment?.isImport ?? false;
  const driverName = shipment?.carrier?.driverName ?? "Your driver";
  const driverPhone = shipment?.carrier?.driverPhone;
  const vehicle = shipment?.carrier?.vehicle;

  const handleCallDriver = () => {
    if (!driverPhone) return;
    Linking.openURL(`tel:${driverPhone}`).catch((err) =>
      console.error("Failed to open dialer:", err),
    );
  };

  const handleMessageDriver = () => {
    if (!driverPhone || !shipment) return;
    const message = `Hi ${driverName}, regarding shipment ${trackingLabel(shipment)}`;
    const url = Platform.select({
      ios: `sms:${driverPhone}&body=${encodeURIComponent(message)}`,
      default: `sms:${driverPhone}?body=${encodeURIComponent(message)}`,
    });
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open messaging app:", err),
    );
  };

  const copyToClipboard = () => {
    if (shipment) {
      Clipboard.setString(shipment.reference ?? shipment.id);
      Alert.alert("Copied", `Tracking ID ${trackingLabel(shipment)} copied to clipboard!`);
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

  const pickupName = shipment?.pickupSummary ?? "";
  const deliveryName = shipment?.dropoffSummary ?? "";

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

  if (!shipment) return <LoadState error={error} onRetry={refetch} />;


  return (
    <View style={styles.container}>
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
            <Package color={colors.accent} size={32} />
          </View>
          <View style={styles.topTextContainer}>
            <Text variant="h2">{cargoLabel(shipment.cargoType)}</Text>
            <View style={styles.trackingRow}>
              <Text variant="bodySm" tone="muted">
                Tracking ID: {trackingLabel(shipment)}
              </Text>
              <IconButton
                icon={Copy}
                variant="plain"
                size={28}
                onPress={copyToClipboard}
                accessibilityLabel="Copy tracking ID"
              />
            </View>
          </View>
        </View>

        {/* Specs Details Card (emulates screenshot grey card) */}
        <Card variant="muted" padding="lg">
          <View style={styles.specsRow}>
            <Text variant="bodySm" tone="muted">From:</Text>
            <Text variant="bodyStrong" align="right" style={styles.specsValue} numberOfLines={1}>
              {pickupName}
            </Text>
          </View>
          <View style={styles.specsRow}>
            <Text variant="bodySm" tone="muted">Destination:</Text>
            <Text variant="bodyStrong" align="right" style={styles.specsValue} numberOfLines={1}>
              {deliveryName}
            </Text>
          </View>
          <View style={styles.specsRow}>
            <Text variant="bodySm" tone="muted">Driver:</Text>
            <Text variant="bodyStrong" align="right" style={styles.specsValue}>
              {driverName}
            </Text>
          </View>
          <View style={styles.specsRow}>
            <Text variant="bodySm" tone="muted">Weight:</Text>
            <Text variant="bodyStrong" align="right" style={styles.specsValue}>
              {weightLabel(shipment)}
            </Text>
          </View>
          <View style={[styles.specsRow, styles.specsRowLast]}>
            <Text variant="bodySm" tone="muted">Status:</Text>
            <Text variant="bodyStrong" tone="primary" align="right" style={styles.specsValue}>
              {getMilestoneStatusText(currentMilestoneIndex)}
            </Text>
          </View>
        </Card>

        {/* Driver Contact Card (Clickable to show Vehicle Modal) */}
        <DriverContactCard
          driverName={driverName}
          onPressCard={() => setVehicleModalVisible(true)}
          onCallPress={handleCallDriver}
          onMessagePress={handleMessageDriver}
        />

        {/* Vertical Stepper Timeline Component (replacing live map) */}
        <View style={styles.timelineContainer}>
          <MilestoneTimeline
            milestones={milestones}
            currentMilestoneIndex={currentMilestoneIndex}
            getMilestoneTime={getMilestoneTime}
          />
        </View>
      </ScrollView>

      {/* Action Bottom */}
      <View
        style={[
          styles.confirmActionContainer,
          { bottom: insets.bottom > 0 ? insets.bottom : spacing.xl },
        ]}
      >
        {shipment.status === "SECURED" && (
          <Button
            title="Cancel shipment"
            variant="ghost"
            onPress={confirmCancel}
            loading={cancel.isPending}
            accessibilityHint="Cancels before pickup and refunds your deposit"
          />
        )}
        <Button
          title={
            currentMilestoneIndex === 6
              ? "Confirm & Release Funds"
              : "Confirm Delivery"
          }
          fullWidth
          onPress={() =>
            router.push({
              pathname: "/confirm-delivery",
              params: { trackingId: String(shipment.id) },
            })
          }
        />
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
          accessibilityRole="button"
          accessibilityLabel="Close"
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
              <Text variant="h3">Driver & Vehicle Info</Text>
              <IconButton
                icon={X}
                variant="plain"
                onPress={() => setVehicleModalVisible(false)}
                accessibilityLabel="Close"
              />
            </View>

            {/* Driver Profile Summary */}
            <View style={styles.modalDriverSummary}>
              <Image
                source={require("@/assets/images/driver_avatar.png")}
                style={styles.modalDriverAvatar}
                contentFit="cover"
              />
              <View style={styles.modalDriverText}>
                <Text variant="bodyStrong">
                  {driverName}
                </Text>
                <Text variant="bodySm" tone="muted" style={styles.modalDriverRole}>
                  Delivery Partner • Verified
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.modalDivider} />

            {/* Vehicle Details Title */}
            <View style={styles.modalSectionHeader}>
              <Truck color={colors.primary} size={18} />
              <Text variant="label" tone="primary">Vehicle Details</Text>
            </View>

            {/* Vehicle Details Grid */}
            <View style={styles.modalGrid}>
              <View style={styles.modalGridItem}>
                <Text variant="label" tone="muted" style={styles.modalGridLabel}>Vehicle Type</Text>
                <Text variant="bodyStrong">
                  {vehicle ? vehicleClasses[vehicle.vehicleClass].label : "—"}
                </Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text variant="label" tone="muted" style={styles.modalGridLabel}>Capacity</Text>
                <Text variant="bodyStrong">
                  {vehicle ? `${vehicle.capacityTons} Tons` : "—"}
                </Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text variant="label" tone="muted" style={styles.modalGridLabel}>Make & Model</Text>
                <Text variant="bodyStrong">
                  {vehicle ? `${vehicle.make} ${vehicle.model}` : "—"}
                </Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text variant="label" tone="muted" style={styles.modalGridLabel}>Number Plate</Text>
                <PlateBadge plate={vehicle?.plate ?? "—"} size="sm" />
              </View>
            </View>

            {/* Close Button */}
            <Button
              title="Got It"
              fullWidth
              style={styles.modalButton}
              onPress={() => setVehicleModalVisible(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: layout.gutter,
    gap: spacing.lg,
  },
  topCard: {
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
    gap: spacing["2xl"],
  },
  topAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.amber[100],
  },
  topTextContainer: {
    flexShrink: 1,
  },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  specsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  specsRowLast: {
    paddingBottom: spacing.xs,
  },
  specsValue: {
    flex: 1,
    paddingLeft: spacing.lg,
  },
  timelineContainer: {
    width: "100%",
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.xl,
  },
  confirmActionContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: layout.gutter,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: spacing["2xl"],
    paddingBottom: spacing["4xl"],
    ...elevation.md,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  modalDriverSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  modalDriverAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
  },
  modalDriverText: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  modalDriverRole: {
    marginTop: spacing.xxs,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  modalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.lg,
    columnGap: spacing.lg,
    marginBottom: spacing["2xl"],
  },
  modalGridItem: {
    width: "47%",
  },
  modalGridLabel: {
    marginBottom: spacing.xs,
  },
  modalButton: {
    marginTop: spacing.sm,
  },
});
