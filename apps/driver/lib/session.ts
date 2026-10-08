import { createAppSession } from "@a2b/features";

/**
 * Set EXPO_PUBLIC_API_URL in apps/driver/.env. On a physical phone use your
 * computer's LAN address; on the Android emulator run `adb reverse tcp:3333 tcp:3333`.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333";

export const session = createAppSession({ appId: "driver", role: "driver", apiUrl: API_URL });

export const { api, useSession, queryClient } = session;
