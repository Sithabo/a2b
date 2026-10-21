import React from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Phone, Package } from 'lucide-react-native';
import { Button, Card, Text, colors, layout, radius, spacing, tones } from "@a2b/ui";
import { formatMoney } from "@a2b/core";
import { useMarket } from "@/store/useMarket";
import { parseLoadId, useShipment } from "@/lib/loads";
import { LoadState } from "@/components/LoadState";

const METHOD_LABELS: Record<string, string> = {
  mtn: 'MTN Mobile Money',
  airtel: 'Airtel Money',
  mmg: 'MMG Mobile Money',
  card: 'Debit/Credit Card',
};

// Source: 7.html — "Payment Confirmed!"
export default function PaymentConfirmedScreen() {
  const router = useRouter();
  const market = useMarket();
  const { trackingId, method } = useLocalSearchParams<{ trackingId: string; method?: string }>();
  const { data: shipment, error, refetch } = useShipment(parseLoadId(trackingId));

  if (!shipment) return <LoadState error={error} onRetry={refetch} />;
  const amount = shipment.escrow?.amount ?? shipment.offerPrice;
  const paidWith = METHOD_LABELS[method ?? shipment.escrow?.depositMethod ?? ''] ?? 'mobile money';
  const driverPhone = shipment.carrier?.driverPhone;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card padding="2xl" style={styles.card}>
          {/* Green Check Circle */}
          <View style={styles.checkCircle}>
            <Check color={colors.onPrimary} size={44} strokeWidth={3} />
          </View>

          {/* Title */}
          <Text variant="h1" tone="primary" align="center">Payment Confirmed!</Text>
          <Text variant="bodySm" tone="muted" align="center" style={styles.subtitle}>
            Your deposit is secured in escrow
          </Text>

          {/* Amount Deposited Box */}
          <View style={styles.amountBox}>
            <Text variant="label" tone="muted" style={styles.amountLabel}>Amount Deposited</Text>
            <Text variant="display" tone="primary" style={styles.amountValue}>{formatMoney(amount, market)}</Text>
            <View style={styles.paymentViaRow}>
              <Text variant="caption" tone="muted">via {paidWith}</Text>
            </View>
          </View>

          {/* Driver Unlocked Info Box */}
          <View style={styles.infoBox}>
            <Text variant="caption" tone="secondary" align="center">
              Driver details have been unlocked and they are heading to pickup. You will receive
              updates as they progress through the delivery.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title="Call Driver"
              icon={Phone}
              onPress={() => driverPhone && Linking.openURL(`tel:${driverPhone}`)}
              disabled={!driverPhone}
              fullWidth
            />

            <Button
              title="See Pending Shipments"
              icon={Package}
              variant="secondary"
              onPress={() => router.replace('/(tabs)')}
              fullWidth
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginTop: -spacing.sm,
  },
  amountBox: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  amountLabel: {
    marginBottom: spacing.sm,
  },
  amountValue: {
    marginBottom: spacing.xs,
  },
  paymentViaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  infoBox: {
    width: '100%',
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: tones.warning.bg,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.md,
  },
});
