import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

export interface ReceiptRowProps {
  label: string;
  value: string;
  isBoldValue?: boolean;
  valueStyle?: any;
}

export const ReceiptRow: React.FC<ReceiptRowProps> = ({ 
  label, 
  value, 
  isBoldValue,
  valueStyle 
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, isBoldValue && styles.boldText, valueStyle]}>
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
      {/* Cutouts use the specific beige background colour of the screen to mimic transparency */}
      <View style={[styles.cutout, styles.cutoutLeft]} />
      <View style={styles.dashedLine} />
      <View style={[styles.cutout, styles.cutoutRight]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: "relative",
    overflow: "hidden", // clip anything expanding too far, EXCEPT the cutouts are inside?
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  rowLabel: {
    fontSize: 16,
    color: "#292524", // stone-800
  },
  rowValue: {
    fontSize: 16,
    color: "#1C1917", // stone-900
  },
  boldText: {
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
    marginVertical: 12,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB", // stone-300
    borderStyle: "dashed",
    marginHorizontal: 12, // Gap for cutouts to sit cleanly
  },
  cutout: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F7F6ED", // Beige background from layout!
    position: "absolute",
    zIndex: 10,
  },
  cutoutLeft: {
    left: -12, // Sink halfway off screen
  },
  cutoutRight: {
    right: -12, // Sink halfway off screen
  },
});
