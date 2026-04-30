import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';
import type { Admin } from '../types';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  loading: boolean;
  authChecked: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // On mount, restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('gymx_token');
    const stored = localStorage.getItem('gymx_admin');
    if (token && stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        localStorage.removeItem('gymx_token');
        localStorage.removeItem('gymx_admin');
      }
    }
    setAuthChecked(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(email, password);
      localStorage.setItem('gymx_token', data.token);
      localStorage.setItem('gymx_admin', JSON.stringify(data.admin));
      setAdmin(data.admin);
      return { success: true };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid email or password.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gymx_token');
    localStorage.removeItem('gymx_admin');
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin && !!localStorage.getItem('gymx_token'),
        loading,
        authChecked,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
