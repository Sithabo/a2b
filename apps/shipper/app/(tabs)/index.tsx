import React, { useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import {
  Bell,
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
import { useUserProfile } from "@/store/useShipperProfile";
import { useShipmentStore } from "@/store/useShipmentStore";
import {
  Card,
  ChipGroup,
  EmptyState,
  Text,
  TextField,
  colors,
  layout,
  radius,
  spacing,
  tones,
} from "@a2b/ui";
import { cargoLabel, isActiveStatus, statusGroup } from "@a2b/core";
import { Avatar, QueryFallback } from "@a2b/features";
import { shipmentRoute, useMyShipments } from "@/lib/loads";

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
] as const satisfies { value: string; label: string }[];

export default function HomeScreen() {
  const router = useRouter();
  const userProfile = useUserProfile();
  const draft = useShipmentStore((state) => state.draft);
  const shipmentsQuery = useMyShipments();
  const { refetch, isRefetching } = shipmentsQuery;
  const shipments = shipmentsQuery.data ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "PENDING" | "COMPLETED">("ALL");
  const insets = useSafeAreaInsets();
  const greetingName = (userProfile?.name || userProfile?.company)?.trim().split(/\s+/)[0];

  const filteredShipments = shipments.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || (
      String(s.id).includes(query) ||
      s.reference.toLowerCase().includes(query) ||
      s.pickupSummary.toLowerCase().includes(query) ||
      s.dropoffSummary.toLowerCase().includes(query) ||
      cargoLabel(s.cargoType).toLowerCase().includes(query)
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
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.onPrimary} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
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
              <Link href={"/(tabs)/account"} asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Account"
                  style={({ pressed }) => [
                    styles.avatarContainer,
                    userProfile?.avatarPath && styles.avatarNoBorder,
                    pressed && styles.pressed,
                  ]}
                >
                  {userProfile?.avatarPath ? (
                    <Avatar path={userProfile.avatarPath} name={userProfile.name} size={48} />
                  ) : (
                    <User color={colors.onPrimary} size={24} />
                  )}
                </Pressable>
              </Link>
              <View>
                <Text variant="h2" tone="inverse">
                  {greetingName ? `Hey ${greetingName}` : "Welcome back"}
                </Text>
                <View style={styles.locationContainer}>
                  <MapPin color={colors.onPrimaryMuted} size={14} />
                  <Text variant="bodySm" color={colors.onPrimaryMuted}>
                    {userProfile?.region || "Select Region"}
                  </Text>
                </View>
              </View>
            </View>
            <Link href={"/account/notifications"} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                hitSlop={spacing.xs}
                style={({ pressed }) => [styles.headerNotificationButton, pressed && styles.pressed]}
              >
                <Bell color={colors.onPrimary} size={20} />
              </Pressable>
            </Link>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextField
              leading={<Search color={colors.textPlaceholder} size={20} />}
              placeholder="Search Shipping"
              accessibilityLabel="Search shipments"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Status Pills */}
          <View style={styles.pillsContainer}>
            <ChipGroup
              scroll
              options={[...STATUS_FILTERS]}
              value={selectedStatus}
              onChange={setSelectedStatus}
            />
          </View>

          {/* Top Content inside gradient */}
          <View style={styles.topContent}>
            {/* Active Alert Card if draft exists */}
            {draft?.savedAt && (
              <Card
                padding="lg"
                onPress={() => router.push("/create-load/document-vault")}
                accessibilityLabel="Unfinished import shipment. Complete document vault uploads"
                style={styles.alertCard}
              >
                <View style={styles.alertCardHeader}>
                  <AlertTriangle color={colors.accent} size={20} />
                  <Text variant="bodyStrong" color={colors.warning} style={styles.flexShrink}>
                    ⚠️ Unfinished Import Shipment Detected
                  </Text>
                </View>
                <Text variant="caption" color={tones.warning.fg}>
                  Your route information from {draft.pickup?.name ?? "your pickup point"} is saved. Tap here to complete your document uploads and release this load.
                </Text>
                <View style={styles.alertCardFooter}>
                  <Text variant="label" color={colors.warning}>Complete Document Vault Uploads</Text>
                  <ChevronRight color={colors.accent} size={16} />
                </View>
              </Card>
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
              <Text variant="h2">Recent Shipping</Text>

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

          {/* Loading, or couldn't load (rather than "no shipments") */}
          {!shipmentsQuery.data && (
            <QueryFallback
              error={shipmentsQuery.error}
              onRetry={() => refetch()}
              errorMessage="We couldn't load your shipments."
            />
          )}

          {/* Search Empty State */}
          {shipmentsQuery.data && filteredShipments.length === 0 && (
            <Card padding="none">
              <EmptyState
                icon={Package}
                title="No Shipments Found"
                message={"We couldn't find any shipments matching \"" + searchQuery + "\""}
              />
            </Card>
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
    paddingHorizontal: layout.gutter,
    gap: spacing.xl,
    paddingBottom: spacing["2xl"],
  },
  bottomContent: {
    paddingHorizontal: layout.gutter,
    gap: spacing.xl,
    paddingTop: spacing.md,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.onPrimaryTrack,
    backgroundColor: colors.onPrimaryWash,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarNoBorder: {
    borderWidth: 0,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  headerNotificationButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.onPrimaryWash,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  searchContainer: {
    marginHorizontal: layout.gutter,
    marginBottom: spacing["2xl"],
  },
  pillsContainer: {
    paddingHorizontal: layout.gutter,
    marginBottom: spacing.xl,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  recentSection: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  alertCard: {
    backgroundColor: colors.warningMuted,
    borderColor: colors.accent,
    gap: spacing.sm,
  },
  alertCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  flexShrink: {
    flexShrink: 1,
  },
  alertCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: tones.warning.bg,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
});
