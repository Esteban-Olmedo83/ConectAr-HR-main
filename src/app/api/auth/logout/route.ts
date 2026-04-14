import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/audit-log';

/**
 * @fileOverview API Route de Logout — ConectAr HR
 *
 * POST /api/auth/logout
 *
 * Elimina la cookie de sesión y registra el evento de logout.
 *
 * Comportamiento:
 * - Extrae información de sesión (userId, userName) para logging
 * - Elimina la cookie de sesión con maxAge: 0
 * - Retorna { success: true, redirect: '/login' } con status 200
 * - Loguea el evento de logout
 *
 * Respuestas:
 * - 200: Logout exitoso
 * - 500: Error interno
 */

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  const requestId = `logout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    logEvent('LOGOUT_REQUEST', `Logout request iniciada [requestId: ${requestId}]`);

    // Obtener información de la sesión actual para auditoría
    const sessionCookie = request.cookies.get('conectar_session');
    let userId = 'unknown';
    let userName = 'unknown';

    if (sessionCookie?.value) {
      try {
        // La cookie está codificada en Base64, decodificar antes de parsear
        const decodedSession = atob(sessionCookie.value);
        const session = JSON.parse(decodedSession);
        userId = session.userId || 'unknown';
        userName = session.userName || 'unknown';
        logEvent(
          'SESSION_DECODED',
          `Sesión decodificada para logout [requestId: ${requestId}]`,
          userId,
          userName
        );
      } catch (decodeError) {
        logEvent(
          'SESSION_DECODE_ERROR',
          `Error decodificando sesión en logout: ${decodeError instanceof Error ? decodeError.message : String(decodeError)}`,
          undefined,
          undefined,
          'warn'
        );
      }
    } else {
      logEvent('NO_SESSION_ON_LOGOUT', `No hay sesión activa para logout [requestId: ${requestId}]`);
    }

    // Log de logout (auditoría)
    logEvent(
      'USER_LOGOUT',
      `Usuario cerró sesión [requestId: ${requestId}]`,
      userId,
      userName
    );

    // Crear respuesta
    const response = NextResponse.json(
      {
        success: true,
        redirect: '/login',
        message: 'Sesión cerrada correctamente',
      },
      { status: 200 }
    );

    // Eliminar cookie de sesión
    // Nota: maxAge: 0 indica que la cookie debe eliminarse inmediatamente
    // value: '' limpia el contenido, httpOnly previene acceso desde JS
    response.cookies.set({
      name: 'conectar_session',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Eliminación inmediata
      path: '/',
    });

    logEvent(
      'LOGOUT_SUCCESS',
      `Cookie eliminada y logout completado [requestId: ${requestId}]`,
      userId,
      userName
    );

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'N/A';

    logEvent(
      'LOGOUT_ERROR',
      `Error en logout: ${errorMessage}`,
      undefined,
      undefined,
      'error'
    );

    console.error(`[Logout API] Error Details:`, { errorMessage, errorStack });

    return NextResponse.json(
      {
        success: false,
        error: 'Error al cerrar sesión',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Aceptar GET también para compatibilidad (redirige a POST)
  logEvent('LOGOUT_GET_ATTEMPT', 'GET request en logout (redirigiendo a POST)');
  return POST(request);
}
