import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors } from '../tokens/colors';
import { radius, spacing } from '../tokens/layout';

export interface CardProps extends ViewProps {
  /** outlined = white with border (default), muted = sunken grey fill, brand = solid forest. */
  variant?: 'outlined' | 'muted' | 'brand';
  padding?: keyof typeof spacing;
}

export function Card({ variant = 'outlined', padding = 'xl', style, ...rest }: CardProps) {
  return <View style={[styles.base, styles[variant], { padding: spacing[padding] }, style]} {...rest} />;
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
});
