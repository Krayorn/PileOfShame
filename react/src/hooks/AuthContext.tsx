import React, { useState, useCallback, useMemo } from 'react';
import { AuthContext, type AuthInfo } from './auth-types';

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getAuthInfo(token: string | null): AuthInfo {
  if (!token) {
    return { isLoggedIn: false, isAdmin: false, username: null };
  }

  const payload = decodeToken(token);
  if (!payload) {
    return { isLoggedIn: true, isAdmin: false, username: null };
  }

  const roles = Array.isArray(payload.roles) ? payload.roles : [];
  return {
    isLoggedIn: true,
    isAdmin: roles.includes('ROLE_ADMIN'),
    username: (payload.username as string) ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authInfo, setAuthInfo] = useState<AuthInfo>(() =>
    getAuthInfo(localStorage.getItem('token'))
  );

  const login = useCallback((token: string) => {
    localStorage.setItem('token', token);
    setAuthInfo(getAuthInfo(token));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthInfo(getAuthInfo(null));
  }, []);

  const value = useMemo(
    () => ({ ...authInfo, login, logout }),
    [authInfo, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
