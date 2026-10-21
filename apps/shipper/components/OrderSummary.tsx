import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Badge, Text, colors, palette, radius, spacing } from "@a2b/ui";

export interface OrderData {
  id: string;
  title: string;
  status: string;
  quantity: number;
  size: string;
  weight: string;
  type: string;
}

export interface OrderSummaryProps {
  data: OrderData;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ data }) => {
  return (
    <View style={styles.card}>
      {/* Top Header Section */}
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/cargo_box.png")}
            style={styles.image}
            contentFit="contain"
          />
        </View>

        <View style={styles.headerRight}>
          <Text variant="bodySm" tone="secondary">
            #{data.id}
          </Text>
          <Text variant="h3" style={styles.orderTitle}>
            {data.title}
          </Text>
          <Badge label={data.status} tone="info" />
        </View>
      </View>

      {/* Details Box Section */}
      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text tone="secondary">Quantity : </Text>
          <Text>{data.quantity}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text tone="secondary">Size : </Text>
          <Text>{data.size}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text tone="secondary">Weight : </Text>
          <Text>{data.weight}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text tone="secondary">Type order : </Text>
          <Text>{data.type}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: palette.ivory[100], // matches the beige background
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sm,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  headerRight: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: spacing.xxs,
  },
  orderTitle: {
    marginBottom: spacing.xs,
  },
  detailsBox: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
