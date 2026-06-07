import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function PrivacyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: theme.whiteAsh || "#F9FAFB" }]}>
      <ScreenHeader
        title="Privacy Policy"
        subtitle="Review our privacy terms"
        onBackPress={() => router.replace("/(tabs)/account")}
        onCancelPress={() => router.replace("/(tabs)/account")}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.introHeading}>Privacy Policy & Terms</Text>
        <Text style={styles.lastUpdated}>Last Updated: June 7, 2026</Text>

        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>1. Data Collection</Text>
          <Text style={styles.sectionBody}>
            A2B collects business profiles, contact information, and delivery locations to orchestrate freight transportation services efficiently. When Shippers input tax details, we store Tax Identification Numbers (TIN) securely inside encrypted databases.
          </Text>

          <Text style={styles.sectionTitle}>2. Location & Tracking data</Text>
          <Text style={styles.sectionBody}>
            We track shipment routes, geofences, and live GPS coordinates to facilitate real-time tracking, security verifications, and port checkpoint clearances. Shippers receive live updates during transit, and coordinates are archived once a shipment completes.
          </Text>

          <Text style={styles.sectionTitle}>3. Escrow Security & Payments</Text>
          <Text style={styles.sectionBody}>
            Payment transaction values are deposited securely into segregated escrow accounts. Payment credentials and card numbers are processed via accredited, PCI-compliant payment gateways and are never stored directly on our servers.
          </Text>

          <Text style={styles.sectionTitle}>4. Regulatory Compliance</Text>
          <Text style={styles.sectionBody}>
            To comply with Guyanese customs regulations and port checkpoint rules, clearing paperwork uploaded to the Document Vault (Form C21, Bill of Lading, and GRA waiver letters) is made accessible strictly to vetting agents and designated freight drivers during gate checking clearances.
          </Text>

          <Text style={styles.sectionTitle}>5. Contact Us</Text>
          <Text style={styles.sectionBody}>
            If you have questions regarding data privacy or want to request account erasure, contact the A2B compliance team directly at privacy@a2b-logistics.com.
          </Text>
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
    paddingBottom: 40,
  },
  introHeading: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F3D26",
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 24,
  },
  termsSection: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionBody: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },
});
