import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Lightbulb } from "lucide-react-native";

interface OfferSliderProps {
  value: number;
  onChange: (val: number) => void;
  surcharge: number;
  baseRate?: number;
}

export const OfferSlider: React.FC<OfferSliderProps> = ({
  value,
  onChange,
  surcharge,
  baseRate = 150000,
}) => {
  const recommendedPrice = baseRate + surcharge;

  // Sync recommended price when surcharges change
  useEffect(() => {
    onChange(recommendedPrice);
  }, [surcharge, baseRate, onChange, recommendedPrice]);

  const minPrice = recommendedPrice - 20000;
  const maxPrice = recommendedPrice + 30000;

  // Format number with commas
  const formatValue = (val: number) => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatK = (val: number) => {
    return `${Math.round(val / 1000)}k`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recommended Offer (GYD)</Text>

      <View style={styles.card}>
        {/* Dynamic Big Number Display */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Your Offer</Text>
          <Text style={styles.amount}>
            {formatValue(value)} <Text style={styles.currency}>GYD</Text>
          </Text>
        </View>

        {/* Range Slider Section */}
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={minPrice}
            maximumValue={maxPrice}
            step={5000}
            value={value}
            onValueChange={onChange}
            minimumTrackTintColor="#0F3D26"
            maximumTrackTintColor="#E5E7EB" // stone-200
            thumbTintColor="#0F3D26"
          />

          {/* Stepper Labels */}
          <View style={styles.labelsRow}>
            <View style={styles.labelCol}>
              <Text style={styles.stepText}>Budget</Text>
              <Text style={styles.stepValue}>({formatK(minPrice)})</Text>
            </View>
            <View style={styles.labelColActive}>
              <Text style={styles.stepTextActive}>Fair</Text>
              <Text style={styles.stepValueActive}>({formatK(recommendedPrice)})</Text>
            </View>
            <View style={styles.labelCol}>
              <Text style={styles.stepText}>Priority</Text>
              <Text style={styles.stepValue}>({formatK(maxPrice)})</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Surcharge Breakdown Card */}
        {surcharge > 0 && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Surcharge Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Base Rate</Text>
              <Text style={styles.breakdownValue}>{formatValue(baseRate)} GYD</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>⚓ Port Delay Surcharge</Text>
              <Text style={styles.breakdownValue}>+{formatValue(surcharge)} GYD</Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
              <Text style={styles.breakdownTotalLabel}>Total Recommended</Text>
              <Text style={styles.breakdownTotalValue}>{formatValue(recommendedPrice)} GYD</Text>
            </View>
          </View>
        )}

        {/* Tooltip Tips */}
        <View style={styles.tipsContainer}>
          <Lightbulb size={24} color="#0F3D26" fill="#0F3D26" />
          <Text style={styles.tipsText}>
            <Text style={styles.tipsBold}>Tips:</Text> Offers above {formatValue(recommendedPrice + 15000)} GYD are 3x more likely to be accepted within an hour.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  card: {
    backgroundColor: "#FAFAF9", // stone-50 to match screenshot feel
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  header: {
    alignItems: "center",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#A8A29E",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  amount: {
    fontSize: 36,
    fontWeight: "900", // black
    color: "#0F3D26",
  },
  currency: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  labelCol: {
    alignItems: "center",
  },
  labelColActive: {
    alignItems: "center",
  },
  stepText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#A8A29E",
    textTransform: "capitalize",
  },
  stepValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#A8A29E",
  },
  stepTextActive: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F3D26",
    textTransform: "capitalize",
  },
  stepValueActive: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F3D26",
  },
  breakdownCard: {
    backgroundColor: "#F3F4F6", // gray-100
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151", // gray-700
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 6,
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLabel: {
    fontSize: 12,
    color: "#4B5563", // gray-600
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  breakdownTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
    marginTop: 4,
  },
  breakdownTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  breakdownTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  tipsContainer: {
    backgroundColor: "rgba(15, 61, 38, 0.08)", // bg-brand-forest/5
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipsText: {
    flex: 1,
    fontSize: 12,
    color: "#0F3D26",
    fontWeight: "500",
    lineHeight: 18,
  },
  tipsBold: {
    fontWeight: "bold",
  },
});
