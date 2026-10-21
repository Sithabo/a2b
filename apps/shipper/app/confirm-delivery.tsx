import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Shield } from "lucide-react-native";
import { Button, colors, ScreenHeader, spacing, Text } from "@a2b/ui";

export default function ConfirmDeliveryScreen() {
  const router = useRouter();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader title="Confirm Delivery" onBackPress={() => router.back()} />

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
        <Text variant="display" tone="primary" align="center" style={styles.title}>
          Have your goods{"\n"}arrived safely?
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Yes, I have received them"
            fullWidth
            onPress={() => router.push({ pathname: "/release-funds", params: { trackingId } })}
          />

          <Button
            title="Not yet"
            variant="secondary"
            fullWidth
            onPress={() => router.back()}
          />
        </View>

        {/* Escrow Footer Info */}
        <View style={styles.footerInfo}>
          <View style={styles.shieldIconContainer}>
            <Shield color={colors.onAccent} size={16} fill={colors.accent} />
          </View>
          <Text variant="bodySm" tone="accent">
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing["2xl"],
    alignItems: "center",
    paddingTop: spacing["4xl"],
  },
  imageContainer: {
    marginBottom: spacing["4xl"],
  },
  cargoImage: {
    width: 180,
    height: 180,
  },
  title: {
    marginBottom: spacing["4xl"] + spacing.xl,
  },
  actionSection: {
    width: "100%",
    gap: spacing.lg,
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing["4xl"],
    gap: spacing.md,
  },
  shieldIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
