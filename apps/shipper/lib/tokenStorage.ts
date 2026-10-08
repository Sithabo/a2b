import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "a2b.accessToken";

/** Access token in the OS keychain/keystore (localStorage on web, where SecureStore is unavailable). */
export const tokenStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === "web") return globalThis.localStorage?.getItem(KEY) ?? null;
    return SecureStore.getItemAsync(KEY);
  },
  async set(token: string) {
    if (Platform.OS === "web") return globalThis.localStorage?.setItem(KEY, token);
    await SecureStore.setItemAsync(KEY, token);
  },
  async clear() {
    if (Platform.OS === "web") return globalThis.localStorage?.removeItem(KEY);
    await SecureStore.deleteItemAsync(KEY);
  },
};
