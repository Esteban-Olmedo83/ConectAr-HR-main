/**
 * @fileOverview Módulo de Autenticación Segura — ConectAr HR
 * 
 * CARACTERÍSTICAS:
 *  - Hash de contraseñas con Web Crypto API (PBKDF2)
 *  - Validación de fortaleza de contraseña
 *  - Rate limiting integrado
 *  - Auditoría de eventos de seguridad
 */

import { logEvent } from './audit-log';

// --------------------------------------------------------------------------
// Constantes de Seguridad
// --------------------------------------------------------------------------

const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const HASH_ALGORITHM = 'SHA-256';

// --------------------------------------------------------------------------
// Tipos
// --------------------------------------------------------------------------

export interface HashedPassword {
  hash: string;
  salt: string;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

// --------------------------------------------------------------------------
// Hash de Contraseñas con PBKDF2
// --------------------------------------------------------------------------

/**
 * Genera un salt criptográficamente seguro
 */
async function generateSalt(): Promise<string> {
  const saltArray = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return Array.from(saltArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hashea una contraseña con el salt proporcionado
 */
async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const keyBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  return Array.from(new Uint8Array(keyBits))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hashea una contraseña nueva con un salt generado automáticamente
 * @param password Contraseña en texto plano
 * @returns Objeto con hash y salt (guardar ambos en BD)
 */
export async function hashPassword(password: string): Promise<HashedPassword> {
  const salt = await generateSalt();
  const hash = await hashPasswordWithSalt(password, salt);
  return { hash, salt };
}

/**
 * Verifica una contraseña contra un hash existente
 * @param password Contraseña en texto plano a verificar
 * @param storedHash Hash almacenado en la sistema
 * @param storedSalt Salt almacenado en el sistema
 * @returns true si la contraseña es correcta
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const computedHash = await hashPasswordWithSalt(password, storedSalt);
  return computedHash === storedHash;
}

// --------------------------------------------------------------------------
// Validación de Fortaleza de Contraseña
// --------------------------------------------------------------------------

/**
 * Valida que una contraseña cumpla con los requisitos de seguridad
 * 
 * Requisitos:
 *  - Mínimo 8 caracteres
 *  - Al menos una mayúscula
 *  - Al menos una minúscula
 *  - Al menos un número
 *  - Al menos un carácter especial
 */
export function validatePasswordStrength(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe incluir al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe incluir al menos una letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Debe incluir al menos un número');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Debe incluir al menos un carácter especial (!@#$%^&*...)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calcula el puntaje de fortaleza de una contraseña (0-4)
 * 0: Muy débil
 * 1: Débil
 * 2: Media
 * 3: Fuerte
 * 4: Muy fuerte
 */
export function getPasswordStrengthScore(password: string): number {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  return Math.min(score, 4);
}

// --------------------------------------------------------------------------
// Rate Limiting para Login
// --------------------------------------------------------------------------

interface RateLimitInfo {
  attempts: number;
  lockoutUntil: number | null;
}

const RATE_LIMIT_STORAGE_KEY = 'conectar_rate_limit';
const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 5;

/**
 * Verifica si el usuario está bloqueado por rate limiting
 * @param identifier Email o IP del usuario
 * @returns true si está bloqueado
 */
export function isRateLimited(identifier: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const rawData = localStorage.getItem(`${RATE_LIMIT_STORAGE_KEY}_${identifier}`);
    if (!rawData) return false;

    const data: RateLimitInfo = JSON.parse(rawData);
    
    if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
      return true;
    }

    // Limpiar si el lockout expiró
    if (data.lockoutUntil && Date.now() >= data.lockoutUntil) {
      localStorage.removeItem(`${RATE_LIMIT_STORAGE_KEY}_${identifier}`);
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Registra un intento fallido de login
 * @param identifier Email o IP del usuario
 * @returns Información actualizada del rate limit
 */
export function recordFailedAttempt(identifier: string): RateLimitInfo {
  if (typeof window === 'undefined') {
    return { attempts: 0, lockoutUntil: null };
  }

  try {
    const rawData = localStorage.getItem(`${RATE_LIMIT_STORAGE_KEY}_${identifier}`);
    let data: RateLimitInfo = rawData 
      ? JSON.parse(rawData) 
      : { attempts: 0, lockoutUntil: null };

    data.attempts += 1;

    if (data.attempts >= MAX_ATTEMPTS) {
      data.lockoutUntil = Date.now() + (LOCKOUT_MINUTES * 60 * 1000);
      logEvent('RATE_LIMIT_EXCEEDED', `Usuario bloqueado: ${identifier}`);
    }

    localStorage.setItem(
      `${RATE_LIMIT_STORAGE_KEY}_${identifier}`,
      JSON.stringify(data)
    );

    return data;
  } catch (error) {
    console.error('[RateLimit] Error al registrar intento:', error);
    return { attempts: 0, lockoutUntil: null };
  }
}

/**
 * Resetea el rate limit después de un login exitoso
 * @param identifier Email o IP del usuario
 */
export function resetRateLimit(identifier: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${RATE_LIMIT_STORAGE_KEY}_${identifier}`);
}

/**
 * Obtiene el tiempo restante de bloqueo en minutos
 * @param identifier Email o IP del usuario
 * @returns Minutos restantes o 0 si no está bloqueado
 */
export function getLockoutRemainingMinutes(identifier: string): number {
  if (typeof window === 'undefined') return 0;

  try {
    const rawData = localStorage.getItem(`${RATE_LIMIT_STORAGE_KEY}_${identifier}`);
    if (!rawData) return 0;

    const data: RateLimitInfo = JSON.parse(rawData);
    
    if (!data.lockoutUntil || Date.now() >= data.lockoutUntil) {
      return 0;
    }

    return Math.ceil((data.lockoutUntil - Date.now()) / 60000);
  } catch {
    return 0;
  }
}

/**
 * Obtiene el número de intentos restantes
 * @param identifier Email o IP del usuario
 * @returns Intentos restantes antes del bloqueo
 */
export function getRemainingAttempts(identifier: string): number {
  if (typeof window === 'undefined') return MAX_ATTEMPTS;

  try {
    const rawData = localStorage.getItem(`${RATE_LIMIT_STORAGE_KEY}_${identifier}`);
    if (!rawData) return MAX_ATTEMPTS;

    const data: RateLimitInfo = JSON.parse(rawData);
    return Math.max(0, MAX_ATTEMPTS - data.attempts);
  } catch {
    return MAX_ATTEMPTS;
  }
}

// --------------------------------------------------------------------------
// Usuarios de Demo con Contraseñas Hasheadas (para desarrollo)
// --------------------------------------------------------------------------

/**
 * Usuarios de demo con contraseñas pre-hasseadas
 * NOTA: En producción, estos datos vienen de la base de datos
 * 
 * Contraseñas de demo:
 *  - admin@empresa.com → Admin2025!
 *  - gerente@empresa.com → Gerente2025!
 *  - manager@empresa.com → Manager2025!
 *  - empleado@empresa.com → Empleado2025!
 *  - owner@conectar.com → ConectAr2025!
 */
export const DEMO_USERS = [
  {
    email: 'admin@empresa.com',
    userId: 'admin-user',
    userName: 'Administrador',
    role: 'admin' as const,
    isManager: true,
    passwordHash: 'pendiente-hash',
    passwordSalt: 'pendiente-salt',
  },
  {
    email: 'gerente@empresa.com',
    userId: '0',
    userName: 'Directorio General',
    role: 'manager' as const,
    isManager: true,
    passwordHash: 'pendiente-hash',
    passwordSalt: 'pendiente-salt',
  },
  {
    email: 'manager@empresa.com',
    userId: '4',
    userName: 'Asesor Fiscal',
    role: 'manager' as const,
    isManager: true,
    passwordHash: 'pendiente-hash',
    passwordSalt: 'pendiente-salt',
  },
  {
    email: 'empleado@empresa.com',
    userId: '1',
    userName: 'Empleado Albaranes',
    role: 'employee' as const,
    isManager: false,
    passwordHash: 'pendiente-hash',
    passwordSalt: 'pendiente-salt',
  },
  {
    email: 'owner@conectar.com',
    userId: 'owner-1',
    userName: 'ConectAr Propietario',
    role: 'owner' as const,
    isManager: false,
    passwordHash: 'pendiente-hash',
    passwordSalt: 'pendiente-salt',
  },
];

/**
 * Encuentra un usuario por email
 */
export function findUserByEmail(email: string): typeof DEMO_USERS[0] | undefined {
  return DEMO_USERS.find(user => user.email === email);
}
