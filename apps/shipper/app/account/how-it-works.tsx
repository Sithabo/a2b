import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  FileText,
  DollarSign,
  Truck,
  ShieldCheck,
  Navigation,
  CheckCircle,
} from "lucide-react-native";
import { colors, palette, ScreenHeader } from "@a2b/ui";

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
    <View style={[styles.container, { backgroundColor: colors.background || palette.gray[50] }]}>
      <ScreenHeader
        title="How A2B Works"
        subtitle="Step-by-step freight shipping guide"
        onBackPress={() => router.replace("/(tabs)/account")}
        onCancelPress={() => router.replace("/(tabs)/account")}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.introHeading}>Seamless Freight Logistics</Text>
        <Text style={styles.introSub}>
          A2B connects shippers directly with trusted carriers across Guyana's industrial corridors. Follow our simple process to post and track your shipments safely:
        </Text>

        <View style={styles.stepsList}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <View key={index} style={styles.stepCard}>
                <View style={styles.iconContainer}>
                  <Icon color={colors.primary} size={24} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introHeading: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primary,
    marginBottom: 8,
  },
  introSub: {
    fontSize: 14,
    color: palette.gray[600],
    lineHeight: 22,
    marginBottom: 24,
  },
  stepsList: {
    gap: 16,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: palette.gray[100],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: palette.forest[50],
    alignItems: "center",
    justifyContent: "center",
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.gray[900],
  },
  stepDesc: {
    fontSize: 13,
    color: palette.gray[500],
    lineHeight: 20,
  },
});
