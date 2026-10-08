import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createApiClient, type Data } from '@a2b/api-client';
import type { UserRole } from '@a2b/core';
import { createTokenStorage } from './token_storage.ts';

export interface SessionState {
  hasCompletedOnboarding: boolean;
  /** True once the stored token has been read at startup. */
  isHydrated: boolean;
  /** In memory only; persisted in the secure store, never AsyncStorage. */
  token: string | null;
  user: Data.User | null;
  isSignedIn: boolean;

  hydrate: () => Promise<void>;
  setSession: (token: string, user: Data.User) => Promise<void>;
  setUser: (user: Data.User) => void;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
}

export interface AppSessionConfig {
  /** Distinguishes each app's stored session, e.g. "fleet". */
  appId: string;
  /** The role this app signs people in as. */
  role: Exclude<UserRole, 'admin'>;
  apiUrl: string;
}

/**
 * One call gives an app its session store, typed API client and query cache,
 * wired together: requests carry the token, a 401 signs out, signing out
 * clears cached data.
 */
export function createAppSession({ appId, role, apiUrl }: AppSessionConfig) {
  const tokenStorage = createTokenStorage(`a2b.${appId}.accessToken`);
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, retry: 1 } } });

  const useSession = create<SessionState>()(
    persist(
      (set, get) => ({
        hasCompletedOnboarding: false,
        isHydrated: false,
        token: null,
        user: null,
        isSignedIn: false,

        hydrate: async () => {
          const token = await tokenStorage.get();
          set({ token, isSignedIn: !!token && !!get().user, isHydrated: true });
        },
        setSession: async (token, user) => {
          await tokenStorage.set(token);
          set({ token, user, isSignedIn: true });
        },
        setUser: (user) => set({ user }),
        signOut: async () => {
          await tokenStorage.clear();
          queryClient.clear();
          set({ token: null, user: null, isSignedIn: false });
        },
        completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      }),
      {
        name: `a2b.${appId}.session`,
        storage: createJSONStorage(() => AsyncStorage),
        // Display cache only; the token stays in the secure store.
        partialize: ({ hasCompletedOnboarding, user }) => ({ hasCompletedOnboarding, user }),
      }
    )
  );

  const { api } = createApiClient({
    baseUrl: apiUrl,
    getToken: () => useSession.getState().token,
    onUnauthorized: () => {
      if (useSession.getState().token) useSession.getState().signOut();
    },
  });

  /** Fetches /me into the session (call after sign-in and on app start). */
  async function refreshUser() {
    const { data } = await api.me.show({});
    useSession.getState().setUser(data);
    return data;
  }

  return { role, api, queryClient, useSession, refreshUser };
}

export type AppSession = ReturnType<typeof createAppSession>;
