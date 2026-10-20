import { Platform } from "react-native";
import { createAppSession } from "@a2b/features";

/**
 * Set EXPO_PUBLIC_API_URL in apps/fleet/.env. On a physical phone use your
 * computer's LAN address; on the Android emulator run `adb reverse tcp:3333 tcp:3333`.
 */
export const API_URL =
  Platform.OS === "web"
    ? // The emulator/LAN address in .env isn't reachable from a browser
      (process.env.EXPO_PUBLIC_WEB_API_URL ?? "http://localhost:3333")
    : (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333");

export const session = createAppSession({ appId: "fleet", role: "fleet_owner", apiUrl: API_URL });

export const { api, useSession, queryClient } = session;
