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
      
      const mockUser = {
        user_id: 'guest-123',
        email: 'guest@adaptcode.com',
        display_name: 'Guest User',
        role: 'student',
        is_pro: false,
        created_at: new Date().toISOString()
      };

      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await fetchApi('/api/auth/me');
          setUser(res.user);
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.setItem('access_token', 'DEV_TOKEN_dev@adaptcode.com');
          setToken('DEV_TOKEN_dev@adaptcode.com');
          setUser(mockUser);
        }
      } else {
        // Automatically log in as guest for local development
        localStorage.setItem('access_token', 'DEV_TOKEN_dev@adaptcode.com');
        setToken('DEV_TOKEN_dev@adaptcode.com');
        setUser(mockUser);
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
