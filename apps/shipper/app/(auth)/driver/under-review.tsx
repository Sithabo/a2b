import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, palette, Text, Button } from "@a2b/ui";

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
          <Clock size={64} color={palette.amber[600]} />
        </View>

        <View style={styles.headerContainer}>
          <Text variant="display" tone="primary" style={styles.title}>
            Account Under Review
          </Text>
          <Text tone="primary" style={styles.description}>
            We're verifying your documents. This usually takes{" "}
            <Text tone="primary" style={styles.boldText}>24-48 hours</Text>.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text tone="primary" style={styles.infoText}>
            You cannot accept jobs yet. We'll send you an SMS when you're
            approved.
          </Text>
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.contactContainer}>
            <Text tone="primary" style={styles.questionText}>Questions?</Text>
            <Text tone="primary" style={styles.phoneText}>Call: 0800 123 456</Text>
          </View>

          <Button
            title="Back to Home"
            variant="ghost"
            onPress={handleBackToHome}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.ivory[200],
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
    color: colors.primary,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    fontSize: 18,
    color: palette.gray[500],
    lineHeight: 28,
  },
  boldText: {
    fontWeight: "bold",
    color: colors.primary,
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
    color: palette.amber[800], // Amber-800 approx
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
    color: palette.gray[400],
    fontWeight: "bold",
    marginBottom: 4,
  },
  phoneText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
});
