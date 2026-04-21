import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Lightbulb } from "lucide-react-native";

export const OfferSlider = () => {
  const [offer, setOffer] = useState(150000);

  // Format number with commas
  const formatValue = (val: number) => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recommended Offer (UGX)</Text>

      <View style={styles.card}>
        {/* Dynamic Big Number Display */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Suggested Offer</Text>
          <Text style={styles.amount}>
            {formatValue(offer)} <Text style={styles.currency}>UGX</Text>
          </Text>
        </View>

        {/* Range Slider Section */}
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={130000}
            maximumValue={180000}
            step={1000}
            value={offer}
            onValueChange={setOffer}
            minimumTrackTintColor="#0F3D26"
            maximumTrackTintColor="#E5E7EB" // stone-200
            thumbTintColor="#0F3D26"
          />

          {/* Stepper Labels */}
          <View style={styles.labelsRow}>
            <View style={styles.labelCol}>
              <Text style={styles.stepText}>Budget</Text>
              <Text style={styles.stepValue}>(130k)</Text>
            </View>
            <View style={styles.labelColActive}>
              <Text style={styles.stepTextActive}>Fair</Text>
              <Text style={styles.stepValueActive}>(150k)</Text>
            </View>
            <View style={styles.labelCol}>
              <Text style={styles.stepText}>Priority</Text>
              <Text style={styles.stepValue}>(180k)</Text>
            </View>
          </View>
        </View>

        {/* Tooltip Tips */}
        <View style={styles.tipsContainer}>
          <Lightbulb size={24} color="#0F3D26" fill="#0F3D26" />
          <Text style={styles.tipsText}>
            <Text style={styles.tipsBold}>Tips:</Text> Offers above 165,000 UGX
            are 3x more likely to be accepted within an hour.
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
    gap: 24,
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
