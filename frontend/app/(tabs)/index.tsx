import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Plus,
  Bell,
  TriangleAlert,
  ArrowRight,
  Truck,
} from "lucide-react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader
        title="Hello, Musa Hardware"
        subtitle="Manage your shipments"
        rightElement={
          <TouchableOpacity style={styles.notificationButton}>
            <Bell color="white" size={24} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Action Required Card */}
        <View style={styles.actionCard}>
          <View style={styles.actionCardBackground} />

          <View style={styles.actionHeader}>
            <TriangleAlert color="white" size={20} />
            <Text style={styles.actionTitle}>Action Required</Text>
          </View>

          <Text style={styles.actionText}>
            Driver Found for Jinja Load! Payment needed to unlock.
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log("Pay to unlock")}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Pay to Unlock Driver</Text>
            <ArrowRight color="#D97706" size={16} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statsCard}>
            <Text style={styles.statsValue}>2</Text>
            <Text style={styles.statsLabel}>Active Loads</Text>
          </Card>
          <Card style={styles.statsCard}>
            <Text style={styles.statsValue}>1</Text>
            <Text style={styles.statsLabel}>Pending Load</Text>
          </Card>
        </View>

        {/* Primary Action */}
        <View>
          <PrimaryButton
            title="Post a New Load"
            onPress={() => router.push("/create-load")}
            icon={Plus}
          />
          <Text style={styles.helperText}>
            Get a driver in ~15 mins. Free to post.
          </Text>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Truck color="#0F3D26" size={20} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityRoute}>Kampala to Jinja</Text>
              <Text style={styles.activityStatus}>
                Order #2938 • In Transit
              </Text>
            </View>
            <Text style={styles.activityTime}>2h ago</Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: "#EF4444",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#0F3D26",
  },
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 100,
  },
  actionCard: {
    backgroundColor: "#D97706", // Amber
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  actionCardBackground: {
    position: "absolute",
    right: -16,
    top: -16,
    width: 96,
    height: 96,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 48,
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  actionTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 16,
    fontWeight: "500",
    lineHeight: 20,
  },
  actionButton: {
    width: "100%",
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    color: "#D97706",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statsCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  statsValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0F3D26",
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  helperText: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 12,
    fontWeight: "500",
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: "#0F3D26",
    fontWeight: "bold",
    fontSize: 18,
  },
  viewAllText: {
    color: "#0F3D26",
    fontSize: 14,
    fontWeight: "500",
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  activityIcon: {
    backgroundColor: "#D1FAE5", // green-100
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityRoute: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 14,
  },
  activityStatus: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9CA3AF",
  },
});
