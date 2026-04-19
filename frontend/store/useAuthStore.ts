import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  company: string;
  phone: string;
  role: string;
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
        userProfile: { name: 'Demo User', company: '', phone, role: role || 'user' } 
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
