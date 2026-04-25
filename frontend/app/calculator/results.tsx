import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlignLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

export default function CalculatorResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const distance = Number(params.distance) || 0;
  const weight = Number(params.weight) || 0;
  const urgency = Number(params.urgency) || 0;
  const truckType = (params.truckType as string) || "Canter";

  // Calculations
  const baseRatePerKm = 1500;
  const weightSurchargePerTonKm = 100;

  let vehicleFee = 100000;
  if (truckType === "Pickup") vehicleFee = 50000;
  if (truckType === "Fuso") vehicleFee = 200000;
  if (truckType === "Trailer") vehicleFee = 400000;

  const distanceCost = distance * baseRatePerKm;
  const weightCost = distance * weight * weightSurchargePerTonKm;
  const subtotal = distanceCost + weightCost + vehicleFee;
  const urgencyPremium = subtotal * (urgency / 100);
  const totalCost = subtotal + urgencyPremium;

  const formatCurrency = (val: number) => {
    return val.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  return (
    <View style={styles.container}>
      {/* Top Half: Dark Background */}
      <View style={styles.topSection}>
        <SafeAreaView edges={["top"]} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <AlignLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suggested{"\n"}Offer</Text>
        </View>

        {/* Chart Area */}
        <View style={styles.chartContainer}>
          <Svg width="240" height="240" viewBox="0 0 240 240">
            {/* Background Track */}
            <Circle
              cx="120"
              cy="120"
              r="100"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              fill="none"
            />
            {/* Simulated segments (Distance = Purple, Weight = Green, Vehicle = Orange, Urgency = Red) */}
            <Circle
              cx="120"
              cy="120"
              r="100"
              stroke="#A78BFA" // Purple
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
            <Text style={styles.chartCurrency}>UGX</Text>
            <Text style={styles.chartTotal}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Half: White Card */}
      <View style={styles.bottomCard}>
        <View style={styles.breakdownList}>
          {/* Row 1 */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.dot, { backgroundColor: "#A78BFA" }]} />
              <Text style={styles.breakdownLabel}>Distance Cost</Text>
            </View>
            <Text style={styles.breakdownValue}>{formatCurrency(distanceCost)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Row 2 */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.dot, { backgroundColor: "#34D399" }]} />
              <Text style={styles.breakdownLabel}>Weight Surcharge</Text>
            </View>
            <Text style={styles.breakdownValue}>+ {formatCurrency(weightCost)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Row 3 */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.dot, { backgroundColor: "#FBBF24" }]} />
              <Text style={styles.breakdownLabel}>Vehicle Premium</Text>
            </View>
            <Text style={styles.breakdownValue}>+ {formatCurrency(vehicleFee)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Row 4 */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.dot, { backgroundColor: "#F87171" }]} />
              <Text style={styles.breakdownLabel}>Urgency / Demand</Text>
            </View>
            <Text style={styles.breakdownValue}>+ {formatCurrency(urgencyPremium)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.recalculateButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text style={styles.recalculateButtonText}>Recalculate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F3D26", // Forest Green top half
  },
  topSection: {
    flex: 1, // takes up available space above card
    backgroundColor: "#0F3D26",
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 32,
  },
  menuButton: {
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 34,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    position: "relative",
  },
  chartCenterTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  chartCurrency: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  chartTotal: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 4,
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 50, // safe area buffer
  },
  breakdownList: {
    marginBottom: 32,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  breakdownValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    width: "100%",
  },
  recalculateButton: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  recalculateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
