'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from './axios';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('lms_token');
      if (token) {
        try {
          const decoded = jwtDecode(token) as any;
          if (decoded.exp * 1000 < Date.now()) {
            throw new Error('Token expired');
          }
          
          // Optionally fetch fresh user data
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        } catch (error) {
          console.error('Auth initialization failed', error);
          localStorage.removeItem('lms_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('lms_token', token);
    document.cookie = `lms_token=${token}; path=/; max-age=604800`; // 7 days
    setUser(user);
    if (user.role === 'borrower') {
      router.push('/apply');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    document.cookie = 'lms_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
