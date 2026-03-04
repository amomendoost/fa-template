// useAuth Hook - OTP authentication with React state
import { useState, useEffect, useCallback } from 'react';
import type { AuthSession, AuthUser } from '@/lib/auth/types';
import {
  getSession,
  requestOtp,
  verifyOtp,
  logout as doLogout,
  onAuthChange,
} from '@/lib/auth/service';

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(getSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthChange(setSession);
  }, []);

  const login = useCallback(async (phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await requestOtp(phone);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطا در ارسال کد';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verify = useCallback(async (phone: string, token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const s = await verifyOtp(phone, token);
      return s;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'کد وارد شده نامعتبر است';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    doLogout();
  }, []);

  return {
    user: session?.user as AuthUser | null,
    session,
    isAuthenticated: session !== null,
    isLoading,
    error,
    login,
    verifyOtp: verify,
    logout,
  };
}

export default useAuth;
