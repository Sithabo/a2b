import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../tokens/colors';

export interface IconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  /** surface = white circle with border, brand = solid forest, plain = no chrome. */
  variant?: 'surface' | 'brand' | 'plain';
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  size = 40,
  style,
}: IconButtonProps) {
  const fg = variant === 'brand' ? colors.onPrimary : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={(48 - size) / 2 > 0 ? (48 - size) / 2 : 0}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        { width: size, height: size, borderRadius: size / 2 },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <Icon color={fg} size={size / 2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  brand: { backgroundColor: colors.primary },
  plain: {},
});
