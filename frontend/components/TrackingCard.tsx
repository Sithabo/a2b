import React from "react";
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from "react-native";
import { Package, Wrench, FlaskConical, Apple, QrCode } from "lucide-react-native";
import { Shipment } from "@/store/useShipmentStore";

export interface TrackingCardProps {
  shipment: Shipment;
  style?: ViewStyle;
  onPress?: () => void;
}

export const TrackingCard: React.FC<TrackingCardProps> = ({
  shipment,
  style,
  onPress,
}) => {
  // 1. Spelled out city or location (spelling out one word from city or exact location in full)
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

  // 2. Format dates and times as "29 jun 26" and "8:15 am" / "04:20 pm"
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return { date: "--", time: "--" };
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return { date: "--", time: "--" };
      
      const day = dateObj.getDate();
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear().toString().slice(-2);
      const dateFormatted = `${day < 10 ? "0" + day : day} ${month} ${year}`;

      let hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      const hoursStr = hours < 10 ? "0" + hours : hours;
      const timeFormatted = `${hoursStr}:${minutesStr} ${ampm}`;

      return { date: dateFormatted, time: timeFormatted };
    } catch {
      return { date: "--", time: "--" };
    }
  };

  const startInfo = formatDateTime(shipment.createdAt);
  const deliveryInfo = formatDateTime(shipment.deliveryDate);

  // 3. Functional progress calculation based on time
  const getProgressPercentage = () => {
    if (!shipment.createdAt || !shipment.deliveryDate) {
      return 50;
    }
    const start = new Date(shipment.createdAt).getTime();
    const end = new Date(shipment.deliveryDate).getTime();
    const now = Date.now();

    if (now <= start) return 0;
    if (now >= end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const progress = getProgressPercentage();


  // Cargo icon based on type
  const getCargoIcon = (type?: string) => {
    switch (type) {
      case "GENERAL_CARGO":
      case "GENERAL":
      case "general":
      case "General cargo":
      case "Fragile cargo":
        return Package;
      case "HEAVY_MACHINERY":
      case "Heavy Machinery":
        return Wrench;
      case "CHEMICALS_PHARMA":
      case "Chemicals & Pharma":
        return FlaskConical;
      case "FOOD_BEVERAGE":
      case "Food & Beverages":
        return Apple;
      default:
        return Package;
    }
  };

  const CargoIcon = getCargoIcon(shipment.cargoType || (shipment.cargo?.type));

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.95}>
      {/* Top Section: Locations and progress line */}
      <View style={styles.topSection}>
        <View style={styles.locationColLeft}>
          <Text style={styles.locationName}>{pickupName}</Text>
          <Text style={styles.dateTimeText}>{startInfo.date}</Text>
          <Text style={styles.dateTimeText}>{startInfo.time}</Text>
        </View>

        <View style={styles.lineWrapper}>
          <View style={styles.lineBackground}>
            <View style={[styles.lineFill, { width: `${progress}%` }]} />
            <View style={styles.startDot} />
            <View style={[styles.indicatorCircle, { left: `${progress}%` }]}>
              <Package size={16} color="#0F3D26" strokeWidth={2.5} />
            </View>
            <View style={styles.endDot} />
          </View>
        </View>

        <View style={styles.locationColRight}>
          <Text style={styles.locationName}>{deliveryName}</Text>
          <Text style={styles.dateTimeText}>{deliveryInfo.date}</Text>
          <Text style={styles.dateTimeText}>{deliveryInfo.time}</Text>
        </View>
      </View>

      {/* Bottom Section: Icon card and Forest Green details card */}
      <View style={styles.bottomSection}>
        <View style={styles.iconBlock}>
          <CargoIcon size={28} color="#0F3D26" strokeWidth={2.5} />
        </View>

        <View style={styles.greenBlock}>
          <View style={styles.trackingInfo}>
            <Text style={styles.trackingLabel}>Tracking number</Text>
            <Text style={styles.trackingCode} numberOfLines={1} adjustsFontSizeToFit>
              {`#${shipment.id}`}
            </Text>
          </View>

          <View style={styles.qrCircle}>
            <QrCode size={18} color="#0F3D26" strokeWidth={2.5} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  locationColLeft: {
    alignItems: "flex-start",
    minWidth: 80,
  },
  locationColRight: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  locationName: {
    fontSize: 24,
    fontWeight: "semibold",
    color: "#111827",
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  lineWrapper: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    marginHorizontal: 8,
  },
  lineBackground: {
    height: 3,
    backgroundColor: "#E5E7EB",
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },
  lineFill: {
    height: 3,
    backgroundColor: "#0F3D26",
    position: "absolute",
    left: 0,
  },
  startDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0F3D26",
    position: "absolute",
    left: 0,
  },
  endDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9CA3AF",
    position: "absolute",
    right: 0,
  },
  indicatorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    transform: [{ translateX: -16 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bottomSection: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
  },
  iconBlock: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  greenBlock: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#0F3D26",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trackingInfo: {
    flex: 1,
    paddingRight: 6,
  },
  trackingLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },
  trackingCode: {
    fontSize: 18,
    fontWeight: "semibold",
    color: "#FFFFFF",
    marginTop: 4,
  },
  qrCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
