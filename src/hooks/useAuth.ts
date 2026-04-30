import { useState, useCallback } from 'react';
import { authAPI } from '../services/api';
import type { Admin } from '../types';

const getStoredAdmin = (): Admin | null => {
  try {
    const stored = localStorage.getItem('gymx_admin');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(getStoredAdmin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!localStorage.getItem('gymx_token') && !!admin;

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.login(email, password);
      localStorage.setItem('gymx_token', data.token);
      localStorage.setItem('gymx_admin', JSON.stringify(data.admin));
      setAdmin(data.admin);
      return { success: true };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please try again.';
      setError(msg);
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

  return { admin, isAuthenticated, loading, error, login, logout };
};
