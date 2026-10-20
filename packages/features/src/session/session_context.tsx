import React, { createContext, useContext, useEffect, useRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppSession } from './create_app_session.ts';

const SessionContext = createContext<AppSession | null>(null);

const PROFILE_RETRY_MS = 5_000;

export interface AppSessionProviderProps {
  session: AppSession;
  /**
   * Called when a session ends while the app is open: the user signed out, or
   * the API rejected the token. Send them back to the entry route here.
   */
  onSignedOut?: () => void;
  children: React.ReactNode;
}

/** Provides the app's session (and its query client) to shared screens and hooks. */
export function AppSessionProvider({ session, onSignedOut, children }: AppSessionProviderProps) {
  const token = session.useSession((state) => state.token);
  const onSignedOutRef = useRef(onSignedOut);
  onSignedOutRef.current = onSignedOut;

  useEffect(() => {
    session.useSession.getState().hydrate();
  }, [session]);

  useEffect(
    () =>
      session.useSession.subscribe((state, previous) => {
        if (previous.token && !state.token) onSignedOutRef.current?.();
      }),
    [session]
  );

  // Refresh the profile whenever a session becomes available. Offline keeps the
  // cached one; with no cache at all, keep trying (a 401 signs out instead).
  useEffect(() => {
    if (!token) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const refresh = () =>
      session.refreshUser().catch(() => {
        if (!cancelled && !session.useSession.getState().user) timer = setTimeout(refresh, PROFILE_RETRY_MS);
      });
    refresh();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token, session]);

  return (
    <SessionContext.Provider value={session}>
      <QueryClientProvider client={session.queryClient}>{children}</QueryClientProvider>
    </SessionContext.Provider>
  );
}

export function useAppSession(): AppSession {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useAppSession must be used inside <AppSessionProvider>');
  return session;
}

/**
 * Where the app should send the user, from the stored session:
 * - `loading`: still reading storage, or signed in but the profile hasn't loaded yet
 * - `onboarding`: first launch, signed out
 * - `signed-out`: seen onboarding, needs to sign in
 * - `signed-in`: has a token and a profile (`user` is set)
 *
 * Signed-in users never see onboarding again, even on a fresh install.
 */
export type SessionGate = 'loading' | 'onboarding' | 'signed-out' | 'signed-in';

export function useSessionGate(): SessionGate {
  const { useSession } = useAppSession();
  return useSession((s) => {
    if (!s.isHydrated) return 'loading';
    if (s.token) return s.user ? 'signed-in' : 'loading';
    return s.hasCompletedOnboarding ? 'signed-out' : 'onboarding';
  });
}
