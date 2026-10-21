import React from "react";
import { View, Image, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, colors, spacing, Text } from "@a2b/ui";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isShortDevice = height < 700;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top: Header Logo */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo/a2b.png")}
            style={styles.headerLogo}
          />
          <Text variant="h1" tone="primary">A2B</Text>
        </View>

        {/* Middle: Illustration */}
        <View style={styles.centerImageContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={require("../../assets/logo/a2b.png")}
              style={styles.mainImage}
            />
          </View>
        </View>

        {/* Bottom: Text & Buttons */}
        <View style={styles.bottomContainer}>
          <View style={styles.textContainer}>
            <Text variant={isSmallDevice ? "h1" : "display"} tone="primary" align="center" style={styles.title}>
              Move your goods with A2B
            </Text>
            <Text variant={isSmallDevice ? "bodySm" : "body"} tone="secondary" align="center" style={styles.description}>
              Post a load, pay safely through escrow and track it to the door —
              across Guyana and Uganda.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Get started" onPress={() => router.push("/(auth)/login")} fullWidth />
            <Text variant="caption" tone="muted" align="center">
              Driving or running trucks? Use the A2B Driver or A2B Fleet app.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: "center",
    paddingTop: isShortDevice ? spacing.sm : spacing.lg,
    paddingBottom: isShortDevice ? spacing.sm : spacing.lg,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  headerLogo: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  centerImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isShortDevice ? spacing.sm : spacing.lg,
    flex: 1,
  },
  imageWrapper: {
    padding: spacing.sm,
    position: "relative",
    width: "100%",
    alignItems: "center",
  },
  mainImage: {
    width: isShortDevice ? width * 0.5 : width * 0.6,
    height: isShortDevice ? width * 0.5 : width * 0.6,
    maxWidth: 250,
    maxHeight: 250,
    resizeMode: "contain",
  },
  bottomContainer: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: isShortDevice ? spacing.xl : spacing['3xl'],
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: isShortDevice ? spacing.lg : spacing['2xl'],
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    paddingHorizontal: spacing.lg,
  },
  buttonContainer: {
    gap: spacing.lg,
    width: "100%",
  },
});
