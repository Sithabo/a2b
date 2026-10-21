import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Lightbulb } from "lucide-react-native";
import { Text, colors, fontFamily, radius, spacing } from "@a2b/ui";
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
      <Text variant="h3" tone="primary">Recommended Offer ({currency})</Text>

      <View style={styles.card}>
        {/* Dynamic Big Number Display */}
        <View style={styles.header}>
          <Text variant="label" tone="muted" style={styles.subtitle}>Your Offer</Text>
          <Text variant="display" tone="primary">
            {formatValue(value)} <Text variant="bodyStrong" tone="primary">{currency}</Text>
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
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />

          {/* Stepper Labels */}
          <View style={styles.labelsRow}>
            <View style={styles.labelCol}>
              <Text variant="caption" tone="muted">Budget</Text>
              <Text variant="caption" tone="muted">({formatK(minPrice)})</Text>
            </View>
            <View style={styles.labelCol}>
              <Text variant="bodyStrong" tone="primary">Fair</Text>
              <Text variant="bodyStrong" tone="primary">({formatK(recommendedPrice)})</Text>
            </View>
            <View style={styles.labelCol}>
              <Text variant="caption" tone="muted">Priority</Text>
              <Text variant="caption" tone="muted">({formatK(maxPrice)})</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Surcharge Breakdown Card */}
        {totalSurcharge > 0 && (
          <View style={styles.breakdownCard}>
            <Text variant="label" tone="secondary" style={styles.breakdownTitle}>Surcharge Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text variant="caption" tone="secondary">Base Rate</Text>
              <Text variant="caption" style={styles.semibold}>{formatValue(baseRate)} {currency}</Text>
            </View>
            {surcharges.map((item) => (
              <View key={item.id} style={styles.breakdownRow}>
                <Text variant="caption" tone="secondary">{item.label}</Text>
                <Text variant="caption" style={styles.semibold}>+{formatValue(item.amount)} {currency}</Text>
              </View>
            ))}
            <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
              <Text variant="caption" tone="primary" style={styles.bold}>Total Recommended</Text>
              <Text variant="caption" tone="primary" style={styles.bold}>{formatValue(recommendedPrice)} {currency}</Text>
            </View>
          </View>
        )}

        {/* Tooltip Tips */}
        <View style={styles.tipsContainer}>
          <Lightbulb size={24} color={colors.primary} fill={colors.primary} />
          <Text variant="caption" tone="primary" style={styles.tipsText}>
            <Text variant="caption" tone="primary" style={styles.bold}>Tips:</Text> Offers above {formatValue(recommendedPrice + 15000)} {currency} are 3x more likely to be accepted within an hour.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing["2xl"],
    gap: spacing.xl,
  },
  header: {
    alignItems: "center",
  },
  subtitle: {
    marginBottom: spacing.xs,
  },
  sliderContainer: {
    paddingHorizontal: spacing.sm,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  labelCol: {
    alignItems: "center",
  },
  breakdownCard: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  breakdownTitle: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  semibold: {
    fontFamily: fontFamily.semibold,
  },
  bold: {
    fontFamily: fontFamily.bold,
  },
  tipsContainer: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  tipsText: {
    flex: 1,
  },
});
