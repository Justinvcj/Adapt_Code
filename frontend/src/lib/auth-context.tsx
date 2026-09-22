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
  login: (token: string, userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await fetchApi('/api/auth/me');
          if (res && res.user) {
            setUser(res.user);
          } else {
            // Invalid token or server error, log out
            localStorage.removeItem('access_token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          // If offline, we could theoretically keep the token but clear the user so they re-login,
          // but for security we should probably clear it or handle it gracefully.
          // For now, if fetch fails (e.g. backend down), we set user to null so they are routed out.
          setUser(null);
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
      setToken(null);
      setUser(null);
      window.location.assign('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
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
