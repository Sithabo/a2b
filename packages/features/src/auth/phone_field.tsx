import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MARKET_CODES, markets, type MarketCode } from '@a2b/core';
import { colors, radius, spacing, Text, TextField } from '@a2b/ui';

export interface PhoneFieldProps {
  market: MarketCode;
  onMarketChange: (market: MarketCode) => void;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}

/** National number input with a Guyana / Uganda switch (A2B's only markets). */
export function PhoneField({ market, onMarketChange, value, onChangeText, error }: PhoneFieldProps) {
  const m = markets[market];
  return (
    <View style={styles.wrapper}>
      <View style={styles.switcher} accessibilityRole="radiogroup">
        {MARKET_CODES.map((code) => {
          const active = code === market;
          return (
            <Pressable
              key={code}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => onMarketChange(code)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text variant="bodyStrong" color={active ? colors.onPrimary : colors.text}>
                {markets[code].flag} {markets[code].name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <TextField
        label="Mobile number"
        value={value}
        onChangeText={onChangeText}
        placeholder={m.phone.example}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        error={error}
        leading={
          <Text variant="bodyStrong" tone="secondary">
            {m.phone.callingCode}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.lg },
  switcher: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});
