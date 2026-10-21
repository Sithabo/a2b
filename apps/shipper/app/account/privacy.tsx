import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colors, layout, ScreenHeader, spacing, Text } from "@a2b/ui";

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Privacy Policy"
        subtitle="Review our privacy terms"
        onBackPress={() => router.replace("/(tabs)/account")}
        onCancelPress={() => router.replace("/(tabs)/account")}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text variant="h1" tone="primary" style={styles.introHeading}>Privacy Policy & Terms</Text>
        <Text variant="caption" tone="muted" style={styles.lastUpdated}>Last Updated: June 7, 2026</Text>

        <View style={styles.termsSection}>
          <Text variant="bodyStrong">1. Data Collection</Text>
          <Text variant="bodySm" tone="secondary">
            A2B collects business profiles, contact information, and delivery locations to orchestrate freight transportation services efficiently. When Shippers input tax details, we store Tax Identification Numbers (TIN) securely inside encrypted databases.
          </Text>

          <Text variant="bodyStrong">2. Location & Tracking data</Text>
          <Text variant="bodySm" tone="secondary">
            We track shipment routes, geofences, and live GPS coordinates to facilitate real-time tracking, security verifications, and port checkpoint clearances. Shippers receive live updates during transit, and coordinates are archived once a shipment completes.
          </Text>

          <Text variant="bodyStrong">3. Escrow Security & Payments</Text>
          <Text variant="bodySm" tone="secondary">
            Payment transaction values are deposited securely into segregated escrow accounts. Payment credentials and card numbers are processed via accredited, PCI-compliant payment gateways and are never stored directly on our servers.
          </Text>

          <Text variant="bodyStrong">4. Regulatory Compliance</Text>
          <Text variant="bodySm" tone="secondary">
            To comply with Guyanese customs regulations and port checkpoint rules, clearing paperwork uploaded to the Document Vault (Form C21, Bill of Lading, and GRA waiver letters) is made accessible strictly to vetting agents and designated freight drivers during gate checking clearances.
          </Text>

          <Text variant="bodyStrong">5. Contact Us</Text>
          <Text variant="bodySm" tone="secondary">
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: layout.gutter,
    paddingBottom: spacing['4xl'],
  },
  introHeading: {
    marginBottom: spacing.xs,
  },
  lastUpdated: {
    marginBottom: spacing['2xl'],
  },
  termsSection: {
    gap: spacing.xl,
  },
});
