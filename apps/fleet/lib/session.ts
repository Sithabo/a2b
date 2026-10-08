import { createAppSession } from "@a2b/features";

/**
 * Set EXPO_PUBLIC_API_URL in apps/fleet/.env. On a physical phone use your
 * computer's LAN address; on the Android emulator run `adb reverse tcp:3333 tcp:3333`.
 */
export const session = createAppSession({
  appId: "fleet",
  role: "fleet_owner",
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333",
});

export const { api, useSession, queryClient } = session;
