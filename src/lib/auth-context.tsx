'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import Cookies from 'js-cookie';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  isAdmin: boolean;
  isPakhshManager: boolean;
  updateProfile: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is stored in cookies
    const storedUser = Cookies.get('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        setUser(result.user);
        Cookies.set('user', JSON.stringify(result.user), { expires: 1 });
        return { success: true, user: result.user };
      } else {
        console.error('Login failed:', result.error);
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('user');
  };

  const updateProfile = (updatedUser: Partial<User>) => {
    setUser(prevUser => {
      if (prevUser) {
        const newUser = { ...prevUser, ...updatedUser };
        Cookies.set('user', JSON.stringify(newUser), { expires: 1 });
        return newUser;
      }
      return null;
    });
  };

  const isAdmin = user?.isAdmin || false;
  const isPakhshManager = user?.isPakhshManager || false;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isPakhshManager, updateProfile }}>
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
