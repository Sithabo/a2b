import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../tokens/colors.ts';
import { layout, radius, spacing } from '../tokens/layout.ts';
import { Text } from './Text.tsx';

export interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (value: T) => void;
  /** Read by screen readers for the whole group, e.g. "Market". */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Equal-width options where exactly one is chosen (market, unit, delivery window…). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.row, style]} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map(({ value: optionValue, label, icon: Icon }) => {
        const active = optionValue === value;
        const fg = active ? colors.onPrimary : colors.text;
        return (
          <Pressable
            key={optionValue}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={label}
            onPress={() => onChange(optionValue)}
            style={({ pressed }) => [styles.option, active && styles.active, pressed && !active && styles.pressed]}
          >
            {Icon && <Icon size={18} color={fg} />}
            <Text variant="bodyStrong" color={fg} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: layout.touchMin,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { backgroundColor: colors.surfaceMuted },
});
