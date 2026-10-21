import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  FileText,
  DollarSign,
  Truck,
  ShieldCheck,
  Navigation,
  CheckCircle,
} from "lucide-react-native";
import { Card, colors, layout, radius, ScreenHeader, spacing, Text } from "@a2b/ui";

export default function HowItWorksScreen() {
  const router = useRouter();

  const steps = [
    {
      icon: FileText,
      title: "1. Post a Load",
      desc: "Specify your cargo type, delivery timeline, pickup port, and final destination. A2B's geofencing warns you if customs documentation is required.",
    },
    {
      icon: DollarSign,
      title: "2. Set Your Offer",
      desc: "Use the interactive pricing slider to place your bidding rate. Itemized surcharge rows display exact regulatory fees transparently.",
    },
    {
      icon: Truck,
      title: "3. Match with Drivers",
      desc: "Registered, vetted freight carriers in Guyana will view your load and accept the shipment. You get full visibility of the driver and truck profiles.",
    },
    {
      icon: ShieldCheck,
      title: "4. Escrow Protection",
      desc: "Your payment is secured in A2B's safe escrow vault before the driver begins their journey. Funds are only released when the cargo arrives.",
    },
    {
      icon: Navigation,
      title: "5. Real-Time Tracking",
      desc: "Follow your shipment live on our GPS tracking map. Monitor delivery progress milestones from Georgetown ports to regional address hubs.",
    },
    {
      icon: CheckCircle,
      title: "6. Inspect & Release",
      desc: "Inspect the goods at drop-off, share the 6-digit verification code with the driver to finalize the shipment, and release funds safely.",
    },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="How A2B Works"
        subtitle="Step-by-step freight shipping guide"
        onBackPress={() => router.replace("/(tabs)/account")}
        onCancelPress={() => router.replace("/(tabs)/account")}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text variant="h1" tone="primary" style={styles.introHeading}>Seamless Freight Logistics</Text>
        <Text variant="bodySm" tone="secondary" style={styles.introSub}>
          A2B connects shippers directly with trusted carriers across Guyana&apos;s industrial corridors. Follow our simple process to post and track your shipments safely:
        </Text>

        <View style={styles.stepsList}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} style={styles.stepCard}>
                <View style={styles.iconContainer}>
                  <Icon color={colors.primary} size={24} />
                </View>
                <View style={styles.stepContent}>
                  <Text variant="bodyStrong">{step.title}</Text>
                  <Text variant="bodySm" tone="muted">{step.desc}</Text>
                </View>
              </Card>
            );
          })}
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
    marginBottom: spacing.sm,
  },
  introSub: {
    marginBottom: spacing['2xl'],
  },
  stepsList: {
    gap: spacing.lg,
  },
  stepCard: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  stepContent: {
    flex: 1,
    gap: spacing.xs,
  },
});
