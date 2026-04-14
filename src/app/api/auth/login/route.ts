import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/session';

/**
 * @fileOverview API Route de Login Seguro — ConectAr HR
 *
 * PROTECCIONES:
 *  - Rate limiting por email (vía cookies)
 *  - Auditoría de todos los intentos
 *  - Cookies HttpOnly para la sesión
 */

// Constantes de rate limiting
const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 5;
const RATE_LIMIT_COOKIE_PREFIX = 'rate_limit_';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validación básica de entrada
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar rate limiting desde cookies
    const rateLimitCookie = request.cookies.get(`${RATE_LIMIT_COOKIE_PREFIX}${email.replace(/[^a-z0-9]/gi, '_')}`);
    if (rateLimitCookie) {
      try {
        const rateData = JSON.parse(rateLimitCookie.value);
        if (rateData.lockoutUntil && Date.now() < rateData.lockoutUntil) {
          const remainingMinutes = Math.ceil((rateData.lockoutUntil - Date.now()) / 60000);
          console.log('[Login] Usuario bloqueado por rate limiting:', email);
          return NextResponse.json(
            {
              error: 'Demasiados intentos fallidos',
              lockoutMinutes: remainingMinutes,
            },
            { status: 429 }
          );
        }
      } catch {
        // Cookie corrupta, continuar
      }
    }

    // Buscar usuario (datos mock para demo)
    const user = findUserByEmail(email);

    if (!user) {
      console.log('[Login] Usuario no encontrado:', email);
      // Registrar intento fallido en cookie
      const response = NextResponse.json(
        { error: 'El correo o la contraseña son incorrectos', remainingAttempts: 2 },
        { status: 401 }
      );
      recordFailedAttempt(response, email);
      return response;
    }

    // En desarrollo con datos mock, aceptamos cualquier contraseña (excepto owner)
    const isValid = user.role === 'owner'
      ? password === 'ConectAr2025!'
      : password.length > 0;

    if (!isValid) {
      const remainingAttempts = getRemainingAttempts(request, email) - 1;
      console.log('[Login] Contraseña incorrecta para:', email, 'Intentos restantes:', remainingAttempts);

      const response = NextResponse.json(
        {
          error: 'El correo o la contraseña son incorrectos',
          remainingAttempts: Math.max(0, remainingAttempts),
        },
        { status: 401 }
      );

      if (remainingAttempts <= 0) {
        setLockout(response, email);
      } else {
        recordFailedAttempt(response, email);
      }

      return response;
    }

    // Login exitoso - resetear rate limit
    console.log('[Login] Inicio de sesión exitoso:', email);

    // Crear sesión
    const sessionData: { userId: string; userName: string; role: 'admin' | 'manager' | 'employee' | 'owner'; isManager: boolean } = {
      userId: user.userId,
      userName: user.userName,
      role: user.role as 'admin' | 'manager' | 'employee' | 'owner',
      isManager: user.isManager,
    };

    const sessionCookieValue = setSessionCookie(sessionData);

    // Crear respuesta con cookie HttpOnly
    const response = NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        userName: user.userName,
        role: user.role,
      },
      redirect: user.role === 'owner' ? '/owner/dashboard' : '/dashboard',
    });

    // Setear cookie de sesión HttpOnly
    response.cookies.set({
      name: 'conectar_session',
      value: sessionCookieValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 4 * 60 * 60, // 4 horas en segundos
      path: '/',
    });

    // Eliminar cookie de rate limit
    response.cookies.delete(`${RATE_LIMIT_COOKIE_PREFIX}${email.replace(/[^a-z0-9]/gi, '_')}`);

    return response;

  } catch (error) {
    console.error('[Login API] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------------------------
// Funciones Helper
// --------------------------------------------------------------------------

function findUserByEmail(email: string) {
  const users: Record<string, { userId: string; userName: string; role: string; isManager: boolean }> = {
    'admin@empresa.com': { userId: 'admin-user', userName: 'Administrador', role: 'admin', isManager: true },
    'gerente@empresa.com': { userId: '0', userName: 'Directorio General', role: 'manager', isManager: true },
    'manager@empresa.com': { userId: '4', userName: 'Asesor Fiscal', role: 'manager', isManager: true },
    'empleado@empresa.com': { userId: '1', userName: 'Empleado Albaranes', role: 'employee', isManager: false },
    'owner@conectar.com': { userId: 'owner-1', userName: 'ConectAr Propietario', role: 'owner', isManager: false },
  };
  return users[email];
}

function getRemainingAttempts(request: NextRequest, identifier: string): number {
  const rateLimitCookie = request.cookies.get(`${RATE_LIMIT_COOKIE_PREFIX}${identifier.replace(/[^a-z0-9]/gi, '_')}`);
  if (!rateLimitCookie) return MAX_ATTEMPTS;

  try {
    const data = JSON.parse(rateLimitCookie.value);
    return Math.max(0, MAX_ATTEMPTS - (data.attempts || 0));
  } catch {
    return MAX_ATTEMPTS;
  }
}

function recordFailedAttempt(response: NextResponse, identifier: string) {
  const attempts = getRemainingAttempts(response as any, identifier);
  const newAttempts = MAX_ATTEMPTS - attempts + 1;

  response.cookies.set({
    name: `${RATE_LIMIT_COOKIE_PREFIX}${identifier.replace(/[^a-z0-9]/gi, '_')}`,
    value: JSON.stringify({
      attempts: newAttempts,
      lockoutUntil: null,
    }),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 60, // 30 minutos
    path: '/',
  });
}

function setLockout(response: NextResponse, identifier: string) {
  const lockoutUntil = Date.now() + (LOCKOUT_MINUTES * 60 * 1000);

  response.cookies.set({
    name: `${RATE_LIMIT_COOKIE_PREFIX}${identifier.replace(/[^a-z0-9]/gi, '_')}`,
    value: JSON.stringify({
      attempts: MAX_ATTEMPTS,
      lockoutUntil,
    }),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: LOCKOUT_MINUTES * 60,
    path: '/',
  });
}
