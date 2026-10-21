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
import { useMarket } from "@/store/useMarket";

export default function HowItWorksScreen() {
  const router = useRouter();
  const market = useMarket();

  const steps = [
    {
      icon: FileText,
      title: "1. Post a Load",
      desc: "Specify your cargo type, delivery timeline, pickup port, and final destination. A2B's geofencing warns you if customs documentation is required.",
    },
    {
      icon: DollarSign,
      title: "2. Set Your Price",
      desc: "Set the price you'll pay with the offer slider; it starts from a recommendation for your cargo. The first verified carrier to accept it gets the job.",
    },
    {
      icon: Truck,
      title: "3. Match with Drivers",
      desc: `Verified carriers in ${market.name} see your load and accept it. Once you fund escrow you see the driver, the truck and their contact details.`,
    },
    {
      icon: ShieldCheck,
      title: "4. Escrow Protection",
      desc: "Your payment is secured in A2B's safe escrow vault before the driver begins their journey. Funds are only released when the cargo arrives.",
    },
    {
      icon: Navigation,
      title: "5. Track Each Step",
      desc: "Follow the shipment as the driver confirms pickup and arrival. At drop-off they photograph the cargo and record who received it.",
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
          A2B connects shippers directly with trusted carriers across {market.name}. Follow our simple process to post and track your shipments safely:
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
