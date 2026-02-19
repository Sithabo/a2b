import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShieldCheck } from "lucide-react-native";

interface TrustBadgeProps {
  message: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      {/* Subtle Pattern Overlay Effect */}
      <View style={styles.overlay} />

      <View style={styles.iconContainer}>
        <ShieldCheck color="white" size={24} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Trust & Security</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#D4A017", // Amber
    padding: 16,
    borderRadius: 16, // rounded-2xl
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: "transparent",
    // Removed complex gradient styles as they aren't easily supported in RN StyleSheet without extra libs
    // Keeping subtle overlay
    backgroundColor: "#FFFFFF",
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 9999, // rounded-full
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: -0.25, // tracking-tight
  },
  message: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    lineHeight: 16, // leading-tight
  },
});
