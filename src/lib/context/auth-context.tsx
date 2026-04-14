/**
 * Contexto de Autenticación
 * Gestiona el estado de autenticación global
 */

'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import { User, Session } from '../types/user';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentSession = authService.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch {
          // Si no puede obtener el usuario actual, limpiar sesión
          authService.clearSession();
          setUser(null);
          setSession(null);
        }
      }
    } catch (error) {
      console.error('Error cargando sesión:', error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      authService.setSession(response);
      setUser(response.user);
      setSession(response.session);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      if (authService.isTokenExpired()) {
        const response = await authService.refreshToken();
        authService.setSession(response);
        setUser(response.user);
        setSession(response.session);
      }
    } catch {
      await logout();
    }
  }, [logout]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
