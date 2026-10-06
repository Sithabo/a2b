import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Lightbulb } from "lucide-react-native";
import { colors, palette } from "@a2b/ui";
import { formatMoney, type Market, type OfferRecommendation } from "@a2b/core";

interface OfferSliderProps {
  value: number;
  onChange: (val: number) => void;
  offer: OfferRecommendation;
  market: Market;
}

export const OfferSlider: React.FC<OfferSliderProps> = ({ value, onChange, offer, market }) => {
  const { base: baseRate, surcharges, recommended: recommendedPrice, min: minPrice, max: maxPrice } = offer;
  const totalSurcharge = recommendedPrice - baseRate;
  const currency = market.currency.code;

  // Sync recommended price when surcharges change
  useEffect(() => {
    onChange(recommendedPrice);
  }, [onChange, recommendedPrice]);

  const formatValue = (val: number) => formatMoney(val, market, { code: false });

  const formatK = (val: number) => {
    return `${Math.round(val / 1000)}k`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recommended Offer ({currency})</Text>

      <View style={styles.card}>
        {/* Dynamic Big Number Display */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Your Offer</Text>
          <Text style={styles.amount}>
            {formatValue(value)} <Text style={styles.currency}>{currency}</Text>
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
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={palette.gray[200]} // stone-200
            thumbTintColor={colors.primary}
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
        {totalSurcharge > 0 && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Surcharge Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Base Rate</Text>
              <Text style={styles.breakdownValue}>{formatValue(baseRate)} {currency}</Text>
            </View>
            {surcharges.map((item) => (
              <View key={item.id} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={styles.breakdownValue}>+{formatValue(item.amount)} {currency}</Text>
              </View>
            ))}
            <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
              <Text style={styles.breakdownTotalLabel}>Total Recommended</Text>
              <Text style={styles.breakdownTotalValue}>{formatValue(recommendedPrice)} {currency}</Text>
            </View>
          </View>
        )}

        {/* Tooltip Tips */}
        <View style={styles.tipsContainer}>
          <Lightbulb size={24} color={colors.primary} fill={colors.primary} />
          <Text style={styles.tipsText}>
            <Text style={styles.tipsBold}>Tips:</Text> Offers above {formatValue(recommendedPrice + 15000)} {currency} are 3x more likely to be accepted within an hour.
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
    color: colors.primary,
  },
  card: {
    backgroundColor: palette.stone[50], // stone-50 to match screenshot feel
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
    color: palette.stone[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  amount: {
    fontSize: 36,
    fontWeight: "900", // black
    color: colors.primary,
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
    color: palette.stone[400],
    textTransform: "capitalize",
  },
  stepValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: palette.stone[400],
  },
  stepTextActive: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.primary,
    textTransform: "capitalize",
  },
  stepValueActive: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.primary,
  },
  breakdownCard: {
    backgroundColor: palette.gray[100], // gray-100
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: palette.gray[700], // gray-700
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[200],
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
    color: palette.gray[600], // gray-600
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.gray[900],
  },
  breakdownTotalRow: {
    borderTopWidth: 1,
    borderTopColor: palette.gray[200],
    paddingTop: 6,
    marginTop: 4,
  },
  breakdownTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
  },
  breakdownTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
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
    color: colors.primary,
    fontWeight: "500",
    lineHeight: 18,
  },
  tipsBold: {
    fontWeight: "bold",
  },
});
