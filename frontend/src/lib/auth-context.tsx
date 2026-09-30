"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from './api';
import { supabase } from './supabase';

type User = {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  is_pro: boolean;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isOffline: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check Supabase session first (for Google Auth)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        handleSupabaseSession(session);
        setIsLoading(false);
        return;
      }

      // 2. Fallback to our custom email/password token
      const storedToken = localStorage.getItem('access_token');
      const cachedUser = localStorage.getItem('cached_user');
      
      if (storedToken) {
        setToken(storedToken);
        if (cachedUser) {
          try { setUser(JSON.parse(cachedUser)); } catch (e) { /* ignore */ }
        }
        
        try {
          const res = await fetchApi('/api/auth/me');
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('cached_user', JSON.stringify(res.user));
            setIsOffline(false);
          } else {
            clearAuth();
          }
        } catch (error: any) {
          if (error?.status === 401) {
            clearAuth();
          } else {
            setIsOffline(true);
          }
        }
      } else {
        clearAuth();
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for Google Auth redirects!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        handleSupabaseSession(session);
      } else if (event === 'SIGNED_OUT') {
        clearAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSupabaseSession = (session: any) => {
    const userData: User = {
      user_id: session.user.id,
      email: session.user.email,
      display_name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
      role: 'student',
      is_pro: false,
      created_at: session.user.created_at
    };
    login(session.access_token, userData);
  };

  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('cached_user');
    setToken(null);
    setUser(null);
  };

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('cached_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('cached_user');
      setToken(null);
      setUser(null);
      window.location.assign('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isOffline, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
