import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Anchor, ArrowRight, Weight } from 'lucide-react-native';
import type { Data } from '@a2b/api-client';
import { formatMoney, getMarket, statusMeta } from '@a2b/core';
import { Badge, colors, radius, spacing, Text } from '@a2b/ui';

const CARGO_LABELS: Record<string, string> = {
  GENERAL_CARGO: 'General cargo',
  FRAGILE_CARGO: 'Fragile cargo',
  BULK_CARGO: 'Bulk cargo',
  HEAVY_MACHINERY: 'Heavy machinery',
  FOOD_BEVERAGE: 'Food & beverages',
  CHEMICALS_PHARMA: 'Chemicals & pharma',
};

export const cargoLabel = (type: string) => CARGO_LABELS[type] ?? type;

/** Load board / fleet load card: route, payout, cargo, status. */
export function LoadCard({ load, onPress }: { load: Data.Load; onPress: () => void }) {
  const market = getMarket(load.market);
  const showStatus = load.status !== 'OPEN';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={styles.top}>
        <Text variant='h2' tone='primary'>
          {formatMoney(load.escrow?.amount ?? load.offerPrice, market)}
        </Text>
        {showStatus ? (
          <Badge label={statusMeta[load.status].label} tone={statusMeta[load.status].tone} dot />
        ) : load.isImport ? (
          <Badge label='Port pickup · docs ready' tone='warning' icon={Anchor} />
        ) : null}
      </View>

      <View style={styles.route}>
        <Text variant='bodyStrong' style={styles.place} numberOfLines={1}>
          {load.pickupSummary}
        </Text>
        <ArrowRight size={16} color={colors.textMuted} />
        <Text variant='bodyStrong' style={styles.place} numberOfLines={1}>
          {load.dropoffSummary}
        </Text>
      </View>

      <View style={styles.meta}>
        <Text variant='caption' tone='secondary'>
          {cargoLabel(load.cargoType)}
        </Text>
        {load.weightKg ? (
          <View style={styles.weight}>
            <Weight size={12} color={colors.textMuted} />
            <Text variant='caption' tone='secondary'>
              {(load.weightKg / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} t
            </Text>
          </View>
        ) : null}
        <Text variant='caption' tone='muted'>
          {load.reference}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  route: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  place: { flexShrink: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  weight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
