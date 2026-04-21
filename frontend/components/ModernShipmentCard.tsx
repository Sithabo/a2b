import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Shipment } from "@/store/useShipmentStore";
import { MessageSquare, Phone } from "lucide-react-native";

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
      {/* Optional Driver Header when found */}
      {isFound && (
        <View style={styles.driverHeader}>
          <View style={styles.driverInfoContainer}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=11" }}
              style={styles.driverAvatar}
            />
            <View>
              <Text style={styles.driverName}>Guy Hawkins</Text>
              <Text style={styles.driverRole}>Delivery Partner</Text>
            </View>
          </View>

          <View style={styles.driverActionsCapsule}>
            <TouchableOpacity style={styles.actionBtnWhite} activeOpacity={0.7}>
              <MessageSquare size={16} color="#111827" fill="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnYellow} activeOpacity={0.7}>
              <Phone size={16} color="#111827" fill="#111827" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Top Meta Row */}
      <View style={styles.topRow}>
        <Text style={styles.orderId} numberOfLines={1}>
          #{shipment.id}
        </Text>
        <Text style={styles.dateText}>
          {timeAgoOrDate(shipment.createdAt)}
        </Text>
      </View>

      {/* Main Delivery Timeline */}
      <View style={styles.contentRow}>
        <View style={styles.timelineCol}>
          {/* Absolute Dashed Line spanning between dots */}
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
    borderWidth: 1,
    borderColor: "#F5F5F4",
  },
  // Driver Header
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  driverInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  driverRole: {
    fontSize: 13,
    color: "#6B7280", // gray-500
    marginTop: 2,
  },
  driverActionsCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB", // light gray container
    borderRadius: 9999,
    padding: 4,
    gap: 8,
  },
  actionBtnWhite: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBtnYellow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FDE047", // vibrant yellow
    alignItems: "center",
    justifyContent: "center",
  },
  // Order Detail
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "900", // Black
    color: "#1C1917", // stone-900
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: "#78716C",
    fontWeight: "500",
  },
  contentRow: {
    flexDirection: "row",
  },
  timelineCol: {
    width: "100%",
    position: "relative",
  },
  dashedLine: {
    position: "absolute",
    left: 9, 
    top: 14, 
    bottom: 24, 
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
    width: 20, 
    marginRight: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4, 
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
    paddingBottom: 24,
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
});
