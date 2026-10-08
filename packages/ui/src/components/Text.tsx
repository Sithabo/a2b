import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { colors } from '../tokens/colors.ts';
import { typography, type TypographyVariant } from '../tokens/layout.ts';

const toneColors = {
  default: colors.text,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  inverse: colors.textInverse,
  primary: colors.primary,
  accent: colors.accent,
  success: colors.success,
  danger: colors.danger,
} as const;

export type TextTone = keyof typeof toneColors;

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  tone?: TextTone;
  /** Overrides `tone`. */
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Text({ variant = 'body', tone = 'default', color, align, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[typography[variant], { color: color ?? toneColors[tone] }, align && { textAlign: align }, style]}
      {...rest}
    />
  );
}
