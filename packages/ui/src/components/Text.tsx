import React from 'react';
import { Platform, Text as RNText, type TextProps as RNTextProps } from 'react-native';
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

/**
 * Android 15 under-measures the width of text that has a lineHeight, clipping the
 * last characters of content-sized labels (button titles, references, captions).
 * Android uses the font's natural line height instead.
 */
const androidTypography = Object.fromEntries(
  Object.entries(typography).map(([k, { lineHeight: _lh, ...rest }]) => [k, rest])
) as Record<TypographyVariant, object>;

export function Text({ variant = 'body', tone = 'default', color, align, style, ...rest }: TextProps) {
  const base = Platform.OS === 'android' ? androidTypography[variant] : typography[variant];
  return (
    <RNText
      style={[base, { color: color ?? toneColors[tone] }, align && { textAlign: align }, style]}
      {...rest}
    />
  );
}
