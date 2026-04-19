'use client';

/**
 * Hook de Validación de Sesión
 *
 * Valida periódicamente que la sesión local (sessionStorage) esté sincronizada
 * con la sesión del servidor (cookie HttpOnly).
 *
 * Comportamiento:
 * - Verifica cada 30 segundos si la cookie de sesión sigue existiendo en el servidor
 * - Si detecta desincronización (sessionStorage tiene sesión pero la cookie fue eliminada),
 *   limpia el estado local y redirige a /login
 * - Registra cambios de sesión en consola para facilitar debugging
 * - Errores de red transitorios o rate limiting no fuerzan logout (evita falsos positivos)
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getSession, sessionManager } from '@/lib/session';

const VALIDATION_INTERVAL_MS = 30_000; // 30 segundos

/**
 * Verifica si la cookie de sesión existe en el servidor realizando
 * una solicitud al endpoint de refresco.
 *
 * Retorna:
 *  - true  => sesión válida en el servidor (o error transitorio — conservador)
 *  - false => sin sesión en servidor (desincronización confirmada)
 */
async function checkServerSession(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('/api/auth/refresh-session', {
      method: 'POST',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 200) {
      return true;
    }

    if (response.status === 401) {
      return false;
    }

    // 429 (rate limited) o errores 5xx: no forzar logout por errores transitorios
    if (response.status === 429 || response.status >= 500) {
      console.warn(
        '[useSessionValidation] Respuesta transitoria del servidor:',
        response.status,
        '— ignorando para evitar falso positivo'
      );
      return true;
    }

    return false;
  } catch (error) {
    // Error de red o timeout: no desloguear por conectividad transitoria
    console.warn(
      '[useSessionValidation] Error al verificar sesión con servidor:',
      error instanceof Error ? error.message : String(error),
      '— asumiendo sesión válida'
    );
    return true;
  }
}

/**
 * useSessionValidation
 *
 * Integrar en AppShell para garantizar que la sesión local y la del
 * servidor estén siempre sincronizadas.
 *
 * No recibe parámetros. Lee la sesión desde sessionStorage internamente.
 */
export function useSessionValidation(): void {
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSessionIdRef = useRef<string | null>(null);

  const validate = useCallback(async () => {
    const localSession = getSession();

    if (!localSession) {
      console.log('[useSessionValidation] Sin sesión local — validación omitida');
      return;
    }

    // Detectar cambio de usuario en la misma pestaña
    const currentUserId = localSession.userId;
    if (
      lastSessionIdRef.current !== null &&
      lastSessionIdRef.current !== currentUserId
    ) {
      console.log(
        '[useSessionValidation] Cambio de sesión detectado: userId anterior=%s → nuevo=%s',
        lastSessionIdRef.current,
        currentUserId
      );
    }
    lastSessionIdRef.current = currentUserId;

    // Verificar expiración local antes de ir al servidor
    if (sessionManager.isTokenExpired()) {
      console.log(
        '[useSessionValidation] Sesión expirada localmente. userId=%s, expiresAt=%s. Redirigiendo a login...',
        localSession.userId,
        localSession.expiresAt
      );
      logout();
      lastSessionIdRef.current = null;
      router.replace('/login');
      return;
    }

    const msUntilExpiry = sessionManager.getTimeUntilExpiration();
    const minsLeft = Math.floor(msUntilExpiry / 60_000);
    console.log(
      '[useSessionValidation] Validando sesión con servidor. userId=%s, expira en ~%d min',
      localSession.userId,
      minsLeft
    );

    const serverSessionValid = await checkServerSession();

    if (!serverSessionValid) {
      console.warn(
        '[useSessionValidation] Desincronización detectada: sesión local existe pero la cookie del servidor fue eliminada o expiró. userId=%s',
        localSession.userId
      );
      console.log('[useSessionValidation] Limpiando sesión local y redirigiendo a /login...');

      logout();
      lastSessionIdRef.current = null;
      router.replace('/login');
    } else {
      console.log(
        '[useSessionValidation] Sesión válida en servidor. userId=%s',
        localSession.userId
      );
    }
  }, [router]);

  useEffect(() => {
    // Pequeño delay inicial para no competir con la carga inicial del componente
    const initialDelayId = setTimeout(() => {
      validate();
    }, 2000);

    // Intervalo periódico de 30 segundos
    intervalRef.current = setInterval(() => {
      validate();
    }, VALIDATION_INTERVAL_MS);

    console.log(
      '[useSessionValidation] Iniciado — intervalo de',
      VALIDATION_INTERVAL_MS / 1000,
      'segundos'
    );

    return () => {
      clearTimeout(initialDelayId);
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      console.log('[useSessionValidation] Detenido — componente desmontado');
    };
  }, [validate]);
}
