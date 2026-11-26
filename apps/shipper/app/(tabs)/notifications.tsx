import React from "react";
import { View, StyleSheet } from "react-native";
import { BellOff } from "lucide-react-native";
import { colors, EmptyState, ScreenHeader, spacing } from "@a2b/ui";

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notifications"
        subtitle="Shipment updates and alerts"
      />

      <View style={styles.content}>
        <EmptyState
          icon={BellOff}
          title="All caught up!"
          message="You have no new notifications. Active shipment updates will appear here automatically."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing["4xl"] * 2, // Offset balance for header height
  },
});
