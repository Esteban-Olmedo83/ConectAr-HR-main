/**
 * Hook de Sesión
 * Proporciona acceso a datos de sesión del usuario
 */

'use client';

import { useCallback } from 'react';
import { authService } from '../lib/services/auth';
import { Session } from '../lib/types/user';

export function useSession() {
  const getSession = useCallback((): Session | null => {
    return authService.getSession();
  }, []);

  const isTokenExpired = useCallback((): boolean => {
    return authService.isTokenExpired();
  }, []);

  const getAuthToken = useCallback((): string | null => {
    return authService.getAuthToken();
  }, []);

  const clearSession = useCallback((): void => {
    authService.clearSession();
  }, []);

  const session = getSession();

  return {
    session,
    getSession,
    isTokenExpired,
    getAuthToken,
    clearSession,
    isValid: !!session && !isTokenExpired(),
  };
}
