import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../tokens/colors.ts';
import { radius, spacing } from '../tokens/layout.ts';
import { Text } from './Text.tsx';

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Icon size={28} color={colors.primary} />
      </View>
      <Text variant="h3" align="center">
        {title}
      </Text>
      {message && (
        <Text tone="secondary" align="center">
          {message}
        </Text>
      )}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['3xl'], paddingHorizontal: spacing.xl },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
