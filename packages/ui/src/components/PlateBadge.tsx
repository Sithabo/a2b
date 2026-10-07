import React from 'react';
import { StyleSheet, View } from 'react-native';
import { palette } from '../tokens/colors.ts';
import { radius, spacing } from '../tokens/layout.ts';
import { Text } from './Text.tsx';

/** A vehicle registration plate, styled like the yellow commercial plates in both markets. */
export function PlateBadge({ plate, size = 'md' }: { plate: string; size?: 'sm' | 'md' | 'lg' }) {
  const variant = size === 'lg' ? 'h1' : size === 'md' ? 'h3' : 'bodyStrong';
  return (
    <View style={[styles.plate, size === 'sm' && styles.small]}>
      <Text variant={variant} color={palette.gray[900]} style={styles.text}>
        {plate}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: palette.gray[900],
    backgroundColor: palette.amber[300],
  },
  small: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1.5 },
  text: { letterSpacing: 1.5, fontWeight: '800' },
});
