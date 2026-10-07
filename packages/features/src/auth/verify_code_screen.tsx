import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { apiErrorMessage, type Data } from '@a2b/api-client';
import { Button, colors, IconButton, layout, spacing, Text } from '@a2b/ui';
import { useAppSession } from '../session/session_context.tsx';
import { CodeInput } from './code_input.tsx';

const RESEND_AFTER_SECONDS = 30;

export interface VerifyCodeScreenProps {
  phone: string;
  onBack: () => void;
  /** Signed in; `user` includes profiles (fetched from /me). */
  onVerified: (user: Data.User) => void;
}

/** Verifies the SMS code and signs in as this app's role. */
export function VerifyCodeScreen({ phone, onBack, onVerified }: VerifyCodeScreenProps) {
  const { api, role, useSession, refreshUser } = useAppSession();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_AFTER_SECONDS);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const verify = async (value: string) => {
    setError('');
    setIsVerifying(true);
    try {
      const { data } = await api.auth.verifyOtp({ body: { phone, code: value, role } });
      if (data.user.role !== role) {
        setError(
          `This number is registered as a ${data.user.role.replace('_', ' ')} account. Use the matching A2B app to sign in.`
        );
        return;
      }
      await useSession.getState().setSession(data.token, data.user);
      onVerified(await refreshUser());
    } catch (err) {
      setError(apiErrorMessage(err));
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (value: string) => {
    setCode(value);
    setError('');
    if (value.length === 6) verify(value);
  };

  const handleResend = async () => {
    setError('');
    try {
      await api.auth.requestOtp({ body: { phone } });
      setNotice('A new code is on its way.');
      setResendIn(RESEND_AFTER_SECONDS);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <IconButton icon={ArrowLeft} onPress={onBack} accessibilityLabel="Change number" />
          <View style={styles.header}>
            <Text variant="h1" tone="primary">
              Enter your code
            </Text>
            <Text tone="secondary">We sent a 6-digit code by SMS to {phone}.</Text>
          </View>

          <CodeInput value={code} onChange={handleChange} hasError={!!error} />
          {error ? <Text tone="danger">{error}</Text> : null}
          {notice && !error ? <Text tone="secondary">{notice}</Text> : null}
          {__DEV__ && (
            <Text variant="caption" tone="muted">
              Dev: codes are printed in the API log. Test numbers (+256 700 000 001, +592 600 0001) use 123456.
            </Text>
          )}

          <Button title="Verify & continue" onPress={() => verify(code)} loading={isVerifying} disabled={code.length < 6} />
          <Button
            title={resendIn > 0 ? `Resend code in 0:${String(resendIn).padStart(2, '0')}` : 'Resend code'}
            variant="ghost"
            size="md"
            onPress={handleResend}
            disabled={resendIn > 0}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: layout.gutter, gap: spacing.xl },
  header: { gap: spacing.sm },
});
