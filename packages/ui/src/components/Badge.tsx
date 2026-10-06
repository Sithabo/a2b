import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { tones, type Tone } from '../tokens/colors.ts';
import { radius, spacing } from '../tokens/layout.ts';
import { Text } from './Text.tsx';

export interface BadgeProps {
  label: string;
  tone?: Tone;
  icon?: LucideIcon;
  /** Shows a small status dot instead of an icon. */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = 'neutral', icon: Icon, dot = false, style }: BadgeProps) {
  const t = tones[tone];
  return (
    <View style={[styles.base, { backgroundColor: t.bg }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: t.fg }]} />}
      {Icon && <Icon size={12} color={t.fg} strokeWidth={2.5} />}
      <Text variant="label" color={t.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
