import { useMemo } from 'react';

interface AuthInfo {
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string | null;
}

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

export function useAuth(): AuthInfo {
  return useMemo(() => {
    const token = localStorage.getItem('token');
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
  }, []);
}
