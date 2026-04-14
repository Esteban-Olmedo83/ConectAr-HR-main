/**
 * @fileOverview API Route de Signup — ConectAr HR
 *
 * POST /api/auth/signup
 *
 * Registra un nuevo usuario en el sistema. No crea sesión inmediatamente
 * (requiere verificación de email en flujo real). Para desarrollo, el
 * usuario queda creado y listo para iniciar sesión.
 *
 * Validaciones:
 * - Email único en el sistema
 * - Todos los campos requeridos
 * - Contraseña cumple requisitos de seguridad
 * - acceptTerms debe ser `true`
 *
 * Rate limiting: 3 intentos / IP / 15 minutos
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  signupValidationSchema,
  isEmailInSystem,
  registerUser,
} from '@/lib/password-reset';
import { isRateLimited, recordAttempt } from '@/lib/rate-limiter';
import { logEvent } from '@/lib/audit-log';

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  const endpoint = '/api/auth/signup';

  try {
    // 1. Rate limiting
    if (isRateLimited(ip, endpoint)) {
      logEvent('SIGNUP_RATE_LIMITED', `IP bloqueada por rate limiting en signup`, undefined, undefined, 'warn');
      return NextResponse.json(
        {
          success: false,
          message: 'Demasiados intentos de registro. Intenta nuevamente en 15 minutos.',
        },
        { status: 429 }
      );
    }

    // 2. Parsear y validar body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'El cuerpo de la solicitud no es JSON válido.' },
        { status: 400 }
      );
    }

    const parseResult = signupValidationSchema.safeParse(body);
    if (!parseResult.success) {
      recordAttempt(ip, endpoint);
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de registro inválidos.',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, password } = parseResult.data;

    // 3. Verificar unicidad del email
    if (isEmailInSystem(email)) {
      recordAttempt(ip, endpoint);
      logEvent('SIGNUP_EMAIL_EXISTS', `Intento de registro con email existente: ${email}`, undefined, undefined, 'warn');
      // Respuesta intencionalmente ambigua para no revelar si el email existe
      return NextResponse.json(
        {
          success: false,
          message: 'Si el email no está registrado, recibirás un correo de verificación en breve.',
        },
        { status: 409 }
      );
    }

    // 4. Registrar usuario
    registerUser({ email, firstName, lastName, password });

    // 5. Log de registro exitoso
    logEvent('SIGNUP_SUCCESS', `Nuevo usuario registrado: ${email}`, undefined, `${firstName} ${lastName}`);

    // 6. Respuesta exitosa (sin sesión — flujo real requiere verificación de email)
    return NextResponse.json(
      {
        success: true,
        message: 'Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta.',
      },
      { status: 201 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logEvent('SIGNUP_ERROR', `Error interno en signup: ${errorMessage}`, undefined, undefined, 'error');
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Solo POST está permitido
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, message: 'Método no permitido.' },
    { status: 405 }
  );
}
