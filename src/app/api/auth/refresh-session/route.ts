/**
 * @fileOverview API Route de Refresco de Sesión — ConectAr HR
 *
 * POST /api/auth/refresh-session
 *
 * Extiende el TTL de la sesión activa sin requerir re-autenticación.
 * Solo funciona si hay una sesión válida (no expirada) en la cookie.
 *
 * Comportamiento:
 * - Valida la sesión actual en la cookie `conectar_session`
 * - Extiende TTL en +4 horas
 * - Actualiza `lastActivityAt`
 * - Retorna la sesión renovada
 *
 * Rate limiting: 30 intentos / IP / hora (para evitar abuso)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  parseSessionCookie,
  extendSessionCookie,
  trackActiveSession,
} from '@/lib/session';
import { isRateLimited, recordAttempt } from '@/lib/rate-limiter';
import { logEvent } from '@/lib/audit-log';

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  const endpoint = '/api/auth/refresh-session';

  try {
    // 1. Rate limiting
    if (isRateLimited(ip, endpoint)) {
      logEvent('REFRESH_RATE_LIMITED', `IP bloqueada por rate limiting en refresh-session`, undefined, undefined, 'warn');
      return NextResponse.json(
        { success: false, message: 'Demasiadas solicitudes de refresco. Intenta más tarde.' },
        { status: 429 }
      );
    }
    recordAttempt(ip, endpoint);

    // 2. Obtener y validar sesión actual
    const sessionCookie = request.cookies.get('conectar_session');
    if (!sessionCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'No hay sesión activa.' },
        { status: 401 }
      );
    }

    const session = parseSessionCookie(sessionCookie.value);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Sesión inválida o expirada.' },
        { status: 401 }
      );
    }

    // 3. Extender TTL de la sesión
    const newCookieValue = extendSessionCookie(session);

    // 4. Parsear la sesión renovada para retornarla
    const renewedSession = parseSessionCookie(newCookieValue);

    // 5. Actualizar registro en el store de sesiones activas
    if (renewedSession) {
      trackActiveSession(renewedSession);
    }

    logEvent(
      'SESSION_REFRESHED',
      `Sesión renovada para usuario: ${session.userName}`,
      session.userId,
      session.userName
    );

    // 6. Construir respuesta con cookie actualizada
    const response = NextResponse.json(
      {
        success: true,
        message: 'Sesión renovada correctamente.',
        session: renewedSession
          ? {
              userId: renewedSession.userId,
              userName: renewedSession.userName,
              role: renewedSession.role,
              expiresAt: renewedSession.expiresAt,
              sessionId: renewedSession.sessionId,
            }
          : null,
      },
      { status: 200 }
    );

    // 7. Actualizar cookie con el nuevo valor
    response.cookies.set({
      name: 'conectar_session',
      value: newCookieValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 4 * 60 * 60, // 4 horas en segundos
      path: '/',
    });

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logEvent('REFRESH_SESSION_ERROR', `Error en refresh-session: ${errorMessage}`, undefined, undefined, 'error');
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, message: 'Método no permitido.' },
    { status: 405 }
  );
}
