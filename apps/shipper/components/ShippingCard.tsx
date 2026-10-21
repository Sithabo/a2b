import React from "react";
import { View, StyleSheet, Image, ViewStyle, ImageSourcePropType } from "react-native";
import { Package } from "lucide-react-native";
import { cargoLabel, statusMeta } from "@a2b/core";
import { Badge, Card, Text, colors, radius, spacing } from "@a2b/ui";
import { dueDate, trackingLabel, type Load } from "@/lib/loads";

export interface ShippingCardProps {
  shipment: Load;
  imageSource?: ImageSourcePropType;
  style?: ViewStyle;
  onPress?: () => void;
}

export const ShippingCard: React.FC<ShippingCardProps> = ({
  shipment,
  imageSource,
  style,
  onPress,
}) => {
  // Spelled out location name helper
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

  // Date format helper: e.g. "22 Mar 26"
  const formatDateOnly = (dateStr?: string | null) => {
    if (!dateStr) return "--";
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return "--";
      const day = dateObj.getDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear().toString().slice(-2);
      return `${day < 10 ? "0" + day : day} ${month} ${year}`;
    } catch {
      return "--";
    }
  };

  const pickupDate = formatDateOnly(shipment.createdAt);
  const deliveryDate = formatDateOnly(dueDate(shipment));

  const statusLabel = statusMeta[shipment.status].label;
  const formattedTrackingId = trackingLabel(shipment);

  return (
    <Card
      padding="lg"
      onPress={onPress}
      accessibilityLabel={`Shipment ${formattedTrackingId}, ${statusLabel}, ${pickupName} to ${deliveryName}`}
      style={style}
    >
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={styles.imageContainer}>
            {imageSource ? (
              <Image source={imageSource} style={styles.cargoImage} resizeMode="cover" />
            ) : (
              <Package size={24} color={colors.primary} strokeWidth={2} />
            )}
          </View>
          <View style={styles.metaInfo}>
            <Text variant="h3" numberOfLines={1}>{formattedTrackingId}</Text>
            <Text variant="bodySm" tone="muted" numberOfLines={1} style={styles.cargoType}>
              {cargoLabel(shipment.cargoType)}
            </Text>
            {/* Under the reference rather than beside it, so neither gets squeezed */}
            <Badge label={statusLabel} tone={statusMeta[shipment.status].tone} dot style={styles.status} />
          </View>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={[styles.locCol, styles.locColLeft]}>
          <Text variant="bodySm" tone="muted" numberOfLines={1} ellipsizeMode="tail">{pickupName}</Text>
          <Text variant="bodyStrong">{pickupDate}</Text>
        </View>
        <View style={[styles.locCol, styles.locColRight]}>
          <Text variant="bodySm" tone="muted" align="right" numberOfLines={1} ellipsizeMode="tail">{deliveryName}</Text>
          <Text variant="bodyStrong">{deliveryDate}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexShrink: 1,
  },
  imageContainer: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cargoImage: {
    width: "100%",
    height: "100%",
  },
  metaInfo: {
    justifyContent: "center",
    flexShrink: 1,
  },
  status: { marginTop: spacing.sm },
  cargoType: {
    marginTop: spacing.xxs,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
  },
  locCol: {
    flex: 1,
    gap: spacing.xs,
  },
  locColLeft: {
    marginRight: spacing.sm,
  },
  locColRight: {
    marginLeft: spacing.sm,
    alignItems: "flex-end",
  },
});
