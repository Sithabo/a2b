import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** Access token in the OS keychain/keystore (localStorage on web, where SecureStore is unavailable). */
export function createTokenStorage(key: string) {
  return {
    async get(): Promise<string | null> {
      if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null;
      return SecureStore.getItemAsync(key);
    },
    async set(token: string) {
      if (Platform.OS === 'web') return globalThis.localStorage?.setItem(key, token);
      await SecureStore.setItemAsync(key, token);
    },
    async clear() {
      if (Platform.OS === 'web') return globalThis.localStorage?.removeItem(key);
      await SecureStore.deleteItemAsync(key);
    },
  };
}
