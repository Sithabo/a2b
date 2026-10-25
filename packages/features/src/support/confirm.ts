import { Alert, Platform } from 'react-native';

/**
 * Asks before a destructive or important action. Resolves true if confirmed.
 * React Native's Alert does nothing in a browser, so web uses the browser's dialog.
 */
export function confirmAction({
  title,
  message,
  confirmLabel,
  destructive = false,
}: {
  title: string;
  message?: string;
  confirmLabel: string;
  destructive?: boolean;
}): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.([title, message].filter(Boolean).join('\n\n')) ?? false);
  }
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) })
  );
}

/**
 * Tells the user something (usually that an action failed). Alert does nothing
 * in a browser, so web uses the browser's dialog.
 */
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    globalThis.alert?.([title, message].filter(Boolean).join('\n\n'));
    return;
  }
  Alert.alert(title, message);
}
