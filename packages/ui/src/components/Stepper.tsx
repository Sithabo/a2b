import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { colors } from '../tokens/colors.ts';
import { radius, spacing } from '../tokens/layout.ts';
import { IconButton } from './IconButton.tsx';
import { Text } from './Text.tsx';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  format?: (value: number) => string;
}

export function Stepper({ value, onChange, step = 1, min = 0, max = Infinity, unit, format }: StepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n * 10) / 10));
  return (
    <View style={styles.container}>
      <IconButton icon={Minus} accessibilityLabel="Decrease" onPress={() => onChange(clamp(value - step))} size={48} />
      <View style={styles.value}>
        <Text variant="display">{format ? format(value) : value}</Text>
        {unit && (
          <Text variant="h3" tone="secondary">
            {unit}
          </Text>
        )}
      </View>
      <IconButton icon={Plus} accessibilityLabel="Increase" onPress={() => onChange(clamp(value + step))} size={48} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
  },
  value: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
});
