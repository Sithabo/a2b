import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Truck, AlertCircle, ShieldCheck } from 'lucide-react-native';
import { Button, Card, Text, colors, fontFamily, layout, radius, spacing, tones } from "@a2b/ui";
import { useMarket } from "@/store/useMarket";
import { formatMoney } from "@a2b/core";
import { parseLoadId, useShipment } from "@/lib/loads";
import { LoadState } from "@/components/LoadState";

// Source: 5.html — "Driver Accepted & Deposit"
export default function DriverFoundScreen() {
  const router = useRouter();
  const market = useMarket();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const { data: shipment, error, refetch } = useShipment(parseLoadId(trackingId));

  if (!shipment) return <LoadState error={error} onRetry={refetch} />;
  const deposit = shipment.escrow?.amount ?? shipment.offerPrice;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card padding="2xl" style={styles.card}>
          {/* Truck Icon Header */}
          <View style={styles.iconCircle}>
            <Truck color={colors.onPrimary} size={32} />
          </View>

          {/* Title */}
          <Text variant="h1" align="center">Driver Accepted!</Text>
          <Text variant="bodySm" tone="muted" align="center" style={styles.subtitle}>
            A verified driver is ready to pick up your load
          </Text>

          {/* Action Required Banner */}
          <View style={styles.alertBanner}>
            <AlertCircle color={colors.warning} size={20} style={styles.alertIcon} />
            <View style={styles.alertContent}>
              <Text variant="bodyStrong" color={tones.warning.fg} style={styles.alertTitle}>Action Required</Text>
              <Text variant="caption" color={colors.warning}>
                Deposit funds to unlock driver details and confirm pickup
                {shipment.escrow?.fundingDueAt
                  ? `. Deposit by ${new Date(shipment.escrow.fundingDueAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} or the driver is released and your load goes back on the board.`
                  : ""}
              </Text>
            </View>
          </View>

          {/* Amount to Deposit */}
          <View style={styles.amountBox}>
            <Text variant="label" tone="muted" style={styles.amountLabel}>Amount to Deposit</Text>
            <Text variant="display" tone="primary">{formatMoney(deposit, market, { code: false })}</Text>
            <Text variant="bodySm" tone="muted" style={styles.amountCurrency}>{market.currency.code}</Text>
          </View>

          {/* Escrow Note */}
          <View style={styles.escrowBadge}>
            <ShieldCheck color={colors.textMuted} size={16} />
            <Text variant="caption" tone="muted" style={styles.escrowText}>
              <Text variant="caption" tone="muted" style={styles.escrowBold}>Escrow Protection: </Text>
              Money is held safely. Driver only gets paid upon confirmed delivery.
            </Text>
          </View>

          {/* Primary CTA */}
          <Button
            title={`Deposit ${formatMoney(deposit, market)} to Unlock Driver`}
            onPress={() => router.push({ pathname: '/match-pay/payment', params: { trackingId: shipment.id } })}
            fullWidth
          />

          {/* Secondary cancel link */}
          <Button title="Cancel & Go Back" variant="ghost" size="sm" onPress={() => router.back()} />
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
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
    paddingTop: spacing['2xl'],
  },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    paddingHorizontal: spacing.lg,
  },
  alertBanner: {
    width: '100%',
    backgroundColor: colors.warningMuted,
    borderWidth: 1,
    borderColor: tones.warning.bg,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  alertIcon: {
    marginTop: spacing.xxs,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    marginBottom: spacing.xs,
  },
  amountBox: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  amountLabel: {
    marginBottom: spacing.sm,
  },
  amountCurrency: {
    marginTop: spacing.xs,
  },
  escrowBadge: {
    width: '100%',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  escrowText: {
    flex: 1,
  },
  escrowBold: {
    fontFamily: fontFamily.bold,
  },
});
