import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

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
          <Text style={styles.headerText}>A2B</Text>
        </View>

        {/* Middle: Illustration (Placeholder A2B Logo) */}
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
          {/* Top Indicator Line */}
          <View style={styles.indicatorContainer}>
            <View style={styles.topIndicator} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.description}>
              Are you sending goods across Uganda or delivering them? Select
              your role to get started with A2B.
            </Text>
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
              textClassName="text-gray-900 font-bold text-lg"
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
              textClassName="text-[#0F3D26] font-bold text-lg"
            />
          </View>

          {/* Bottom Indicator Line */}
          <View style={styles.indicatorContainer}>
            <View style={styles.bottomIndicator} />
          </View>
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
    paddingTop: 16,
    paddingBottom: 16, // Reduced padding
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
    color: "#0F3D26",
  },
  centerImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16, // Flexible padding
  },
  imageWrapper: {
    padding: 10,
    position: "relative",
    width: "100%",
    alignItems: "center",
  },
  mainImage: {
    width: width * 0.6, // Responsive width
    height: width * 0.6, // Responsive height
    maxWidth: 250,
    maxHeight: 250,
    resizeMode: "contain",
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  indicatorContainer: {
    alignItems: "center",
    marginVertical: 16, // Reduced margins
  },
  topIndicator: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0F3D26",
  },
  bottomIndicator: {
    width: 128,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0F3D26",
    marginTop: 24,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32, // Slightly smaller on strict mobile constraints if needed, but keeping large
    fontWeight: "bold",
    color: "#0F3D26",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#4B5563", // Gray-600
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  buttonContainer: {
    gap: 16,
    width: "100%",
  },
  shipperButton: {
    width: "100%",
    backgroundColor: "#C4E84A", // Lime Green
    borderColor: "#C4E84A",
    borderRadius: 12,
    paddingVertical: 16,
  },
  driverButton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderColor: "#0F3D26",
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
  },
});
