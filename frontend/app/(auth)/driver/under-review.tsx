import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";

export default function UnderReviewScreen() {
  const router = useRouter();

  const handleBackToHome = () => {
    // Navigate back to the very start or handle accordingly
    router.dismissAll();
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Clock size={64} color={Colors.light.amber} />
        </View>

        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.title}>
            Account Under Review
          </ThemedText>
          <ThemedText style={styles.description}>
            We're verifying your documents. This usually takes{" "}
            <ThemedText style={styles.boldText}>24-48 hours</ThemedText>.
          </ThemedText>
        </View>

        <View style={styles.infoBox}>
          <ThemedText style={styles.infoText}>
            You cannot accept jobs yet. We'll send you an SMS when you're
            approved.
          </ThemedText>
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.contactContainer}>
            <ThemedText style={styles.questionText}>Questions?</ThemedText>
            <ThemedText style={styles.phoneText}>Call: 0800 123 456</ThemedText>
          </View>

          <Button
            title="Back to Home"
            variant="ghost"
            onPress={handleBackToHome}
            style={styles.backButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.ivory,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 32,
  },
  iconWrapper: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(217, 119, 6, 0.1)", // Amber/10
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "rgba(217, 119, 6, 0.2)", // Amber/20
  },
  headerContainer: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: Colors.light.primary,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    fontSize: 18,
    color: Colors.light.gray[500],
    lineHeight: 28,
  },
  boldText: {
    fontWeight: "bold",
    color: Colors.light.primary,
  },
  infoBox: {
    backgroundColor: "rgba(217, 119, 6, 0.1)", // Amber/10
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.2)", // Amber/20
    width: "100%",
  },
  infoText: {
    color: "#92400E", // Amber-800 approx
    textAlign: "center",
    fontWeight: "500",
  },
  footerContainer: {
    width: "100%",
    gap: 16,
    paddingTop: 40,
  },
  contactContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  questionText: {
    color: Colors.light.gray[400],
    fontWeight: "bold",
    marginBottom: 4,
  },
  phoneText: {
    color: Colors.light.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    width: "100%",
  },
});
