"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authAPI, type ApiUser, ApiError, ApiOffline, API_ENABLED } from './api';

type Status = 'loading' | 'authed' | 'anonymous' | 'offline';

type AuthValue = {
  status: Status;
  user: ApiUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string, turnstileToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [status, setStatus] = useState<Status>(API_ENABLED ? 'loading' : 'offline');

  const refresh = useCallback(async () => {
    if (!API_ENABLED) { setStatus('offline'); return; }
    try {
      const { user } = await authAPI.me();
      setUser(user);
      setStatus('authed');
    } catch (e) {
      setUser(null);
      if (e instanceof ApiOffline) setStatus('offline');
      else setStatus('anonymous');
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    await authAPI.login(email, password);
    await refresh();
  }, [refresh]);

  const register = useCallback(async (email: string, password: string, displayName?: string, turnstileToken?: string) => {
    await authAPI.register(email, password, displayName, turnstileToken);
    // /api/auth/register never sets the session cookie (it only creates the
    // Supabase user), so without this we'd leave the user in an anonymous
    // state after a successful sign-up. When "Confirm email" is disabled in
    // Supabase, the follow-up login mints the cookie and we're signed in.
    // When it's enabled, login legitimately 401s; we swallow it so the
    // register-then-"check your email" flow still works end-to-end.
    try {
      await authAPI.login(email, password);
    } catch { /* confirmation required or similar — handled by the caller */ }
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* best-effort */ }
    setUser(null);
    setStatus('anonymous');
  }, []);

  return (
    <AuthCtx.Provider value={{ status, user, login, register, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthValue {
  const v = useContext(AuthCtx);
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>');
  return v;
}

export { ApiError, ApiOffline };
