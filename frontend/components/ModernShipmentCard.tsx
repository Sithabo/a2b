import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Shipment } from "@/store/useShipmentStore"; // Ensure path is right based on project

interface ModernShipmentCardProps {
  shipment: Shipment | any;
  status: "waiting" | "found";
  onPress?: () => void;
}

const timeAgoOrDate = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const ModernShipmentCard: React.FC<ModernShipmentCardProps> = ({
  shipment,
  status,
  onPress,
}) => {
  const isFound = status === "found";

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Top Meta Row */}
      <View style={styles.topRow}>
        <Text style={styles.orderId} numberOfLines={1}>
          #{shipment.id}
        </Text>

        <View style={styles.rightMetaGroup}>
          <View
            style={[
              styles.statusPill,
              isFound ? styles.statusFound : styles.statusWaiting,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isFound ? styles.statusTextFound : styles.statusTextWaiting,
              ]}
            >
              {isFound ? "Driver Found" : "Waiting..."}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {timeAgoOrDate(shipment.createdAt)}
          </Text>
        </View>
      </View>

      {/* Main Delivery Timeline & Mockup */}
      <View style={styles.contentRow}>
        {/* Timeline Col */}
        <View style={styles.timelineCol}>
          {/* Absolute Dashed Line spanning the gap between top dot and bottom dot */}
          <View style={styles.dashedLine} />

          {/* Pickup Step */}
          <View style={styles.timelineStep}>
            <View style={styles.dotContainer}>
              <View style={[styles.dot, styles.dotBlack]} />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.timelineLabel}>Pickup</Text>
              <Text style={styles.timelineValue} numberOfLines={2}>
                {shipment.pickup || "Location not provided"}
              </Text>
            </View>
          </View>

          {/* Delivery Step */}
          <View style={styles.timelineStep}>
            <View style={styles.dotContainer}>
              <View style={[styles.dot, styles.dotYellow]} />
            </View>
            <View style={[styles.stepTextContainer, { paddingBottom: 0 }]}>
              <Text style={styles.timelineLabel}>Deliver To</Text>
              <Text style={styles.timelineValue} numberOfLines={2}>
                {shipment.delivery || "Location not provided"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Modern Edge Box Mockup */}
      <View style={styles.cargoImageWrapper} pointerEvents="none">
        <Image
          source={require("@/assets/images/cargo_box.png")}
          style={styles.cargoImage}
          contentFit="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 20,
    minHeight: 200,
    borderWidth: 1,
    borderColor: "#F5F5F4",
    position: "relative",
    overflow: "hidden", // Critical to clip the box image cleanly
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    zIndex: 2,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "900", // Black
    color: "#1C1917", // stone-900
    flex: 1,
    paddingRight: 16,
  },
  rightMetaGroup: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusFound: {
    backgroundColor: "#ECFDF5", // emerald-50
    borderWidth: 1,
    borderColor: "#6EE7B7",
  },
  statusWaiting: {
    backgroundColor: "#FEF3C7", // amber-50
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  statusTextFound: {
    color: "#059669",
  },
  statusTextWaiting: {
    color: "#D97706",
  },
  dateText: {
    fontSize: 14,
    color: "#78716C",
    fontWeight: "500",
  },
  contentRow: {
    flexDirection: "row",
    position: "relative",
    zIndex: 2,
    // Ensures text never stretches over the box image
    paddingRight: 100, 
  },
  timelineCol: {
    width: "100%",
    position: "relative",
  },
  dashedLine: {
    position: "absolute",
    left: 9, // Exactly centered under the 20px wide dotContainer (width 20 -> center is 10. dot width 14)
    top: 14, // Start exactly below top dot
    bottom: 24, // End slightly above bottom dot bounds
    width: 0,
    borderLeftWidth: 2,
    borderColor: "#FACC15",
    borderStyle: "dashed",
    zIndex: 1,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dotContainer: {
    alignItems: "center",
    width: 20, // Strict width to center the dashed line easily
    marginRight: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4, // Drop slightly so it aligns with the first text line visually
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
  },
  dotBlack: {
    backgroundColor: "#1C1917",
  },
  dotYellow: {
    backgroundColor: "#FACC15",
  },
  stepTextContainer: {
    flex: 1,
    paddingBottom: 24, // Spacing between steps
  },
  timelineLabel: {
    fontSize: 14,
    color: "#78716C",
    marginBottom: 4,
    fontWeight: "500",
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C1917",
    lineHeight: 22,
  },
  cargoImageWrapper: {
    position: "absolute",
    right: -25,
    bottom: -20,
    width: 120,
    height: 120,
    zIndex: 1,
    opacity: 0.95,
  },
  cargoImage: {
    width: "100%",
    height: "100%",
    // The image has a white background in the asset itself which blocks elements natively.
    // Adding mixBlendMode multiply can strip the white background, but it's not supported natively in all RN versions.
    // Instead we just constrain it tightly to the bottom right and keep text margins away from it.
  },
});
