import { createContext } from 'react';

export interface AuthInfo {
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string | null;
}

export interface AuthContextType extends AuthInfo {
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
