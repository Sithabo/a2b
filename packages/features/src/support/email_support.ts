import { Alert, Linking } from 'react-native';
import { SUPPORT_EMAIL, supportEmailUrl } from '@a2b/core';

/**
 * Opens the phone's email app with a message to A2B support. `context` lines
 * (account, load reference…) go under the message so support can find the
 * account without asking.
 */
export async function emailSupport({ subject, context = [] }: { subject: string; context?: string[] }) {
  const body = context.length ? `\n\n\n—\nPlease keep this so we can find your account:\n${context.join('\n')}` : undefined;
  try {
    await Linking.openURL(supportEmailUrl({ subject, body }));
  } catch {
    Alert.alert('No email app found', `Email us at ${SUPPORT_EMAIL}.`);
  }
}
