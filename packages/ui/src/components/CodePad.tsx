import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Delete } from 'lucide-react-native';
import { colors, palette } from '../tokens/colors.ts';
import { radius, spacing } from '../tokens/layout.ts';
import { Text } from './Text.tsx';

export interface CodePadProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  hasError?: boolean;
  disabled?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'] as const;

/** Big on-screen keypad with code slots — for entering a release code one-handed. */
export function CodePad({ value, onChange, length = 6, hasError = false, disabled = false }: CodePadProps) {
  const press = (key: (typeof KEYS)[number]) => {
    if (disabled) return;
    if (key === 'clear') return onChange('');
    if (key === 'back') return onChange(value.slice(0, -1));
    if (value.length < length) onChange(value + key);
  };

  return (
    <View style={styles.container}>
      <View style={styles.slots} accessibilityLabel={`Code, ${value.length} of ${length} digits entered`}>
        {Array.from({ length }, (_, i) => (
          <View key={i} style={[styles.slot, i === value.length && styles.slotActive, hasError && styles.slotError]}>
            <Text variant="h1">{value[i] ?? ''}</Text>
          </View>
        ))}
      </View>
      <View style={styles.grid}>
        {KEYS.map((key) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={key === 'back' ? 'Delete' : key === 'clear' ? 'Clear' : key}
            onPress={() => press(key)}
            style={({ pressed }) => [styles.key, key.length > 1 && styles.keyAlt, pressed && styles.keyPressed]}
          >
            {key === 'back' ? (
              <Delete color={colors.text} size={26} />
            ) : (
              <Text variant={key === 'clear' ? 'label' : 'h1'}>{key === 'clear' ? 'Clear' : key}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl },
  slots: { flexDirection: 'row', justifyContent: 'space-between' },
  slot: {
    width: 48,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: { borderColor: colors.primary, borderWidth: 2 },
  slotError: { borderColor: colors.danger },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  key: {
    width: '31.5%',
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyAlt: { backgroundColor: palette.gray[100] },
  keyPressed: { backgroundColor: colors.primaryMuted },
});
