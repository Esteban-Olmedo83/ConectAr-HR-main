import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview API Route de Logout — ConectAr HR
 *
 * Elimina la cookie de sesión y registra el evento de logout.
 */

export async function POST(request: NextRequest) {
  try {
    console.log('[Logout API] POST recibida');

    // Obtener información de la sesión actual para el log
    const sessionCookie = request.cookies.get('conectar_session');
    let userId = 'unknown';
    let userName = 'unknown';

    if (sessionCookie) {
      console.log('[Logout API] Cookie de sesión encontrada');
      try {
        // La cookie está codificada en Base64, decodificar antes de parsear
        const decodedSession = atob(sessionCookie.value);
        const session = JSON.parse(decodedSession);
        userId = session.userId || 'unknown';
        userName = session.userName || 'unknown';
        console.log('[Logout API] Sesión decodificada:', { userId, userName });
      } catch (decodeError) {
        console.warn('[Logout API] Error decodificando sesión:', decodeError instanceof Error ? decodeError.message : String(decodeError));
      }
    } else {
      console.log('[Logout API] No se encontró cookie de sesión');
    }

    // Log: Usuario cerró sesión
    console.log('[Logout API] Usuario cerró sesión:', { userId, userName });

    // Crear respuesta de redirección
    const response = NextResponse.json({
      success: true,
      redirect: '/login',
      message: 'Sesión cerrada correctamente',
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

    console.log('[Logout API] Cookie de sesión eliminada, retornando respuesta');
    return response;

  } catch (error) {
    console.error('[Logout API] Error:', error instanceof Error ? error.message : String(error));
    console.error('[Logout API] Stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      {
        error: 'Error al cerrar sesión',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Redirigir POST a la misma ruta
  return POST(request);
}
