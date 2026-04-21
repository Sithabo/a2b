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

const timeAgo = (dateString: string) => {
  const diffInMinutes = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 60000
  );
  if (isNaN(diffInMinutes) || diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
};

export const ModernShipmentCard: React.FC<ModernShipmentCardProps> = ({
  shipment,
  status,
  onPress,
}) => {
  const isFound = status === "found";
  const formattedPrice = shipment.offerPrice 
    ? Number(shipment.offerPrice).toLocaleString() 
    : "150,000"; // fallback

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Driver Header (Found State Only) */}
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
              <MessageSquare size={14} color="#111827" fill="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnYellow} activeOpacity={0.7}>
              <Phone size={14} color="#111827" fill="#111827" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Order Row */}
      <View style={[styles.orderRow, isFound && { marginTop: 0 }]}>
        <View style={styles.orderLeft}>
          {!isFound && (
            <Image
              source={require("@/assets/images/cargo_box.png")}
              style={styles.tinyBox}
              contentFit="cover"   // using cover to crop out padding if needed
            />
          )}
          <Text style={styles.orderId} numberOfLines={1}>
            #{shipment.id}
          </Text>
        </View>
        <Text style={styles.priceText}>{formattedPrice} UGX</Text>
      </View>

      {/* Timeline Layout */}
      <View style={styles.timelineWrapper}>
        <View style={styles.timelineDashedLine} />

        {/* Pickup */}
        <View style={styles.timelineStep}>
          <View style={styles.dotContainer}>
            <View style={[styles.dot, styles.dotBlack]} />
          </View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepLabel}>PICKUP</Text>
            <Text style={styles.stepValue} numberOfLines={2}>
              {shipment.pickup || "Location not provided"}
            </Text>
          </View>
        </View>

        {/* Delivery */}
        <View style={styles.timelineStep}>
          <View style={styles.dotContainer}>
            <View style={[styles.dot, styles.dotDarkGreen]} />
          </View>
          <View style={[styles.stepTextContainer, { paddingBottom: 0 }]}>
            <Text style={styles.stepLabel}>DELIVERY</Text>
            <Text style={styles.stepValue} numberOfLines={2}>
              {shipment.delivery || "Location not provided"}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer (Waiting State Only) */}
      {!isFound && (
        <Text style={styles.postedText}>
          Posted {timeAgo(shipment.createdAt)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  // Driver Header
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  driverInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  driverName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  driverRole: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  driverActionsCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 9999,
    padding: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: "#F3F4F6", // gentle bound for visibility
  },
  actionBtnWhite: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnYellow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FDE047",
    alignItems: "center",
    justifyContent: "center",
  },

  // Order Row
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  orderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  tinyBox: {
    width: 32,
    height: 32,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1C1917", // near black
  },
  priceText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1C1917",
  },

  // Timeline
  timelineWrapper: {
    position: "relative",
    width: "100%",
  },
  timelineDashedLine: {
    position: "absolute",
    left: 7, // centered under dot -> 14px width dot -> center is 7
    top: 14, // below top dot
    bottom: 24, // stop above bottom dot bounding box
    width: 0,
    borderLeftWidth: 2,
    borderColor: "#0F3D26", // Dark green mapping to the mockup line color
    borderStyle: "dashed",
    zIndex: 1,
    opacity: 0.8,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dotContainer: {
    alignItems: "center",
    width: 14, // strictly dot width
    marginRight: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 2, // alignment tweak based on visual text label
    zIndex: 2,
  },
  dotBlack: {
    backgroundColor: "#1F2937",
  },
  dotDarkGreen: {
    backgroundColor: "#0F3D26", // brand-forest
  },
  stepTextContainer: {
    flex: 1,
    paddingBottom: 22,
  },
  stepLabel: {
    fontSize: 11,
    color: "#6B7280", // gray-500
    marginBottom: 2,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  stepValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    lineHeight: 20,
  },

  // Footer
  postedText: {
    marginTop: 12,
    fontSize: 13,
    color: "#6B7280", // gray-500
    fontWeight: "500",
  },
});
