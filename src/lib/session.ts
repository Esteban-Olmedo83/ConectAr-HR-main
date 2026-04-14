/**
 * Gestión de Sesión
 * Funciones para manejar sesiones en el cliente
 */

import { Session } from './types/user';

const SESSION_KEY = 'app_session';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export const sessionManager = {
  getSession(): Session | null {
    if (typeof window === 'undefined') return null;

    try {
      const sessionData = sessionStorage.getItem(SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  },

  setSession(session: Session): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error guardando sesión:', error);
    }
  },

  clearSession(): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  },

  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return sessionStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return sessionStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error guardando refresh token:', error);
    }
  },

  isTokenExpired(): boolean {
    const session = this.getSession();
    if (!session) return true;

    const expiresAt = new Date(session.expiresAt);
    return expiresAt < new Date();
  },

  isSessionValid(): boolean {
    return !!this.getSession() && !this.isTokenExpired();
  },

  getTimeUntilExpiration(): number {
    const session = this.getSession();
    if (!session) return 0;

    const expiresAt = new Date(session.expiresAt).getTime();
    const now = new Date().getTime();
    
    return Math.max(0, expiresAt - now);
  },
};
