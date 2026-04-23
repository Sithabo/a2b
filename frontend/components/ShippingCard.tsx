import React from "react";
import { View, Text, StyleSheet, Image, ViewStyle, ImageSourcePropType, TouchableOpacity } from "react-native";
import { Truck } from "lucide-react-native";

export interface ShippingCardProps {
  trackingId: string;
  dateLabel?: string;
  dateValue: string;
  statusText?: string;
  progressPercentage?: number;
  imageSource?: ImageSourcePropType;
  style?: ViewStyle;
  onPress?: () => void;
}

export const ShippingCard: React.FC<ShippingCardProps> = ({
  trackingId,
  dateLabel = "DELIVERY DATE",
  dateValue,
  statusText = "IN TRANSIT",
  progressPercentage = 50,
  imageSource,
  style,
  onPress,
}) => {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{statusText}</Text>
        </View>
      </View>
      
      <View style={styles.body}>
        <View style={styles.infoGroup}>
          <Text style={styles.trackingId}>{trackingId}</Text>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.dateValue}>{dateValue}</Text>
        </View>
        <View style={styles.imageContainer}>
          {imageSource && (
            <Image 
              source={imageSource} 
              style={styles.cargoImage} 
              resizeMode="contain" 
            />
          )}
        </View>
      </View>
      
      {/* Small Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        <View style={[styles.progressIconContainer, { left: `${progressPercentage}%` }]}>
          <Truck size={10} color="#0F3D26" />
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
    borderWidth: 1,
    borderColor: "#F5F5F4",
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  statusPill: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusPillText: {
    color: "#0F3D26",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  body: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  infoGroup: {
    gap: 4,
  },
  trackingId: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F3D26",
    marginBottom: 4,
  },
  dateLabel: {
    color: "#A8A29E",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  dateValue: {
    color: "#1C1917",
    fontWeight: "bold",
    fontSize: 14,
  },
  imageContainer: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  cargoImage: {
    width: 80,
    height: 80, // slightly larger so it overtops comfortably if needed
    marginBottom: 10,
  },
  progressTrack: {
    height: 4,
    width: "100%",
    backgroundColor: "#E7E5E4",
    borderRadius: 2,
    marginTop: 16,
    position: "relative",
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 2,
  },
  progressIconContainer: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -12 }, { translateX: -12 }],
    width: 24,
    height: 24,
    backgroundColor: "#FFD700",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
