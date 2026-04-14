import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/audit-log';

/**
 * @fileOverview API Route de Logout — ConectAr HR
 * 
 * Elimina la cookie de sesión y registra el evento de logout.
 */

export async function POST(request: NextRequest) {
  try {
    // Obtener información de la sesión actual para el log
    const sessionCookie = request.cookies.get('conectar_session');
    let userId = 'unknown';
    let userName = 'unknown';
    
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        userId = session.userId || 'unknown';
        userName = session.userName || 'unknown';
      } catch {
        // Cookie corrupta, ignorar
      }
    }

    logEvent('LOGOUT', `Cierre de sesión: ${userName}`, userId, userName);

    // Crear respuesta de redirección
    const response = NextResponse.json({
      success: true,
      redirect: '/login',
    });

    // Eliminar cookie de sesión
    response.cookies.set({
      name: 'conectar_session',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('[Logout API] Error:', error);
    logEvent('LOGOUT_ERROR', `Error en logout: ${error}`);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Redirigir POST a la misma ruta
  return POST(request);
}
