/**
 * Gestión de Sesión
 * Funciones para manejar sesiones en el cliente
 */

import { Session } from './types/user';

const SESSION_KEY = 'app_session';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

/**
 * Interface de Sesión para tipado
 */
export interface SessionPayload {
  sessionId: string;
  userId: string;
  userName: string;
  email?: string;
  role: 'admin' | 'manager' | 'employee' | 'owner';
  isManager: boolean;
  permissions: string[];
  createdAt: string;
  lastActivityAt: string;
  rotatedAt: string;
  expiresAt: string;
}

/**
 * Codifica los datos de sesión en formato Base64 para la cookie
 */
export function setSessionCookie(sessionData: {
  userId: string;
  userName: string;
  role: 'admin' | 'manager' | 'employee' | 'owner';
  isManager: boolean;
}): string {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 horas

  const payload: SessionPayload = {
    sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: sessionData.userId,
    userName: sessionData.userName,
    role: sessionData.role,
    isManager: sessionData.isManager,
    permissions: [],
    createdAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
    rotatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Codificar en Base64
  return btoa(JSON.stringify(payload));
}

/**
 * Decodifica la cookie de sesión
 */
export function parseSessionCookie(cookieValue: string): SessionPayload | null {
  try {
    const json = atob(cookieValue);
    const session = JSON.parse(json) as SessionPayload;
    return session;
  } catch {
    return null;
  }
}

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

/**
 * Obtiene la sesión desde sessionStorage (lado del cliente)
 */
export function getSession(): Session | null {
  return sessionManager.getSession();
}

/**
 * Establece la sesión en sessionStorage (lado del cliente)
 */
export function setSession(session: Session): void {
  return sessionManager.setSession(session);
}

/**
 * Limpia la sesión (logout)
 */
export function logout(): void {
  return sessionManager.clearSession();
}

/**
 * Extiende el TTL de una sesión en 4 horas
 * Usado por refresh-session para renovar la cookie sin re-autenticación
 */
export function extendSessionCookie(session: SessionPayload): string {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 horas

  const extendedSession: SessionPayload = {
    ...session,
    lastActivityAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Codificar en Base64
  return btoa(JSON.stringify(extendedSession));
}

/**
 * Registra una sesión activa (para auditoría)
 * En futuro puede conectarse a base de datos de sesiones
 */
export function trackActiveSession(session: SessionPayload): void {
  // Actualmente es un no-op en producción
  // En futuro: registrar en base de datos o cache (Redis)
  console.log(`[Session] Sesión activa tracked para usuario: ${session.userId}, expira en: ${session.expiresAt}`);
}

// Exportar tipo Session para uso en otros archivos
export type { Session };
