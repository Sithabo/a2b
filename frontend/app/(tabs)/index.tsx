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
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
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
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {userProfile?.name?.charAt(0).toUpperCase() || "M"}
                </Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  Hey {userProfile?.name?.split(" ")[0] || "Musa"}
                </Text>
                <View style={styles.locationContainer}>
                  <MapPin color="rgba(255, 255, 255, 0.7)" size={14} />
                  <Text style={styles.locationText}>Kampala</Text>
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
            <View style={styles.trackingCard}>
              <View style={styles.trackingContent}>
                <View style={styles.trackingRow}>
                  <Text style={styles.trackingLabel}>Current Tracking</Text>
                  <Text style={styles.trackingId}>#H62J568107</Text>
                </View>

                <View style={styles.trackingRow}>
                  <Text style={styles.trackingLabel}>Current Location</Text>
                  <View style={styles.trackingValueContainer}>
                    <MapPin size={14} color="#0F3D26" />
                    <Text style={styles.trackingValue}>Hunters Point, LA</Text>
                  </View>
                </View>

                <View style={styles.trackingRow}>
                  <Text style={styles.trackingLabel}>Status</Text>
                  <View style={styles.trackingValueContainer}>
                    <View style={styles.statusDot} />
                    <Text style={styles.trackingValue}>In Transit</Text>
                  </View>
                </View>

                {/* Progress Line */}
                <View style={styles.progressTrack}>
                  <View style={styles.progressFill} />
                  <View style={styles.progressIconContainer}>
                    <Truck
                      size={14}
                      color="#FFFFFF"
                      style={{ marginLeft: -1 }}
                    />
                  </View>
                </View>
              </View>

              {/* Fast Badge */}
              <View style={styles.fastBadge}>
                <Text style={styles.fastBadgeText}>FAST</Text>
              </View>

              {/* Package Illustration (Mockup) */}
              <View style={styles.packageImageContainer}>
                {/* Using an Expo Image or simple View placeholder for now */}
                <Package
                  size={140}
                  color="white"
                  style={{ opacity: 0.2 }}
                  strokeWidth={1}
                />
              </View>
            </View>

            {/* Recent Shipping Section */}
            <View style={styles.recentSection}>
              <Text style={styles.sectionHeading}>Recent Shipping</Text>

              <View style={styles.recentCard}>
                <View style={styles.recentHeader}>
                  <View style={styles.inTransitPill}>
                    <Text style={styles.inTransitPillText}>IN TRANSIT</Text>
                  </View>
                </View>

                <View style={styles.recentBody}>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentId}>#H62J568107</Text>
                    <Text style={styles.recentDateLabel}>DELIVERY DATE</Text>
                    <Text style={styles.recentDateValue}>15 Sep 2025</Text>
                  </View>
                  <View style={styles.recentImageContainer}>
                    <Package size={60} color="#D1D5DB" strokeWidth={1} />
                  </View>
                </View>

                {/* Small Progress bar */}
                <View style={styles.smallProgressTrack}>
                  <View style={styles.smallProgressFill} />
                  <View style={styles.smallProgressIconContainer}>
                    <Truck size={10} color="#0F3D26" />
                  </View>
                </View>
              </View>
            </View>

            {/* Calculate Shipping Cost */}
            <TouchableOpacity
              style={styles.calculateButton}
              activeOpacity={0.9}
            >
              <View style={styles.calculateButtonLeft}>
                <View style={styles.calculateIconWrapper}>
                  <Calculator size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.calculateText}>
                  Calculate Shipping Cost
                </Text>
              </View>
              <ChevronRight size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
    backgroundColor: "rgba(250, 250, 249, 0.5)", // stone-50/50
    borderRadius: 24, // 3xl
    padding: 20,
    borderWidth: 1,
    borderColor: "#F5F5F4", // stone-100
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
