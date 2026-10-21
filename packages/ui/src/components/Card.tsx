import React from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { colors } from '../tokens/colors.ts';
import { radius, spacing } from '../tokens/layout.ts';

export interface CardProps extends ViewProps {
  /** outlined = white with border (default), muted = sunken grey fill, brand = solid forest. */
  variant?: 'outlined' | 'muted' | 'brand';
  padding?: keyof typeof spacing;
  /** Makes the whole card a button (list cards that open a detail screen). */
  onPress?: () => void;
  disabled?: boolean;
}

export function Card({ variant = 'outlined', padding = 'xl', style, onPress, disabled, ...rest }: CardProps) {
  const base = [styles.base, styles[variant], { padding: spacing[padding] }];
  if (!onPress) return <View style={[base, style]} {...rest} />;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [base, pressed && styles.pressed, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  muted: {
    backgroundColor: colors.surfaceSunken,
    borderColor: 'transparent',
  },
  brand: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: { opacity: 0.9 },
});
