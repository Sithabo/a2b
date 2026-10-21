import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Anchor, ArrowRight, Weight } from 'lucide-react-native';
import type { Data } from '@a2b/api-client';
import { cargoLabel, formatMoney, getMarket, statusMeta } from '@a2b/core';
import { Badge, Card, colors, spacing, Text } from '@a2b/ui';

/** Load board / fleet load card: route, payout, cargo, status. */
export function LoadCard({ load, onPress }: { load: Data.Load; onPress: () => void }) {
  const market = getMarket(load.market);
  const showStatus = load.status !== 'OPEN';
  return (
    <Card onPress={onPress} padding="lg" style={styles.card} accessibilityLabel={`${load.pickupSummary} to ${load.dropoffSummary}`}>
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
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  route: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  place: { flexShrink: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  weight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
