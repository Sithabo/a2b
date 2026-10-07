import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LucideIcon } from 'lucide-react-native';
import { parsePhone, markets, type MarketCode } from '@a2b/core';
import { apiErrorMessage } from '@a2b/api-client';
import { Badge, Button, colors, layout, radius, spacing, Text } from '@a2b/ui';
import { useAppSession } from '../session/session_context.tsx';
import { PhoneField } from './phone_field.tsx';

export interface PhoneSignInScreenProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Called with the E.164 number once a code has been sent. */
  onCodeSent: (phone: string) => void;
  footer?: React.ReactNode;
}

export function PhoneSignInScreen({ icon: Icon, eyebrow, title, subtitle, onCodeSent, footer }: PhoneSignInScreenProps) {
  const { api } = useAppSession();
  const [market, setMarket] = useState<MarketCode>('UG');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const phone = parsePhone(number, markets[market]);
    if (!phone) {
      setError(`Enter a valid ${markets[market].name} mobile number`);
      return;
    }
    setError('');
    setIsSending(true);
    try {
      const { data } = await api.auth.requestOtp({ body: { phone } });
      onCodeSent(data.phone);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.iconTile}>
              <Icon color={colors.onPrimary} size={32} />
            </View>
            <Badge label={eyebrow} tone="warning" style={{ alignSelf: 'center' }} />
            <Text variant="h1" tone="primary" align="center">
              {title}
            </Text>
            <Text tone="secondary" align="center">
              {subtitle}
            </Text>
          </View>

          <PhoneField
            market={market}
            onMarketChange={(m) => {
              setMarket(m);
              setError('');
            }}
            value={number}
            onChangeText={(v) => {
              setNumber(v);
              setError('');
            }}
            error={error}
          />

          <Button title="Send verification code" onPress={handleSend} loading={isSending} disabled={!number.trim()} />
          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: layout.gutter, gap: spacing['2xl'], flexGrow: 1, justifyContent: 'center' },
  hero: { alignItems: 'center', gap: spacing.md },
  iconTile: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
