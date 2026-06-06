import React from "react";
import { View, Text, StyleSheet, Image, ViewStyle, ImageSourcePropType, TouchableOpacity } from "react-native";
import { Package } from "lucide-react-native";
import { Shipment } from "@/store/useShipmentStore";

export interface ShippingCardProps {
  shipment: Shipment;
  imageSource?: ImageSourcePropType;
  style?: ViewStyle;
  onPress?: () => void;
}

export const ShippingCard: React.FC<ShippingCardProps> = ({
  shipment,
  imageSource,
  style,
  onPress,
}) => {
  // Spelled out location name helper
  const getDisplayLocation = (locStr?: string) => {
    if (!locStr) return "N/A";
    const parts = locStr.split(",");
    if (parts.length > 1) {
      return parts[0].trim();
    }
    return locStr.trim();
  };

  const pickupName = getDisplayLocation(shipment.pickup);
  const deliveryName = getDisplayLocation(shipment.delivery);

  // Date format helper: e.g. "22 Mar 26"
  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return "--";
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return "--";
      const day = dateObj.getDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear().toString().slice(-2);
      return `${day < 10 ? "0" + day : day} ${month} ${year}`;
    } catch {
      return "--";
    }
  };

  const pickupDate = formatDateOnly(shipment.createdAt);
  const deliveryDate = formatDateOnly(shipment.deliveryDate);

  // Translate status text into clean English labels
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "In Transit";
      case "MATCHED":
        return "Driver Found";
      case "SECURED":
        return "Secured";
      case "COMPLETED":
      case "DELIVERED":
        return "Delivered";
      case "OPEN":
      default:
        return "Pending";
    }
  };

  const statusLabel = getStatusLabel(shipment.status);
  const formattedTrackingId = shipment.id.startsWith("#") ? shipment.id : `#${shipment.id}`;

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={styles.imageContainer}>
            {imageSource ? (
              <Image source={imageSource} style={styles.cargoImage} resizeMode="cover" />
            ) : (
              <Package size={24} color="#0F3D26" strokeWidth={2} />
            )}
          </View>
          <View style={styles.metaInfo}>
            <Text style={styles.trackingId}>{formattedTrackingId}</Text>
            <Text style={styles.cargoType}>{shipment.cargoType}</Text>
          </View>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.locCol}>
          <Text style={styles.locLabel}>{pickupName}</Text>
          <Text style={styles.locDate}>{pickupDate}</Text>
        </View>
        <View style={styles.locColRight}>
          <Text style={styles.locLabelRight}>{deliveryName}</Text>
          <Text style={styles.locDate}>{deliveryDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 50px",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  imageContainer: {
    width: 54,
    height: 54,
    borderRadius: 16, // Squircle - slightly less rounded than fully circular image container
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  cargoImage: {
    width: "100%",
    height: "100%",
  },
  metaInfo: {
    justifyContent: "center",
  },
  trackingId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  cargoType: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: "#0F3D26", // Forest Green status pill
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  locCol: {
    gap: 4,
  },
  locColRight: {
    gap: 4,
    alignItems: "flex-end",
  },
  locLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  locLabelRight: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "right",
  },
  locDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
});
