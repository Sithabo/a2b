import React, { createContext, useContext, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppSession } from './create_app_session.ts';

const SessionContext = createContext<AppSession | null>(null);

/** Provides the app's session (and its query client) to shared screens and hooks. */
export function AppSessionProvider({ session, children }: { session: AppSession; children: React.ReactNode }) {
  const token = session.useSession((state) => state.token);

  useEffect(() => {
    session.useSession.getState().hydrate();
  }, [session]);

  // Refresh the cached profile whenever a session becomes available.
  useEffect(() => {
    if (token) session.refreshUser().catch(() => {}); // offline keeps the cache; 401 signs out
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
