import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlignLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Button, IconButton, Text, colors, layout, palette, radius, spacing } from "@a2b/ui";
import { estimateTrip, formatMoney, vehicleClasses, type VehicleClass } from "@a2b/core";
import { useMarket } from "@/store/useMarket";

export default function CalculatorResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const distance = Number(params.distance) || 0;
  const weight = Number(params.weight) || 0;
  const urgency = Number(params.urgency) || 0;
  const truckType = (
    (params.truckType as string) in vehicleClasses ? params.truckType : "CANTER"
  ) as VehicleClass;

  const market = useMarket();
  const { distanceCost, weightCost, vehicleFee, urgencyPremium, total: totalCost } = estimateTrip(
    { distanceKm: distance, weightTons: weight, vehicleClass: truckType, urgencyPercent: urgency },
    market
  );

  const formatCurrency = (val: number) => formatMoney(val, market, { code: false });

  const breakdown = [
    { label: "Distance Cost", value: formatCurrency(distanceCost), color: palette.violet[400] },
    { label: "Weight Surcharge", value: `+ ${formatCurrency(weightCost)}`, color: palette.emerald[400] },
    { label: "Vehicle Premium", value: `+ ${formatCurrency(vehicleFee)}`, color: palette.amber[400] },
    { label: "Urgency / Demand", value: `+ ${formatCurrency(urgencyPremium)}`, color: palette.red[400] },
  ];

  return (
    <View style={styles.container}>
      {/* Top Half: Dark Background */}
      <View style={styles.topSection}>
        <SafeAreaView edges={["top"]} />

        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon={AlignLeft}
            variant="brand"
            size={layout.touchMin}
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
          <Text variant="display" tone="inverse">Suggested{"\n"}Offer</Text>
        </View>

        {/* Chart Area */}
        <View style={styles.chartContainer}>
          <Svg width="240" height="240" viewBox="0 0 240 240">
            {/* Background Track */}
            <Circle
              cx="120"
              cy="120"
              r="100"
              stroke={colors.onPrimaryWash}
              strokeWidth="12"
              fill="none"
            />
            {/* Simulated segments (Distance = Purple, Weight = Green, Vehicle = Orange, Urgency = Red) */}
            <Circle
              cx="120"
              cy="120"
              r="100"
              stroke={palette.violet[400]} // Purple
              strokeWidth="12"
              fill="none"
              strokeDasharray="628" // 2 * PI * r
              strokeDashoffset={628 * (1 - distanceCost / totalCost)}
              strokeLinecap="round"
              rotation="-90"
              origin="120, 120"
            />
          </Svg>
          <View style={styles.chartCenterTextContainer}>
            <Text variant="bodyStrong" color={colors.onPrimaryMuted}>{market.currency.code}</Text>
            <Text variant="display" tone="inverse" style={styles.chartTotal}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Half: White Card */}
      <View style={styles.bottomCard}>
        <View style={styles.breakdownList}>
          {breakdown.map((row, i) => (
            <React.Fragment key={row.label}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.dot, { backgroundColor: row.color }]} />
                  <Text variant="bodySm" tone="secondary">{row.label}</Text>
                </View>
                <Text variant="bodyStrong">{row.value}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <Button title="Recalculate" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary, // Forest Green top half
  },
  topSection: {
    flex: 1, // takes up available space above card
    backgroundColor: colors.primary,
    paddingBottom: spacing["4xl"],
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    // The 48pt icon button pads its 24pt icon by 12, so the icon sits where it did.
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing["3xl"],
    position: "relative",
  },
  chartCenterTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  chartTotal: {
    marginTop: spacing.xs,
  },
  bottomCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: spacing["3xl"],
    paddingBottom: spacing["4xl"], // safe area buffer
  },
  breakdownList: {
    marginBottom: spacing["3xl"],
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: "100%",
  },
});
