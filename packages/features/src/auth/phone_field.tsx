import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MARKET_CODES, markets, type MarketCode } from '@a2b/core';
import { SegmentedControl, spacing, Text, TextField } from '@a2b/ui';

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
      <SegmentedControl
        accessibilityLabel="Country"
        value={market}
        onChange={onMarketChange}
        options={MARKET_CODES.map((code) => ({ value: code, label: `${markets[code].flag} ${markets[code].name}` }))}
      />
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
});
