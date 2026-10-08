import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../tokens/colors.ts';
import { layout, radius, spacing } from '../tokens/layout.ts';
import { Text } from './Text.tsx';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  /** primary = solid forest, secondary = forest outline, accent = amber (escrow/holding), ghost = text only. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const variantStyles: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
  secondary: { bg: 'transparent', fg: colors.primary, border: colors.primary },
  accent: { bg: colors.accent, fg: colors.onAccent, border: colors.accent },
  ghost: { bg: 'transparent', fg: colors.textSecondary, border: 'transparent' },
  danger: { bg: colors.danger, fg: colors.textInverse, border: colors.danger },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { minHeight: 40, paddingHorizontal: spacing.lg },
  md: { minHeight: layout.touchMin, paddingHorizontal: spacing.xl },
  lg: { minHeight: layout.touchLg, paddingHorizontal: spacing['2xl'] },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  testID,
}: ButtonProps) {
  const v = variantStyles[variant];
  const inactive = disabled || loading;
  const icon = Icon ? <Icon size={20} color={v.fg} strokeWidth={2.2} /> : null;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        { backgroundColor: v.bg, borderColor: v.border },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {iconPosition === 'left' && icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text variant="button" color={v.fg}>
            {title}
          </Text>
          {iconPosition === 'right' && icon && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.45 },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
});
