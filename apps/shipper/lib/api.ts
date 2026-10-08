import { createApiClient } from "@a2b/api-client";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Set EXPO_PUBLIC_API_URL in apps/shipper/.env. On a physical phone use your
 * computer's LAN address (e.g. http://192.168.1.20:3333); the Android emulator
 * reaches the host at http://10.0.2.2:3333.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333";

export const { api } = createApiClient({
  baseUrl: API_URL,
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    if (useAuthStore.getState().token) useAuthStore.getState().logout();
  },
});
