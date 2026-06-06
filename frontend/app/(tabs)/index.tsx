import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Bell,
  Truck,
  MapPin,
  Search,
  Calculator,
  ChevronRight,
  Package,
  User,
  AlertTriangle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrackingCard } from "@/components/TrackingCard";
import { ShippingCard } from "@/components/ShippingCard";
import { ToolCard } from "@/components/ToolCard";
import { useAuthStore } from "@/store/useAuthStore";
import { useShipmentStore } from "@/store/useShipmentStore";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const userProfile = useAuthStore((state) => state.userProfile);
  const draftShipment = useShipmentStore((state) => state.draftShipment);
  const shipments = useShipmentStore((state) => state.shipments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "PENDING" | "COMPLETED">("ALL");
  const insets = useSafeAreaInsets();

  const filteredShipments = shipments.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || (
      s.id.toLowerCase().includes(query) ||
      (s.pickup && s.pickup.toLowerCase().includes(query)) ||
      (s.delivery && s.delivery.toLowerCase().includes(query)) ||
      (s.cargoType && s.cargoType.toLowerCase().includes(query))
    );

    let matchesStatus = true;
    if (selectedStatus === "ACTIVE") {
      matchesStatus = s.status === "ACTIVE" || s.status === "MATCHED" || s.status === "SECURED";
    } else if (selectedStatus === "PENDING") {
      matchesStatus = s.status === "OPEN";
    } else if (selectedStatus === "COMPLETED") {
      matchesStatus = s.status === "COMPLETED" || s.status === "DELIVERED";
    }

    return matchesSearch && matchesStatus;
  });

  const activeShipments = filteredShipments.filter(
    (s) => s.status === "ACTIVE" || s.status === "MATCHED" || s.status === "SECURED"
  );
  
  const recentShipments = filteredShipments.filter(
    (s) => s.status !== "DRAFT_PENDING_DOCS"
  );

  return (
    <View style={[styles.container, { backgroundColor: "#F5F5E9" }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#0F3D26", "#F5F5E9"]}
          locations={[0, 0.85]}
          style={[styles.gradientHeader, { paddingTop: insets.top }]}
        >
          {/* Header Integrated into Body */}
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatarContainer, userProfile?.profileImage && { borderWidth: 0 }]}>
                {userProfile?.profileImage ? (
                  <Image
                    source={{ uri: userProfile.profileImage }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                    contentFit="cover"
                  />
                ) : (
                  <User color="#FFFFFF" size={24} />
                )}
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  Hey {userProfile?.name?.split(" ")[0] || "Musa"}
                </Text>
                <View style={styles.locationContainer}>
                  <MapPin color="rgba(255, 255, 255, 0.7)" size={14} />
                  <Text style={styles.locationText}>{userProfile?.region || "Select Region"}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.headerNotificationButton}>
              <Bell color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Shipping"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Status Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillsContainer}
            contentContainerStyle={styles.pillsScrollContent}
          >
            {([
              { id: "ALL", label: "All" },
              { id: "ACTIVE", label: "Active" },
              { id: "PENDING", label: "Pending" },
              { id: "COMPLETED", label: "Completed" },
            ] as const).map((item) => {
              const isActive = selectedStatus === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.pillButton,
                    isActive && styles.pillButtonActive,
                  ]}
                  onPress={() => setSelectedStatus(item.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isActive && styles.pillTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Top Content inside gradient */}
          <View style={styles.topContent}>
            {/* Active Alert Card if draft exists */}
            {draftShipment && draftShipment.status === 'DRAFT_PENDING_DOCS' && (
              <TouchableOpacity
                style={styles.alertCard}
                activeOpacity={0.9}
                onPress={() => router.push("/create-load/document-vault")}
              >
                <View style={styles.alertCardHeader}>
                  <AlertTriangle color="#D97706" size={20} />
                  <Text style={styles.alertCardTitle}>⚠️ Unfinished Import Shipment Detected</Text>
                </View>
                <Text style={styles.alertCardText}>
                  Your route information from {draftShipment.pickup || "Georgetown Port"} is saved. Tap here to complete your document uploads and release this load.
                </Text>
                <View style={styles.alertCardFooter}>
                  <Text style={styles.alertCardBtnText}>Complete Document Vault Uploads</Text>
                  <ChevronRight color="#D97706" size={16} />
                </View>
              </TouchableOpacity>
            )}

            {/* Current Tracking Cards */}
            {activeShipments.map((s) => (
              <TrackingCard
                key={s.id}
                shipment={s}
                onPress={() => router.push({ pathname: "/active-delivery", params: { trackingId: `#${s.id}` } })}
              />
            ))}

            {/* Action Tools Grid */}
            <View style={styles.toolsGrid}>
              <ToolCard
                title={"Calculate\nShipping Cost"}
                icon={Calculator}
                onPress={() => router.push("/calculator")}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Bottom Content on pure white page background */}
        <View style={styles.bottomContent}>
          {/* Recent Shipping Section */}
          {recentShipments.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionHeading}>Recent Shipping</Text>

              {recentShipments.map((s) => (
                <ShippingCard
                  key={s.id}
                  trackingId={`#${s.id}`}
                  dateValue={new Date(s.deliveryDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  statusText={s.status === "ACTIVE" ? "IN TRANSIT" : s.status}
                  progressPercentage={s.status === "ACTIVE" ? 66 : 50}
                  imageSource={require("@/assets/images/cargo_box.png")}
                  onPress={() => router.push({ pathname: s.status === "ACTIVE" ? "/active-delivery" : "/pending-delivery", params: { trackingId: `#${s.id}` } })}
                />
              ))}
            </View>
          )}

          {/* Search Empty State */}
          {filteredShipments.length === 0 && (
            <View style={styles.emptyContainer}>
              <Package color="#9CA3AF" size={48} />
              <Text style={styles.emptyTitle}>No Shipments Found</Text>
              <Text style={styles.emptySubtitle}>
                {"We couldn't find any shipments matching \"" + searchQuery + "\""}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    width: "100%",
  },
  topContent: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 24,
  },
  bottomContent: {
    paddingHorizontal: 20,
    gap: 20,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  headerNotificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    position: "relative",
    justifyContent: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 20,
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingLeft: 52,
    paddingRight: 16,
    fontSize: 16,
    color: "#1C1917", // stone-900
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  trackingCard: {
    backgroundColor: "#FFD700", // brand-gold
    borderRadius: 24, // 3xl
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  trackingContent: {
    position: "relative",
    zIndex: 10,
    gap: 16,
  },
  trackingRow: {
    gap: 2,
  },
  trackingLabel: {
    color: "rgba(15, 61, 38, 0.6)", // brand-forest/60
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  trackingId: {
    color: "#0F3D26",
    fontSize: 24,
    fontWeight: "900", // black
  },
  trackingValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trackingValue: {
    color: "#0F3D26",
    fontWeight: "bold",
    fontSize: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: "#0F3D26",
    borderRadius: 4,
    marginRight: 4,
  },
  progressTrack: {
    height: 4,
    width: "100%",
    backgroundColor: "rgba(15, 61, 38, 0.2)", // brand-forest/20
    borderRadius: 2,
    marginTop: 24,
    position: "relative",
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "66%",
    backgroundColor: "#0F3D26",
    borderRadius: 2,
  },
  progressIconContainer: {
    position: "absolute",
    top: "50%",
    left: "66%",
    transform: [{ translateY: -16 }, { translateX: -16 }],
    width: 32,
    height: 32,
    backgroundColor: "#0F3D26",
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
  },
  fastBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-12deg" }],
    borderRadius: 24, // Make it a circle since we don't have SVG star
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fastBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#0F3D26",
    textTransform: "uppercase",
  },
  packageImageContainer: {
    position: "absolute",
    right: -20,
    bottom: -20,
    transform: [{ rotate: "-15deg" }],
    zIndex: 1,
  },
  recentSection: {
    gap: 16,
    paddingTop: 8,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1917", // stone-900
  },
  recentCard: {
    backgroundColor: "#FFFFFF", // stone-50/50
    borderRadius: 24, // 3xl
    padding: 20,
    borderWidth: 1,
    borderColor: "#F5F5F4", // stone-100
  },
  recentHeader: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  inTransitPill: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  inTransitPillText: {
    color: "#0F3D26",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recentBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  recentInfo: {
    gap: 4,
  },
  recentId: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F3D26",
    marginBottom: 4,
  },
  recentDateLabel: {
    color: "#A8A29E", // stone-400
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  recentDateValue: {
    color: "#1C1917",
    fontWeight: "bold",
    fontSize: 14,
  },
  recentImageContainer: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  smallProgressTrack: {
    height: 4,
    width: "100%",
    backgroundColor: "#E7E5E4", // stone-200
    borderRadius: 2,
    marginTop: 16,
    position: "relative",
  },
  smallProgressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "50%",
    backgroundColor: "#FFD700",
    borderRadius: 2,
  },
  smallProgressIconContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateY: -12 }, { translateX: -12 }],
    width: 24,
    height: 24,
    backgroundColor: "#FFD700",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  calculateButton: {
    width: "100%",
    backgroundColor: "#0F3D26",
    padding: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  calculateButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  calculateIconWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 8,
    borderRadius: 12,
  },
  calculateText: {
    fontWeight: "bold",
    color: "#FFFFFF",
    fontSize: 16,
  },
  alertCard: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    borderRadius: 20,
    padding: 16,
    gap: 8,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  alertCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alertCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B45309",
  },
  alertCardText: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 18,
  },
  alertCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#FEF3C7",
    paddingTop: 10,
    marginTop: 4,
  },
  alertCardBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#B45309",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  pillsContainer: {
    marginBottom: 20,
  },
  pillsScrollContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  pillButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  pillButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pillTextActive: {
    color: "#0F3D26",
    fontWeight: "bold",
  },
});
