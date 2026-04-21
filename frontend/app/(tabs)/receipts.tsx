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
import { Clock, CheckCircle } from "lucide-react-native";
import { ModernShipmentCard } from "@/components/ModernShipmentCard";
import { useShipmentStore, Shipment } from "@/store/useShipmentStore";

// Helper to calculate simple "time ago" string
const timeAgo = (dateString: string) => {
  const diffInMinutes = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 60000,
  );
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
};

export default function ReceiptsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const shipments = useShipmentStore((state) => state.shipments);

  // Sort by newest first
  const sortedShipments = [...shipments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const openShipments = sortedShipments.filter(
    (s) => s.status === "OPEN" || s.status === "MATCHED",
  );
  const activeShipments = sortedShipments.filter(
    (s) =>
      s.status === "SECURED" ||
      s.status === "ACTIVE" ||
      s.status === "COMPLETED",
  );

  // Hardcode fallback data since user is simulating but might not have created one yet.
  // We'll show the dynamic ones first, then fallback mock items if empty.
  const hasOpen = openShipments.length > 0;
  const hasActive = activeShipments.length > 0;

  const renderOpenCard = (shipment: Shipment) => (
    <ModernShipmentCard
      key={shipment.id}
      shipment={shipment}
      status="waiting"
    />
  );

  const renderActiveCard = (shipment: Shipment) => (
    <ModernShipmentCard
      key={shipment.id}
      shipment={shipment}
      status="found"
      onPress={() => router.push("/active-delivery")}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Shipments</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 1: Waiting for Driver ── */}
        <View>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelRow}>
              <Clock color="#D97706" size={18} />
              <Text style={styles.sectionLabel}>Waiting for Driver</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {openShipments.length > 0 ? openShipments.length : 2}
              </Text>
            </View>
          </View>

          {hasOpen ? (
            openShipments.map(renderOpenCard)
          ) : (
            <>
              <ModernShipmentCard
                key="mock1"
                status="waiting"
                shipment={{
                  id: "8F2C99X",
                  createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
                  pickup: "Kampala, Makindye",
                  delivery: "Jinja, Industrial Area",
                }}
              />
              <ModernShipmentCard
                key="mock2"
                status="waiting"
                shipment={{
                  id: "P2AL01Z",
                  createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
                  pickup: "Entebbe, Airport Road",
                  delivery: "Kampala, City Center",
                }}
              />
            </>
          )}
        </View>

        {/* ── Section 2: Paid & Active ── */}
        <View style={styles.activeSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelRow}>
              <CheckCircle color="#059669" size={18} />
              <Text style={styles.sectionLabel}>Paid & Active</Text>
            </View>
            <View style={[styles.badge, styles.activeBadge]}>
              <Text style={[styles.badgeText, styles.activeBadgeText]}>
                {activeShipments.length > 0 ? activeShipments.length : 1}
              </Text>
            </View>
          </View>

          {hasActive ? (
            activeShipments.map(renderActiveCard)
          ) : (
            /* Fallback Static Active Card */
            <ModernShipmentCard
              key="mock3"
              status="found"
              shipment={{
                id: "V99MZLQ",
                createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
                pickup: "Kampala, Makindye",
                delivery: "Jinja, Industrial Area",
              }}
              onPress={() => router.push("/active-delivery")}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#F5F5E9",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#0F3D26" },
  scrollContent: { padding: 16, paddingBottom: 100, gap: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#0F3D26",
  },
  badge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: { fontSize: 12, fontWeight: "bold", color: "#92400E" },
  activeBadge: { backgroundColor: "#D1FAE5" },
  activeBadgeText: { color: "#065F46" },
});
