import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ArrowLeft, Shield } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, palette } from "@a2b/ui";

export default function ConfirmDeliveryScreen() {
  const router = useRouter();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} />
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft color={palette.gray[900]} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Delivery</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.content}>
        {/* Cargo Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/cargo_box.png")}
            style={styles.cargoImage}
            contentFit="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Have your goods{"\n"}arrived safely?</Text>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: "/release-funds", params: { trackingId } })}
          >
            <Text style={styles.primaryButtonText}>Yes, I have received them</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Not yet</Text>
          </TouchableOpacity>
        </View>

        {/* Escrow Footer Info */}
        <View style={styles.footerInfo}>
          <View style={styles.shieldIconContainer}>
            <Shield color={palette.white} size={16} fill={palette.amber[600]} />
          </View>
          <Text style={styles.footerText}>
            Funds are only released after{"\n"}confirmation.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.ivory[200],
  },
  header: {
    backgroundColor: palette.ivory[200],
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: palette.gray[900],
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    paddingTop: 40,
  },
  imageContainer: {
    marginBottom: 40,
  },
  cargoImage: {
    width: 180,
    height: 180,
    // Add shadow if we want to replicate the 3D depth, but image already has some.
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.primary,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 60,
  },
  actionSection: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 9999,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.gray[900],
  },
  secondaryButtonText: {
    color: palette.gray[900],
    fontSize: 16,
    fontWeight: "bold",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    gap: 12,
  },
  shieldIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: palette.amber[600],
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});
