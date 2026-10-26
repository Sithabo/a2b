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
  /** API path of the profile photo (show it with `Avatar`/`AuthImage`), or null. */
  avatarPath: string | null;
  isImporter?: boolean;
  tin?: string | null;
}

export function toUserProfile(user: Data.User): UserProfile {
  const shipper = user.shipperProfile;
  return {
    name: user.fullName ?? shipper?.companyName ?? '',
    company: shipper?.companyName ?? '',
    phone: user.phone,
    role: user.role,
    market: user.market,
    region: shipper?.region ?? undefined,
    email: user.email ?? undefined,
    avatarPath: user.avatarPath,
    isImporter: shipper?.isImporter ?? false,
    tin: shipper?.taxId ?? null,
  };
}

/** The signed-in shipper's profile, or null when signed out. */
export function useUserProfile(): UserProfile | null {
  const user = useSession((s) => s.user);
  return user ? toUserProfile(user) : null;
}
