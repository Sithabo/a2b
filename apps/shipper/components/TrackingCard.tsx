import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Package, Wrench, FlaskConical, Apple, QrCode, type LucideIcon } from "lucide-react-native";
import { formatMarketTime, type CargoType } from "@a2b/core";
import { useMarket } from "@/store/useMarket";
import { Card, Text, colors, radius, spacing } from "@a2b/ui";
import { dueDate, trackingLabel, type Load } from "@/lib/loads";

const CARGO_ICONS: Record<CargoType, LucideIcon> = {
  GENERAL_CARGO: Package,
  FRAGILE_CARGO: Package,
  BULK_CARGO: Package,
  HEAVY_MACHINERY: Wrench,
  CHEMICALS_PHARMA: FlaskConical,
  FOOD_BEVERAGE: Apple,
};

export interface TrackingCardProps {
  shipment: Load;
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

  const pickupName = getDisplayLocation(shipment.pickupSummary);
  const deliveryName = getDisplayLocation(shipment.dropoffSummary);

  // 2. Dates and times in the market's local time
  const market = useMarket();
  const formatDateTime = (at?: string | null) => ({
    date: formatMarketTime(at, market, "date"),
    time: formatMarketTime(at, market, "time"),
  });

  const startInfo = formatDateTime(shipment.createdAt);
  const deliveryInfo = formatDateTime(dueDate(shipment));

  // 3. Functional progress calculation based on time
  const getProgressPercentage = () => {
    const due = dueDate(shipment);
    if (!shipment.createdAt || !due) {
      return 50;
    }
    const start = new Date(shipment.createdAt).getTime();
    const end = new Date(due).getTime();
    const now = Date.now();

    if (now <= start) return 0;
    if (now >= end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const progress = getProgressPercentage();


  // Cargo icon based on type
  const CargoIcon = CARGO_ICONS[shipment.cargoType];

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`Shipment ${trackingLabel(shipment)}, ${pickupName} to ${deliveryName}`}
      style={style}
    >
      {/* Top Section: Locations and progress line */}
      <View style={styles.topSection}>
        <View style={styles.locationColLeft}>
          <Text variant="h2" numberOfLines={2} style={styles.locationName}>{pickupName}</Text>
          <Text variant="caption" tone="muted" style={styles.dateTimeText}>{startInfo.date}</Text>
          <Text variant="caption" tone="muted" style={styles.dateTimeText}>{startInfo.time}</Text>
        </View>

        <View style={styles.lineWrapper}>
          <View style={styles.lineBackground}>
            <View style={[styles.lineFill, { width: `${progress}%` }]} />
            <View style={styles.startDot} />
            <View style={[styles.indicatorCircle, { left: `${progress}%` }]}>
              <Package size={16} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.endDot} />
          </View>
        </View>

        <View style={styles.locationColRight}>
          <Text variant="h2" numberOfLines={2} align="right" style={styles.locationName}>{deliveryName}</Text>
          <Text variant="caption" tone="muted" style={styles.dateTimeText}>{deliveryInfo.date}</Text>
          <Text variant="caption" tone="muted" style={styles.dateTimeText}>{deliveryInfo.time}</Text>
        </View>
      </View>

      {/* Bottom Section: Icon card and Forest Green details card */}
      <View style={styles.bottomSection}>
        <View style={styles.iconBlock}>
          <CargoIcon size={28} color={colors.primary} strokeWidth={2.5} />
        </View>

        <View style={styles.greenBlock}>
          <View style={styles.trackingInfo}>
            <Text variant="caption" color={colors.onPrimaryMuted}>Tracking number</Text>
            <Text variant="h3" tone="inverse" style={styles.trackingCode} numberOfLines={1} adjustsFontSizeToFit>
              {trackingLabel(shipment)}
            </Text>
          </View>

          <View style={styles.qrCircle}>
            <QrCode size={18} color={colors.primary} strokeWidth={2.5} />
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  // Long place names wrap instead of pushing the dates off the card
  locationColLeft: {
    alignItems: "flex-start",
    flexShrink: 1,
    maxWidth: "40%",
  },
  locationColRight: {
    alignItems: "flex-end",
    flexShrink: 1,
    maxWidth: "40%",
  },
  locationName: {
    marginBottom: spacing.xs,
  },
  dateTimeText: {
    marginTop: spacing.xxs,
  },
  lineWrapper: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    marginHorizontal: spacing.sm,
  },
  lineBackground: {
    height: 3,
    backgroundColor: colors.border,
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },
  lineFill: {
    height: 3,
    backgroundColor: colors.primary,
    position: "absolute",
    left: 0,
  },
  startDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    position: "absolute",
    left: 0,
  },
  endDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.textPlaceholder,
    position: "absolute",
    right: 0,
  },
  indicatorCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    transform: [{ translateX: -16 }],
  },
  bottomSection: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
    width: "100%",
  },
  iconBlock: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  greenBlock: {
    flex: 1,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trackingInfo: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  trackingCode: {
    marginTop: spacing.xs,
  },
  qrCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.onPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
});
