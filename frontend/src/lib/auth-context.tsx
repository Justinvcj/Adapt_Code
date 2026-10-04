"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authAPI, type ApiUser, ApiError, ApiOffline, API_ENABLED } from './api';

type Status = 'loading' | 'authed' | 'anonymous' | 'offline';

type AuthValue = {
  status: Status;
  user: ApiUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
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

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    await authAPI.register(email, password, displayName);
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
