import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrackingCard } from "@/components/TrackingCard";
import { ShippingCard } from "@/components/ShippingCard";
import { ToolCard } from "@/components/ToolCard";
import { useAuthStore } from "@/store/useAuthStore";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const userProfile = useAuthStore((state) => state.userProfile);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <LinearGradient
      colors={["#0F3D26", "#F3F4F6"]}
      locations={[0, 0.35]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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

          {/* Content Body */}
          <View style={styles.content}>
            {/* Current Tracking Card */}
            <TrackingCard
              trackingId="#H62J568107"
              location="Hunters Point, LA"
              status="In Transit"
              progressPercentage={66}
              isFast={true}
              onPress={() => router.push({ pathname: "/active-delivery", params: { trackingId: "#H62J568107" } })}
            />

            {/* Action Tools Grid */}
            <View style={styles.toolsGrid}>
              <ToolCard
                title={"Calculate\nShipping Cost"}
                icon={Calculator}
                onPress={() => router.push("/calculator")}
              />
            </View>

            {/* Recent Shipping Section */}
            <View style={styles.recentSection}>
              <Text style={styles.sectionHeading}>Recent Shipping</Text>

              <ShippingCard
                trackingId="#H62J568107"
                dateValue="15 Sep 2025"
                imageSource={require("@/assets/images/cargo_box.png")}
                onPress={() => router.push({ pathname: "/active-delivery", params: { trackingId: "#H62J568107" } })}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
});
