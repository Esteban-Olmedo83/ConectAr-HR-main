/**
 * @fileOverview API Route de Reset de Contraseña (Solicitud) — ConectAr HR
 *
 * POST /api/auth/reset-password/request
 *
 * Genera un OTP de 6 dígitos para recuperación de contraseña.
 * En desarrollo, el token se devuelve en la respuesta para facilitar testing.
 * En producción, se enviaría por email y NO se incluiría en la respuesta.
 *
 * Comportamiento:
 * - Verifica que el email exista en el sistema
 * - Genera token OTP de 6 dígitos con TTL de 15 minutos
 * - Retorna respuesta genérica (no revela si el email existe)
 * - En DEV: incluye el token en la respuesta para testing
 *
 * Rate limiting: 5 intentos / IP / 15 minutos
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  resetRequestValidationSchema,
  isEmailInSystem,
  generateResetToken,
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
  const endpoint = '/api/auth/reset-password/request';

  try {
    // 1. Rate limiting
    if (isRateLimited(ip, endpoint)) {
      logEvent('RESET_REQUEST_RATE_LIMITED', `IP bloqueada por rate limiting en reset-password/request`, undefined, undefined, 'warn');
      return NextResponse.json(
        {
          success: false,
          message: 'Demasiados intentos. Intenta nuevamente en 15 minutos.',
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

    const parseResult = resetRequestValidationSchema.safeParse(body);
    if (!parseResult.success) {
      recordAttempt(ip, endpoint);
      return NextResponse.json(
        {
          success: false,
          message: 'Email inválido.',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;

    // 3. Registrar intento
    recordAttempt(ip, endpoint);

    // 4. Verificar si el email existe (no revelamos el resultado al cliente)
    const emailExists = isEmailInSystem(email);

    if (emailExists) {
      // Generar y persistir token
      const token = generateResetToken(email);
      logEvent('RESET_TOKEN_GENERATED', `Token de reset generado para: ${email}`);

      // En producción: enviar email real aquí
      // await emailService.sendPasswordResetEmail(email, token);

      const isDevelopment = process.env.NODE_ENV !== 'production';

      return NextResponse.json(
        {
          success: true,
          message: 'Si el email está registrado, recibirás un código de recuperación en breve.',
          // Solo incluir en DEV para facilitar testing sin servidor de email
          ...(isDevelopment && { devToken: token, devNote: 'Token visible solo en entorno de desarrollo' }),
        },
        { status: 200 }
      );
    } else {
      logEvent('RESET_REQUEST_UNKNOWN_EMAIL', `Solicitud de reset para email no registrado: ${email}`, undefined, undefined, 'warn');

      // Respuesta genérica para no revelar si el email existe (prevención de enumeración)
      return NextResponse.json(
        {
          success: true,
          message: 'Si el email está registrado, recibirás un código de recuperación en breve.',
        },
        { status: 200 }
      );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logEvent('RESET_REQUEST_ERROR', `Error interno en reset-password/request: ${errorMessage}`, undefined, undefined, 'error');
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor. Intenta nuevamente.' },
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
