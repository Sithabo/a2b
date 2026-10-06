import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { marketFromPhone, type MarketCode } from '@a2b/core';

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

interface AuthState {
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  userProfile: UserProfile | null;
  login: (phone: string, role?: string) => void;
  signUp: (profile: UserProfile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      hasCompletedOnboarding: false,
      userProfile: null,
      login: (phone, role) => set({ 
        isLoggedIn: true, 
        userProfile: { name: 'Demo User', company: '', phone, role: role || 'user', market: marketFromPhone(phone) } 
      }),
      signUp: (profile) => set({ 
        isLoggedIn: true, 
        userProfile: profile,
        hasCompletedOnboarding: true 
      }),
      logout: () => set({ isLoggedIn: false, userProfile: null }),
      updateProfile: (updates) => set((state) => ({
        userProfile: state.userProfile ? { ...state.userProfile, ...updates } : null
      })),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
