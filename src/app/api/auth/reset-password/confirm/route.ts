/**
 * @fileOverview API Route de Reset de Contraseña (Confirmación) — ConectAr HR
 *
 * POST /api/auth/reset-password/confirm
 *
 * Valida el OTP recibido y actualiza la contraseña del usuario.
 *
 * Comportamiento:
 * - Verifica email + token + expiración
 * - Valida que la nueva contraseña cumpla los requisitos
 * - Actualiza contraseña en el store mock
 * - Invalida todos los tokens del usuario
 * - Retorna mensaje de éxito para redirigir al login
 *
 * Rate limiting: 5 intentos / IP / 15 minutos
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  resetConfirmValidationSchema,
  isEmailInSystem,
  validateResetToken,
  consumeResetToken,
  updateUserPassword,
} from '@/lib/password-reset';
import { isRateLimited, recordAttempt, clearAttempts } from '@/lib/rate-limiter';
import { logEvent } from '@/lib/audit-log';

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  const endpoint = '/api/auth/reset-password/confirm';

  try {
    // 1. Rate limiting
    if (isRateLimited(ip, endpoint)) {
      logEvent('RESET_CONFIRM_RATE_LIMITED', `IP bloqueada por rate limiting en reset-password/confirm`, undefined, undefined, 'warn');
      return NextResponse.json(
        {
          success: false,
          message: 'Demasiados intentos fallidos. Intenta nuevamente en 15 minutos.',
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

    const parseResult = resetConfirmValidationSchema.safeParse(body);
    if (!parseResult.success) {
      recordAttempt(ip, endpoint);
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos.',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, token, newPassword } = parseResult.data;

    // 3. Verificar que el email existe
    if (!isEmailInSystem(email)) {
      recordAttempt(ip, endpoint);
      logEvent('RESET_CONFIRM_UNKNOWN_EMAIL', `Confirmación de reset para email inexistente: ${email}`, undefined, undefined, 'warn');
      // Respuesta genérica para no revelar información
      return NextResponse.json(
        { success: false, message: 'Código inválido o expirado.' },
        { status: 400 }
      );
    }

    // 4. Validar token OTP
    const isTokenValid = validateResetToken(email, token);
    if (!isTokenValid) {
      recordAttempt(ip, endpoint);
      logEvent('RESET_CONFIRM_INVALID_TOKEN', `Token de reset inválido/expirado para: ${email}`, undefined, undefined, 'warn');
      return NextResponse.json(
        { success: false, message: 'Código inválido o expirado. Solicita un nuevo código.' },
        { status: 400 }
      );
    }

    // 5. Actualizar contraseña
    const updated = updateUserPassword(email, newPassword);
    if (!updated) {
      logEvent('RESET_CONFIRM_UPDATE_FAILED', `No se pudo actualizar contraseña para: ${email}`, undefined, undefined, 'error');
      return NextResponse.json(
        { success: false, message: 'Error al actualizar la contraseña. Intenta nuevamente.' },
        { status: 500 }
      );
    }

    // 6. Invalidar token usado (y todos los tokens del usuario)
    consumeResetToken(email);

    // 7. Limpiar rate limit tras éxito
    clearAttempts(ip, endpoint);

    logEvent('RESET_CONFIRM_SUCCESS', `Contraseña actualizada exitosamente para: ${email}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.',
      },
      { status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logEvent('RESET_CONFIRM_ERROR', `Error interno en reset-password/confirm: ${errorMessage}`, undefined, undefined, 'error');
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
