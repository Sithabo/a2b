import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../tokens/colors.ts';
import { radius, spacing } from '../tokens/layout.ts';
import { Text } from './Text.tsx';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
}

export function Chip({ label, selected = false, onPress, icon: Icon }: ChipProps) {
  const fg = selected ? colors.onPrimary : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && { opacity: 0.85 }]}
    >
      {Icon && <Icon size={16} color={fg} />}
      <Text variant="bodySm" color={fg} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

export interface ChipGroupProps<T extends string> {
  options: { value: T; label: string; icon?: LucideIcon }[];
  value: T | null;
  onChange: (value: T) => void;
  /** Lay chips out in one scrolling row instead of wrapping. */
  scroll?: boolean;
}

/** Single-select row of chips. */
export function ChipGroup<T extends string>({ options, value, onChange, scroll = false }: ChipGroupProps<T>) {
  const chips = options.map((o) => (
    <Chip key={o.value} label={o.label} icon={o.icon} selected={o.value === value} onPress={() => onChange(o.value)} />
  ));
  return scroll ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips}
    </ScrollView>
  ) : (
    <View style={[styles.row, styles.wrap]}>{chips}</View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.sm },
  wrap: { flexWrap: 'wrap' },
});
