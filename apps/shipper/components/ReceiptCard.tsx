import React from "react";
import { View, StyleSheet, StyleProp, TextStyle, ViewStyle } from "react-native";
import { colors, radius, spacing, Text } from "@a2b/ui";

export interface ReceiptRowProps {
  label: string;
  value: string;
  isBoldValue?: boolean;
  valueStyle?: StyleProp<TextStyle>;
}

export const ReceiptRow: React.FC<ReceiptRowProps> = ({
  label,
  value,
  isBoldValue,
  valueStyle
}) => (
  <View style={styles.row}>
    <Text variant="body" tone="secondary">{label}</Text>
    <Text variant={isBoldValue ? "bodyStrong" : "body"} style={valueStyle}>
      {value}
    </Text>
  </View>
);

export interface ReceiptCardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Top half payload is passed via children conceptually, or mapped inside if preferred.
          But keeping it generic helps us divide standard content vs dashed line. */}
      {children}
    </View>
  );
};

export const ReceiptDivider = () => {
  return (
    <View style={styles.dividerContainer}>
      {/* Cutouts use the screen background colour to mimic transparency */}
      <View style={[styles.cutout, styles.cutoutLeft]} />
      <View style={styles.dashedLine} />
      <View style={[styles.cutout, styles.cutoutRight]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
    paddingTop: spacing["2xl"],
    paddingBottom: spacing["2xl"],
    position: "relative",
    overflow: "hidden", // clips the outer half of the cutouts
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing["2xl"],
    marginBottom: spacing.lg,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
    marginVertical: spacing.md,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: "dashed",
    marginHorizontal: spacing.md, // Gap for cutouts to sit cleanly
  },
  cutout: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    position: "absolute",
    zIndex: 10,
  },
  cutoutLeft: {
    left: -12, // Sink halfway off the card
  },
  cutoutRight: {
    right: -12, // Sink halfway off the card
  },
});
