import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { BellOff } from "lucide-react-native";
import { colors, palette, ScreenHeader } from "@a2b/ui";

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background || palette.gray[50] }]}>
      <ScreenHeader
        title="Notifications"
        subtitle="Manage your alerts and notifications"
        onBackPress={() => router.replace("/(tabs)/account")}
        onCancelPress={() => router.replace("/(tabs)/account")}
      />

      <View style={styles.content}>
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <BellOff color={colors.primary} size={36} />
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>
            You have no new notifications. Active shipment updates will appear here automatically.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 80, // Offset balance for header height
  },
  emptyContainer: {
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.forest[50],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: palette.gray[500],
    textAlign: "center",
    lineHeight: 22,
  },
});
