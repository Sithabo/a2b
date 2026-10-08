import React, { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, spacing, Text } from '@a2b/ui';

/** Six boxes over one hidden input, so paste and SMS autofill still work. */
export function CodeInput({
  value,
  onChange,
  length = 6,
  hasError = false,
}: {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  hasError?: boolean;
}) {
  const input = useRef<TextInput>(null);
  return (
    <Pressable onPress={() => input.current?.focus()} accessibilityLabel="Verification code">
      <View style={styles.row}>
        {Array.from({ length }, (_, i) => {
          const active = i === value.length;
          return (
            <View
              key={i}
              style={[styles.box, active && styles.boxActive, hasError && styles.boxError]}
            >
              <Text variant="h1">{value[i] ?? ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus
        maxLength={length}
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  box: {
    // Fixed size: flex-based sizing collapsed inside the pressable wrapper on Android.
    width: 48,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  boxActive: { borderColor: colors.primary, borderWidth: 2 },
  boxError: { borderColor: colors.danger },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
