import React, { useEffect } from "react";
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
  Check,
  MapPin,
  Navigation,
  Package,
  Scale,
  Clock,
  ArrowRight,
} from "lucide-react-native";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function LoadPostedScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Header */}
        <View style={styles.headerContainer}>
          <View style={styles.successIcon}>
            <Check color="white" size={40} strokeWidth={3} />
          </View>
          <Text style={styles.headerTitle}>Load Posted!</Text>
          <Text style={styles.headerSubtitle}>Your offer is now live</Text>
        </View>

        {/* Offer Summary Card */}
        <Card>
          <View style={styles.offerSummaryHeader}>
            <Text style={styles.offerLabel}>Your Offer</Text>
            <View style={styles.offerAmountContainer}>
              <Text style={styles.offerAmount}>150,000</Text>
              <Text style={styles.offerCurrency}>UGX</Text>
            </View>
          </View>

          <View style={styles.locationsContainer}>
            {/* Pickup */}
            <View style={styles.locationItem}>
              <View style={styles.locationLine} />
              <View style={styles.locationIcon}>
                <MapPin size={20} color="#0F3D26" />
              </View>
              <View>
                <Text style={styles.locationLabel}>Pickup</Text>
                <Text style={styles.locationValue}>Kampala, Makindye</Text>
              </View>
            </View>

            {/* Delivery */}
            <View style={styles.locationItem}>
              <View style={styles.locationIcon}>
                <Navigation size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.locationLabel}>Delivery</Text>
                <Text style={styles.locationValue}>Jinja, Industrial</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Load</Text>
              <Text style={styles.detailValue}>Rice bags (50kg × 10)</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>500 kg</Text>
            </View>
          </View>
        </Card>

        {/* Looking for Driver Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerBackground} />
          <View style={styles.bannerIcon}>
            <Clock color="white" size={24} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Looking for Driver</Text>
            <Text style={styles.bannerSubtitle}>
              Waiting for acceptance... (Est: 5-15 min)
            </Text>
          </View>
        </View>

        {/* What Happens Next? */}
        <Card>
          <Text style={styles.sectionTitle}>What Happens Next?</Text>
          <View style={styles.stepsContainer}>
            {[
              "Drivers in the network can see your offer immediately.",
              "A driver accepts your offer (no negotiation needed).",
              "You'll be notified instantly and can track delivery.",
            ].map((text, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <Text style={styles.stepText}>{text}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <PrimaryButton
            title="See Pending Shipments"
            onPress={() => router.replace("/receipts")}
            icon={ArrowRight}
          />

          <TouchableOpacity
            onPress={() => router.dismissAll()}
            style={styles.homeButton}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 100,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 32, // mt-8
    marginBottom: 16, // mb-4
  },
  successIcon: {
    width: 80, // w-20
    height: 80, // h-20
    borderRadius: 40, // rounded-full
    backgroundColor: "#0F3D26", // bg-primary
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16, // mb-4
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24, // text-2xl
    fontWeight: "bold",
    color: "#0F3D26", // text-primary
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#6B7280", // text-gray-500
    fontWeight: "500",
  },
  offerSummaryHeader: {
    alignItems: "center",
    marginBottom: 24, // mb-6
  },
  offerLabel: {
    fontSize: 14, // text-sm
    color: "#6B7280", // text-gray-500
    fontWeight: "500",
    marginBottom: 4,
  },
  offerAmountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  offerAmount: {
    fontSize: 36, // text-4xl
    fontWeight: "800", // font-extrabold
    color: "#0F3D26", // text-primary
  },
  offerCurrency: {
    fontSize: 14, // text-sm
    fontWeight: "bold",
    color: "#6B7280", // text-gray-500
  },
  locationsContainer: {
    backgroundColor: "#F9FAFB", // bg-gray-50
    borderRadius: 8, // rounded-lg
    padding: 16, // p-4
    gap: 16, // space-y-4
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12, // gap-3
    position: "relative",
  },
  locationLine: {
    position: "absolute",
    left: 9,
    top: 24,
    bottom: -16,
    width: 2,
    backgroundColor: "#D1D5DB", // bg-gray-300
    borderStyle: "dashed",
    borderLeftWidth: 1,
    borderLeftColor: "#9CA3AF", // border-gray-400
    height: 32, // h-8
  },
  locationIcon: {
    marginTop: 2, // mt-0.5
  },
  locationLabel: {
    fontSize: 12, // text-xs
    color: "#6B7280", // text-gray-500
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5, // tracking-wider
  },
  locationValue: {
    fontWeight: "bold",
    color: "#1F2937", // text-gray-800
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 16, // mt-4
    paddingTop: 16, // pt-4
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6", // border-gray-100
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  detailLabel: {
    color: "#6B7280", // text-gray-500
    fontSize: 14, // text-sm
  },
  detailValue: {
    fontWeight: "600",
    color: "#1F2937", // text-gray-800
    fontSize: 14, // text-sm
  },
  bannerContainer: {
    backgroundColor: "#D97706", // bg-amber
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    flexDirection: "row",
    alignItems: "center",
    gap: 16, // gap-4
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  bannerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: "#FFFFFF",
  },
  bannerIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", // bg-white/20
    padding: 8, // p-2
    borderRadius: 9999, // rounded-full
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16, // text-base
  },
  bannerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)", // text-white/90
    fontSize: 12, // text-xs
    fontWeight: "500",
    marginTop: 2, // mt-0.5
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#111827", // text-gray-900
    marginBottom: 12, // mb-3
    fontSize: 16, // text-base
  },
  stepsContainer: {
    gap: 12, // space-y-3 / gap-3
  },
  stepItem: {
    flexDirection: "row",
    gap: 12, // gap-3
  },
  stepNumber: {
    fontWeight: "bold",
    color: "#0F3D26", // text-primary
    fontSize: 14,
  },
  stepText: {
    fontSize: 14, // text-sm
    color: "#4B5563", // text-gray-600
    flex: 1,
    lineHeight: 20, // leading-snug
  },
  actionsContainer: {
    gap: 12, // gap-3
    marginBottom: 32, // mb-8
  },
  homeButton: {
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#0F3D26", // border-primary
    paddingVertical: 14, // py-3.5
    borderRadius: 12, // rounded-xl
    alignItems: "center",
  },
  homeButtonText: {
    color: "#0F3D26", // text-primary
    fontWeight: "600", // font-semibold
    fontSize: 16, // text-base
  },
});
