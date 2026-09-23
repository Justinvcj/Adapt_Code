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
            // Invalid token or server error, log out
            localStorage.removeItem('access_token');
            localStorage.removeItem('cached_user');
            setToken(null);
            setUser(null);
          }
        } catch (error: any) {
          console.error("Failed to fetch user", error);
          if (error?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('cached_user');
            setToken(null);
            setUser(null);
          } else {
            setIsOffline(true);
            // keep existing cached user
          }
        }
      } else {
        // No token, ensure clean state
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

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
