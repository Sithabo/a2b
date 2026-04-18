import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ArrowRight, Package, ArrowDown } from "lucide-react-native";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TrustBadge } from "@/components/TrustBadge";

export default function ReviewLoadScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <PageHeader
        title="Review & Fund Offer"
        subtitle="Your money is safe until delivery"
        showBackButton
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Timeline & Details Card */}
        <Card style={styles.cardSpace}>
          {/* Pickup */}
          <View style={styles.timelineItemPickup}>
            <View style={styles.timelineDotPickup} />
            <Text style={styles.timelineLabel}>Pickup</Text>
            <Text style={styles.locationText}>Kampala, Makindye</Text>
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <ArrowDown size={20} color="#D1D5DB" />
          </View>

          {/* Delivery */}
          <View style={styles.timelineItemDelivery}>
            <View style={styles.timelineDotDelivery} />
            <Text style={styles.timelineLabel}>Delivery</Text>
            <Text style={styles.locationText}>Jinja, Industrial Area</Text>
          </View>

          <View style={styles.divider} />

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.iconBox}>
              <Package size={20} color="#6B7280" />
            </View>
            <View style={styles.detailsTextContainer}>
              <Text style={styles.detailsLabel}>Load Details</Text>
              <Text style={styles.detailsValue}>Rice bags (50kg × 10)</Text>
              <Text style={styles.weightText}>Weight: 500 kg</Text>
            </View>
          </View>

          {/* Fund Box */}
          <View style={styles.fundBox}>
            <View style={styles.fundHeader}>
              <Text style={styles.fundTitle}>Fund Your Offer</Text>
              <View style={styles.fundAmountContainer}>
                <Text style={styles.fundAmount}>150,000</Text>
                <Text style={styles.fundCurrency}>UGX</Text>
              </View>
            </View>
            <Text style={styles.fundNote}>Drivers will see this amount</Text>
          </View>
        </Card>

        {/* Escrow Badge */}
        <TrustBadge message="Your offer is protected. Driver must confirm pickup before funds are held. Money is only released upon confirmed delivery." />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Post Load & Find Driver"
          onPress={() => router.push("/create-load/success")}
          icon={ArrowRight}
        />
      </View>
    </SafeAreaView>
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
  cardSpace: {
    paddingBottom: 24,
  },
  timelineItemPickup: {
    position: "relative",
    paddingLeft: 24, // pl-6
    paddingBottom: 24, // pb-6
    borderLeftWidth: 2,
    borderLeftColor: "#E5E7EB", // border-gray-200
    borderStyle: "dashed",
  },
  timelineItemDelivery: {
    position: "relative",
    paddingLeft: 24,
    paddingBottom: 24,
  },
  timelineDotPickup: {
    position: "absolute",
    left: -9,
    top: 0,
    width: 16, // w-4
    height: 16, // h-4
    backgroundColor: "#0F3D26", // bg-primary
    borderRadius: 8,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  timelineDotDelivery: {
    position: "absolute",
    left: -9,
    top: 0,
    width: 16,
    height: 16,
    backgroundColor: "#D97706", // bg-amber
    borderRadius: 8,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  timelineLabel: {
    fontSize: 12, // text-xs
    fontWeight: "600",
    color: "#6B7280", // text-gray-500
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 18, // text-lg
    fontWeight: "bold",
    color: "#111827", // text-gray-900
  },
  arrowContainer: {
    paddingLeft: 24,
    marginTop: -12, // -mt-3
    marginBottom: 12, // mb-3
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6", // bg-gray-100
    width: "100%",
    marginVertical: 16, // my-4
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12, // space-x-3
    marginBottom: 24, // mb-6
  },
  iconBox: {
    backgroundColor: "#F9FAFB", // bg-gray-50
    padding: 8, // p-2
    borderRadius: 8, // rounded-lg
  },
  detailsTextContainer: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  detailsValue: {
    fontSize: 14, // text-sm
    fontWeight: "500", // font-medium
    color: "#111827",
  },
  weightText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  fundBox: {
    backgroundColor: "rgba(15, 61, 38, 0.05)", // bg-primary/5
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    borderColor: "rgba(15, 61, 38, 0.1)", // border-primary/10
    borderWidth: 1,
  },
  fundHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  fundTitle: {
    fontSize: 14, // text-sm
    fontWeight: "600",
    color: "#0F3D26", // text-primary
  },
  fundAmountContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  fundAmount: {
    fontSize: 24, // text-2xl
    fontWeight: "bold",
    color: "#0F3D26",
  },
  fundCurrency: {
    fontSize: 12, // text-xs
    fontWeight: "400",
    paddingTop: 8, // pt-2
    opacity: 0.7,
    marginLeft: 4,
    color: "#0F3D26",
  },
  fundNote: {
    fontSize: 12, // text-xs
    color: "#6B7280", // text-gray-500
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: 32,
  },
});
