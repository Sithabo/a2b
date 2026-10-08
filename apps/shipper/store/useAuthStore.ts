import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MarketCode } from '@a2b/core';
import type { Data } from '@a2b/api-client';
import { tokenStorage } from '@/lib/tokenStorage';
import { queryClient } from '@/lib/queryClient';

/** The shape screens read; derived from the API user. */
export interface UserProfile {
  name: string;
  company: string;
  phone: string;
  role: string;
  /** GY or UG — drives currency, phone format, tax ID and customs documents. */
  market?: MarketCode;
  region?: string;
  email?: string;
  profileImage?: string;
  is_importer?: boolean;
  tin?: string | null;
}

function toUserProfile(user: Data.User, profileImage?: string): UserProfile {
  const shipper = user.shipperProfile;
  return {
    name: user.fullName ?? shipper?.companyName ?? '',
    company: shipper?.companyName ?? '',
    phone: user.phone,
    role: user.role,
    market: user.market,
    region: shipper?.region ?? undefined,
    email: user.email ?? undefined,
    profileImage,
    is_importer: shipper?.isImporter ?? false,
    tin: shipper?.taxId ?? null,
  };
}

interface AuthState {
  hasCompletedOnboarding: boolean;
  /** Set once the stored token has been read at startup. */
  isHydrated: boolean;
  /** In memory only; persisted in the secure store, never AsyncStorage. */
  token: string | null;
  isLoggedIn: boolean;
  user: Data.User | null;
  userProfile: UserProfile | null;
  /** Local-only avatar (image upload isn't on the API yet). */
  profileImage?: string;

  hydrate: () => Promise<void>;
  setSession: (token: string, user: Data.User) => Promise<void>;
  setUser: (user: Data.User) => void;
  setProfileImage: (uri: string | undefined) => void;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      isHydrated: false,
      token: null,
      isLoggedIn: false,
      user: null,
      userProfile: null,
      profileImage: undefined,

      hydrate: async () => {
        const token = await tokenStorage.get();
        set({ token, isLoggedIn: !!token && !!get().user, isHydrated: true });
      },
      setSession: async (token, user) => {
        await tokenStorage.set(token);
        set({ token, user, isLoggedIn: true, userProfile: toUserProfile(user, get().profileImage) });
      },
      setUser: (user) => set({ user, userProfile: toUserProfile(user, get().profileImage) }),
      setProfileImage: (profileImage) =>
        set((state) => ({
          profileImage,
          userProfile: state.userProfile ? { ...state.userProfile, profileImage } : null,
        })),
      logout: async () => {
        await tokenStorage.clear();
        queryClient.clear();
        set({ token: null, user: null, userProfile: null, isLoggedIn: false });
      },
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // The token lives in the secure store; everything else here is a display cache.
      partialize: ({ hasCompletedOnboarding, user, userProfile, profileImage }) => ({
        hasCompletedOnboarding,
        user,
        userProfile,
        profileImage,
      }),
      // v0 held a mock, offline-only session; drop it so users sign in against the API.
      migrate: (persisted: any, version) =>
        version < 1 ? { hasCompletedOnboarding: persisted?.hasCompletedOnboarding ?? false } : persisted,
    }
  )
);
