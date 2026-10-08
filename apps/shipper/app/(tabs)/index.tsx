import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Image } from "expo-image";
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
import { colors, palette } from "@a2b/ui";
import { isActiveStatus, statusGroup } from "@a2b/core";
import { shipmentRoute, useMyShipments } from "@/lib/loads";

export default function HomeScreen() {
  const router = useRouter();
  const userProfile = useAuthStore((state) => state.userProfile);
  const draftShipment = useShipmentStore((state) => state.draftShipment);
  const { data: shipments = [], refetch, isRefetching } = useMyShipments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "PENDING" | "COMPLETED">("ALL");
  const insets = useSafeAreaInsets();

  const filteredShipments = shipments.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || (
      s.id.toLowerCase().includes(query) ||
      (s.reference ?? "").toLowerCase().includes(query) ||
      (s.pickup && s.pickup.toLowerCase().includes(query)) ||
      (s.delivery && s.delivery.toLowerCase().includes(query)) ||
      (s.cargoType && s.cargoType.toLowerCase().includes(query))
    );

    const group = statusGroup(s.status);
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "ACTIVE" && group === "active") ||
      (selectedStatus === "PENDING" && group === "pending") ||
      (selectedStatus === "COMPLETED" && group === "done");

    return matchesSearch && matchesStatus;
  });

  const activeShipments = filteredShipments.filter(
    (s) => isActiveStatus(s.status)
  );
  
  const recentShipments = filteredShipments.filter(
    (s) => s.status !== "DRAFT"
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.white} />}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, colors.background]}
          locations={[0, 0.85]}
          style={[styles.gradientHeader, { paddingTop: insets.top }]}
        >
          {/* Header Integrated into Body */}
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <Link href={"/(tabs)/account"}>
                <View style={[styles.avatarContainer, userProfile?.profileImage && { borderWidth: 0 }]}>
                {userProfile?.profileImage ? (
                  <Image
                    source={{ uri: userProfile.profileImage }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                    contentFit="cover"
                  />
                ) : (
                  <User color={palette.white} size={24} />
                )}
              </View>
              </Link>
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
            <Link href={"/account/notifications"} asChild>
            <TouchableOpacity style={styles.headerNotificationButton}>
              <Bell color={palette.white} size={20} />
            </TouchableOpacity>
            </Link>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search color={palette.gray[400]} size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Shipping"
              placeholderTextColor={palette.gray[400]}
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
            {draftShipment && draftShipment.status === 'DRAFT' && (
              <TouchableOpacity
                style={styles.alertCard}
                activeOpacity={0.9}
                onPress={() => router.push("/create-load/document-vault")}
              >
                <View style={styles.alertCardHeader}>
                  <AlertTriangle color={palette.amber[600]} size={20} />
                  <Text style={styles.alertCardTitle}>⚠️ Unfinished Import Shipment Detected</Text>
                </View>
                <Text style={styles.alertCardText}>
                  Your route information from {draftShipment.pickup || "Georgetown Port"} is saved. Tap here to complete your document uploads and release this load.
                </Text>
                <View style={styles.alertCardFooter}>
                  <Text style={styles.alertCardBtnText}>Complete Document Vault Uploads</Text>
                  <ChevronRight color={palette.amber[600]} size={16} />
                </View>
              </TouchableOpacity>
            )}

            {/* Current Tracking Cards */}
            {activeShipments.map((s) => (
              <TrackingCard
                key={s.id}
                shipment={s}
                onPress={() => router.push(shipmentRoute(s))}
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
                  shipment={s}
                  imageSource={require("@/assets/images/cargo_box.png")}
                  onPress={() => router.push(shipmentRoute(s))}
                />
              ))}
            </View>
          )}

          {/* Search Empty State */}
          {filteredShipments.length === 0 && (
            <View style={styles.emptyContainer}>
              <Package color={palette.gray[400]} size={48} />
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
    color: palette.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  headerTitle: {
    color: palette.white,
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
    backgroundColor: palette.white,
    borderRadius: 28,
    paddingLeft: 52,
    paddingRight: 16,
    fontSize: 16,
    color: palette.stone[900], // stone-900
    shadowColor: palette.black,
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
    backgroundColor: palette.gold[400], // brand-gold
    borderRadius: 24, // 3xl
    padding: 24,
    shadowColor: palette.black,
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
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900", // black
  },
  trackingValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trackingValue: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressIconContainer: {
    position: "absolute",
    top: "50%",
    left: "66%",
    transform: [{ translateY: -16 }, { translateX: -16 }],
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: palette.gold[400],
    alignItems: "center",
    justifyContent: "center",
  },
  fastBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-12deg" }],
    borderRadius: 24, // Make it a circle since we don't have SVG star
    zIndex: 20,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fastBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.primary,
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
    color: palette.stone[900], // stone-900
  },
  recentCard: {
    backgroundColor: palette.white, // stone-50/50
    borderRadius: 24, // 3xl
    padding: 20,
    borderWidth: 1,
    borderColor: palette.stone[100], // stone-100
  },
  recentHeader: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  inTransitPill: {
    backgroundColor: palette.gold[400],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  inTransitPillText: {
    color: colors.primary,
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
    color: colors.primary,
    marginBottom: 4,
  },
  recentDateLabel: {
    color: palette.stone[400], // stone-400
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  recentDateValue: {
    color: palette.stone[900],
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
    backgroundColor: palette.stone[200], // stone-200
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
    backgroundColor: palette.gold[400],
    borderRadius: 2,
  },
  smallProgressIconContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateY: -12 }, { translateX: -12 }],
    width: 24,
    height: 24,
    backgroundColor: palette.gold[400],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
  },
  calculateButton: {
    width: "100%",
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: palette.black,
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
    color: palette.white,
    fontSize: 16,
  },
  alertCard: {
    backgroundColor: palette.amber[50],
    borderWidth: 1.5,
    borderColor: palette.amber[500],
    borderRadius: 20,
    padding: 16,
    gap: 8,
    shadowColor: palette.amber[500],
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
    color: palette.amber[700],
  },
  alertCardText: {
    fontSize: 12,
    color: palette.amber[900],
    lineHeight: 18,
  },
  alertCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: palette.amber[100],
    paddingTop: 10,
    marginTop: 4,
  },
  alertCardBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: palette.amber[700],
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: palette.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.gray[200],
    gap: 12,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: palette.gray[500],
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
    backgroundColor: palette.white,
    borderColor: palette.white,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.white,
  },
  pillTextActive: {
    color: colors.primary,
    fontWeight: "bold",
  },
});
