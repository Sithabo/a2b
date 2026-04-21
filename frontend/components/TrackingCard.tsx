import React from "react";
import { View, Text, StyleSheet, Image, ViewStyle, TextStyle } from "react-native";
import { MapPin, Truck } from "lucide-react-native";
import Svg, { Polygon, Text as SvgText } from "react-native-svg";

export interface TrackingCardProps {
  trackingId: string;
  location: string;
  status: string;
  progressPercentage?: number;
  backgroundColor?: string;
  textColor?: string;
  labelColor?: string;
  isFast?: boolean;
  style?: ViewStyle;
}

export const TrackingCard: React.FC<TrackingCardProps> = ({
  trackingId,
  location,
  status,
  progressPercentage = 66,
  backgroundColor = "#FFD700",
  textColor = "#0F3D26",
  labelColor = "rgba(15, 61, 38, 0.6)",
  isFast = true,
  style,
}) => {
  return (
    <View style={[styles.card, { backgroundColor }, style]}>
      {/* Background illustration */}
      <Image
        source={{
          uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCy0Jwthlx25J8PWzcCReLF1EnO41b_nEcetHZMeImKzlLpL_OI5hkYjJ7oqmsVvivYW8yb-CvHwDPON6NCAvg0JDgXyFHkspHGgMWeS_6Sv56XEKg8cBMcbZMfEpEyH5-_9YZEHHY6j4wFAPLrIk7V0QhcB49IGANu6Lkj2qc5pkZ4jVOagAeBGwSNvfUEaybOnqRZBaVIyFE0OOmVnetxCrngSZbVxWUgZyDQA_MiijrlSGMzIaWNg0bhe4TxeW7ls1ZEesin5kCN",
        }}
        style={styles.backgroundImage}
        resizeMode="contain"
      />

      <View style={styles.content}>
        {/* Tracking ID */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: labelColor }]}>
            Current Tracking
          </Text>
          <Text style={[styles.idText, { color: textColor }]}>
            {trackingId}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: labelColor }]}>
            Current Location
          </Text>
          <View style={styles.valueContainer}>
            <MapPin size={16} color={textColor} strokeWidth={2.5} />
            <Text style={[styles.valueText, { color: textColor }]}>
              {location}
            </Text>
          </View>
        </View>

        {/* Status */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: labelColor }]}>Status</Text>
          <View style={styles.valueContainer}>
            <View style={[styles.statusDot, { backgroundColor: textColor }]} />
            <Text style={[styles.valueText, { color: textColor }]}>{status}</Text>
          </View>
        </View>

        {/* Progress Line */}
        <View style={[styles.progressTrack, { backgroundColor: "rgba(0,0,0,0.1)" }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: textColor, width: `${progressPercentage}%` },
            ]}
          />
          <View
            style={[
              styles.progressIconContainer,
              { left: `${progressPercentage}%`, backgroundColor: textColor, borderColor: backgroundColor },
            ]}
          >
            <Truck size={14} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: -1 }} />
          </View>
        </View>
      </View>

      {/* Fast Badge SVG */}
      {isFast && (
        <View style={styles.fastBadge}>
          <Svg width="72" height="72" viewBox="0 0 100 100">
            <Polygon
              points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
              fill="white"
            />
            <SvgText
              x="50"
              y="55"
              fontSize="16"
              fontWeight="900"
              fill={textColor}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              FAST
            </SvgText>
          </Svg>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
    minHeight: 220,
  },
  backgroundImage: {
    position: "absolute",
    right: -30,
    bottom: -30,
    width: 220,
    height: 220,
    opacity: 0.8,
    transform: [{ rotate: "-15deg" }],
    zIndex: 0,
  },
  content: {
    position: "relative",
    zIndex: 10,
    gap: 16,
  },
  row: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
  },
  idText: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  valueText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4, // Aligns visually with the map pin center
    marginRight: 4,
  },
  progressTrack: {
    height: 6,
    width: "100%",
    borderRadius: 3,
    marginTop: 24,
    position: "relative",
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: 3,
  },
  progressIconContainer: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -16 }, { translateX: -16 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  fastBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    transform: [{ rotate: "15deg" }],
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
