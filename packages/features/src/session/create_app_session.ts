import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { QueryClient } from '@tanstack/react-query';
import { createApiClient, type Data } from '@a2b/api-client';
import type { UserRole } from '@a2b/core';
import { createTokenStorage } from './token_storage.ts';

export interface SessionState {
  hasCompletedOnboarding: boolean;
  /** True once both the stored token and the cached profile have been read at startup. */
  isHydrated: boolean;
  /** In memory only; persisted in the secure store, never AsyncStorage. */
  token: string | null;
  /** Cached profile; refreshed from /me whenever there's a token. */
  user: Data.User | null;
  /** Always `!!token`: having a token is what being signed in means. */
  isSignedIn: boolean;

  hydrate: () => Promise<void>;
  setSession: (token: string, user: Data.User) => Promise<void>;
  setUser: (user: Data.User) => void;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
}

/** A file picked on the device: a camera photo, library image or document. */
export interface UploadFile {
  uri: string;
  name: string;
  mimeType?: string;
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
      (set) => ({
        hasCompletedOnboarding: false,
        isHydrated: false,
        token: null,
        user: null,
        isSignedIn: false,

        hydrate: async () => {
          // The token (secure store) and the cached profile (AsyncStorage) load
          // separately; read both before anything routes on them.
          const [token] = await Promise.all([tokenStorage.get(), persistHydrated()]);
          set({ token, isSignedIn: !!token, isHydrated: true });
        },
        setSession: async (token, user) => {
          await tokenStorage.set(token);
          // Anyone who has signed in has been through onboarding.
          set({ token, user, isSignedIn: true, hasCompletedOnboarding: true });
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

  /** Resolves once hydrate() has run (token and profile both read). */
  function sessionHydrated() {
    return new Promise<void>((resolve) => {
      const unsubscribe = useSession.subscribe((state) => {
        if (state.isHydrated) {
          unsubscribe();
          resolve();
        }
      });
    });
  }

  /** Resolves once the persisted part of the store (profile, onboarding) has loaded. */
  function persistHydrated() {
    if (useSession.persist.hasHydrated()) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const unsubscribe = useSession.persist.onFinishHydration(() => {
        unsubscribe();
        resolve();
      });
    });
  }

  const { api } = createApiClient({
    baseUrl: apiUrl,
    // Screens opened from a deep link can query before startup has read the
    // stored token; hold those requests until it has, rather than send them bare.
    getToken: async () => {
      if (!useSession.getState().isHydrated) await sessionHydrated();
      return useSession.getState().token;
    },
    // Only a rejection of the token we hold now ends the session; a 401 for an
    // older or missing token (e.g. a request that raced sign-in) is ignored.
    onUnauthorized: (rejectedToken) => {
      const { token, signOut } = useSession.getState();
      if (token && rejectedToken === token) signOut();
    },
  });

  /**
   * Uploads a file (camera photo, picked image or PDF) as multipart form data,
   * with the session's token. The typed client can't send React Native file
   * objects, so uploads go through here; failures throw the same shape as the
   * typed client, so `apiErrorMessage` works on them.
   */
  async function upload<T = unknown>(
    path: string,
    fields: Record<string, string>,
    file: UploadFile
  ): Promise<T> {
    if (!useSession.getState().isHydrated) await sessionHydrated();
    const token = useSession.getState().token;

    const form = new FormData();
    for (const [name, value] of Object.entries(fields)) form.append(name, value);
    const type = file.mimeType ?? 'image/jpeg';
    if (Platform.OS === 'web') {
      // Browsers give a blob:/data: URL; send the actual bytes
      form.append('file', await (await fetch(file.uri)).blob(), file.name);
    } else {
      form.append('file', { uri: file.uri, name: file.name, type } as unknown as Blob);
    }

    const response = await fetch(`${apiUrl}/api/v1/${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: form,
    });
    if (response.status === 401 && token && token === useSession.getState().token) {
      await useSession.getState().signOut();
    }
    const body = await response.json().catch(() => undefined);
    if (!response.ok) throw { response: body };
    return body as T;
  }

  /** Fetches /me into the session (call after sign-in and on app start). */
  async function refreshUser() {
    const { data } = await api.me.show({});
    useSession.getState().setUser(data);
    return data;
  }

  return { role, api, queryClient, useSession, refreshUser, upload };
}

export type AppSession = ReturnType<typeof createAppSession>;
