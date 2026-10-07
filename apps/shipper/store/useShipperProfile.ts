import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MarketCode } from '@a2b/core';
import type { Data } from '@a2b/api-client';
import { useSession } from '@/lib/session';

/** The flattened profile shape the shipper's screens read; derived from the API user. */
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

/** Local-only avatar until the API supports image uploads. */
export const useProfileImage = create<{ uri?: string; set: (uri?: string) => void }>()(
  persist((set) => ({ uri: undefined, set: (uri) => set({ uri }) }), {
    name: 'a2b.shipper.profileImage',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: ({ uri }) => ({ uri }),
  })
);

export function toUserProfile(user: Data.User, profileImage?: string): UserProfile {
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

/** The signed-in shipper's profile, or null when signed out. */
export function useUserProfile(): UserProfile | null {
  const user = useSession((s) => s.user);
  const image = useProfileImage((s) => s.uri);
  return user ? toUserProfile(user, image) : null;
}
