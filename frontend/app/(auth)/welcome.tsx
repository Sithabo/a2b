import React from "react";
import { View, Image, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";

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
          <ThemedText style={styles.headerText}>A2B</ThemedText>
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
          {/* Top Indicator Line
          <View style={styles.indicatorContainer}>
            <View style={styles.topIndicator} />
          </View> */}

          <View style={styles.textContainer}>
            <ThemedText type="title" style={styles.title}>
              Choose Your Role
            </ThemedText>
            <ThemedText style={styles.description}>
              Are you sending goods across Uganda or delivering them? Select
              your role to get started with A2B.
            </ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            {/* Shipper Button */}
            <Button
              title="I am a Shipper"
              onPress={() =>
                router.push({
                  pathname: "/(auth)/login",
                  params: { role: "shipper" },
                })
              }
              style={styles.shipperButton}
              textStyle={styles.shipperButtonText}
            />

            {/* Driver Button */}
            <Button
              title="I am a Driver"
              onPress={() =>
                router.push({
                  pathname: "/(auth)/login",
                  params: { role: "driver" },
                })
              }
              variant="outline"
              style={styles.driverButton}
              textStyle={styles.driverButtonText}
            />
          </View>

          {/* Bottom Indicator Line */}
          {/* <View style={styles.indicatorContainer}>
            <View style={styles.bottomIndicator} />
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: isShortDevice ? 10 : 16,
    paddingBottom: isShortDevice ? 10 : 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.primary, // Forest
  },
  centerImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isShortDevice ? 10 : 16,
    flex: 1,
  },
  imageWrapper: {
    padding: 10,
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
    paddingHorizontal: 24,
    paddingBottom: isShortDevice ? 20 : 32,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  indicatorContainer: {
    alignItems: "center",
    marginVertical: isShortDevice ? 12 : 16,
  },
  topIndicator: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
  },
  bottomIndicator: {
    width: 128,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
    marginTop: isShortDevice ? 16 : 24,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: isShortDevice ? 16 : 24,
  },
  title: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: isSmallDevice ? 14 : 16,
    color: Colors.light.gray[600],
    lineHeight: isSmallDevice ? 20 : 24,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  buttonContainer: {
    gap: 16,
    width: "100%",
  },
  shipperButton: {
    width: "100%",
    backgroundColor: Colors.light.lime, // Lime Green
    borderColor: Colors.light.lime,
    borderRadius: 12, // rounded-xl
    paddingVertical: isShortDevice ? 12 : 16,
  },
  shipperButtonText: {
    color: Colors.light.gray[900],
    fontWeight: "bold",
    fontSize: 18,
  },
  driverButton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderColor: Colors.light.primary,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: isShortDevice ? 12 : 16,
  },
  driverButtonText: {
    color: Colors.light.primary,
    fontWeight: "bold",
    fontSize: 18,
  },
});
