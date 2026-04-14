/**
 * Manejo de errores
 * Proporciona funciones para manejar errores de forma consistente
 */

import { FetchError } from '../types/api';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'APP_ERROR',
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'No tiene permiso para realizar esta acción') {
    super(message, 'FORBIDDEN_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'El recurso ya existe') {
    super(message, 'CONFLICT_ERROR', 409);
    this.name = 'ConflictError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Error del servidor') {
    super(message, 'SERVER_ERROR', 500);
    this.name = 'ServerError';
  }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof FetchError) {
    const message = error.message || 'Error en la solicitud';
    const statusCode = error.status || 500;

    if (statusCode === 400) {
      return new ValidationError(message, error.data as Record<string, unknown>);
    } else if (statusCode === 401) {
      return new AuthenticationError(message);
    } else if (statusCode === 403) {
      return new AuthorizationError(message);
    } else if (statusCode === 404) {
      return new NotFoundError(message);
    } else if (statusCode === 409) {
      return new ConflictError(message);
    } else if (statusCode >= 500) {
      return new ServerError(message);
    }

    return new AppError(message, 'API_ERROR', statusCode);
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500);
  }

  return new AppError('Error desconocido', 'UNKNOWN_ERROR', 500);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error desconocido';
}

export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') || error.message.includes('network'))
  );
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function logError(error: unknown, context: string = ''): void {
  if (typeof window !== 'undefined') {
    console.error(`[${context}]`, error);
  }
}

export function createErrorResponse(error: AppError): {
  error: true;
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
} {
  return {
    error: true,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    details: error.details,
  };
}
