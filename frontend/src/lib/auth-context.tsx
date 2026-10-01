"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from './api';

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
  isLoading: boolean;
  isOffline: boolean;
  login: (userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetchApi('/api/auth/me');
        if (res && res.user) {
          setUser(res.user);
          setIsOffline(false);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        if (error?.status === 401) {
          setUser(null);
        } else {
          setIsOffline(true);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      window.location.assign('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isOffline, login, logout }}>
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
