/**
 * @fileOverview Utilidades de Reset de Contraseña — ConectAr HR
 *
 * Proporciona funciones para generar/validar tokens de reset de contraseña,
 * calcular la fortaleza de contraseñas y gestionar el storage mock (localStorage).
 *
 * Sprint 1.2: Extendido con validación Zod, usuarios demo integrados y
 * funciones de registro de usuarios nuevos para la API de signup.
 *
 * @module password-reset
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ResetTokenRecord {
  email: string;
  token: string;
  expiresAt: number; // timestamp ms
}

export interface PasswordStrengthResult {
  /** Puntaje de 0 a 4 */
  score: number;
  /** Porcentaje visual para progress bar (0–100) */
  percent: number;
  /** Etiqueta legible */
  label: 'Muy débil' | 'Débil' | 'Regular' | 'Fuerte' | 'Muy fuerte';
  /** Color Tailwind para el indicador */
  color: string;
  /** Lista de requisitos con estado */
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'reset_tokens' as const;
/** TTL de 15 minutos en milisegundos */
const TOKEN_TTL_MS = 15 * 60 * 1000;
const REGISTERED_USERS_KEY = 'registered_users' as const;
const DEMO_USERS_KEY = 'demo_users_initialized' as const;

// ---------------------------------------------------------------------------
// Esquemas de validación Zod
// ---------------------------------------------------------------------------

/**
 * Esquema de validación de contraseña con todos los requisitos de seguridad.
 * Exportado para reutilización en formularios del frontend.
 */
export const passwordValidationSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial (!@#$%^&*)');

/**
 * Esquema de validación para el registro de nuevos usuarios.
 */
export const signupValidationSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim(),
  firstName: z.string().min(1, 'El nombre es requerido').max(100).trim(),
  lastName: z.string().min(1, 'El apellido es requerido').max(100).trim(),
  password: passwordValidationSchema,
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }),
  }),
});

/**
 * Esquema de validación para solicitud de reset de contraseña.
 */
export const resetRequestValidationSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim(),
});

/**
 * Esquema de validación para confirmación de reset de contraseña.
 */
export const resetConfirmValidationSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim(),
  token: z
    .string()
    .length(6, 'El código debe tener exactamente 6 dígitos')
    .regex(/^\d{6}$/, 'El código solo debe contener números'),
  newPassword: passwordValidationSchema,
});

// ---------------------------------------------------------------------------
// Helpers de storage
// ---------------------------------------------------------------------------

function getStoredTokens(): ResetTokenRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ResetTokenRecord[]) : [];
  } catch {
    return [];
  }
}

function saveTokens(records: ResetTokenRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Silent fail — entorno sin storage
  }
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Genera un token numérico de 6 dígitos, lo almacena en localStorage
 * y devuelve el token generado.
 */
export function generateResetToken(email: string): string {
  const token = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + TOKEN_TTL_MS;

  const records = getStoredTokens().filter((r) => r.email !== email);
  records.push({ email, token, expiresAt });
  saveTokens(records);

  return token;
}

/**
 * Valida que el token sea correcto para el email dado y que no haya expirado.
 */
export function validateResetToken(email: string, token: string): boolean {
  const records = getStoredTokens();
  const record = records.find((r) => r.email === email && r.token === token);
  if (!record) return false;
  return !isTokenExpired(record.expiresAt);
}

/**
 * Retorna `true` si el timestamp `expiresAt` ya pasó.
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

/**
 * Elimina el token de reset para un email (post-cambio exitoso).
 */
export function consumeResetToken(email: string): void {
  const records = getStoredTokens().filter((r) => r.email !== email);
  saveTokens(records);
}

// ---------------------------------------------------------------------------
// Usuarios registrados (mock)
// ---------------------------------------------------------------------------

export interface RegisteredUser {
  email: string;
  firstName: string;
  lastName: string;
  /** Contraseña en texto plano para demo; en producción sería hash */
  password: string;
  createdAt: number;
}

function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? (JSON.parse(raw) as RegisteredUser[]) : [];
  } catch {
    return [];
  }
}

/**
 * Verifica si un email ya está registrado en el mock store.
 */
export function isEmailRegistered(email: string): boolean {
  return getRegisteredUsers().some(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

/**
 * Registra un nuevo usuario en el mock store.
 */
export function registerUser(user: Omit<RegisteredUser, 'createdAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers().filter(
      (u) => u.email.toLowerCase() !== user.email.toLowerCase()
    );
    users.push({ ...user, createdAt: Date.now() });
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch {
    // Silent fail
  }
}

/**
 * Actualiza la contraseña de un usuario en el mock store.
 */
export function updateUserPassword(email: string, newPassword: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const users = getRegisteredUsers();
    const index = users.findIndex(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (index === -1) return false;
    users[index] = { ...users[index], password: newPassword };
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Usuarios demo del sistema (para verificación de existencia de email)
// ---------------------------------------------------------------------------

/**
 * Emails de usuarios demo pre-registrados en el sistema.
 * Usados para verificar existencia sin necesidad de storage.
 */
const SYSTEM_DEMO_EMAILS = new Set([
  'admin@empresa.com',
  'gerente@empresa.com',
  'manager@empresa.com',
  'empleado@empresa.com',
  'owner@conectar.com',
]);

/**
 * Verifica si un email existe en el sistema (demo o registrado por signup).
 * Combina usuarios demo hardcoded con usuarios registrados vía API.
 *
 * @param email - Email a verificar (case-insensitive)
 * @returns `true` si el email pertenece a un usuario existente
 */
export function isEmailInSystem(email: string): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  if (SYSTEM_DEMO_EMAILS.has(normalizedEmail)) return true;
  return isEmailRegistered(normalizedEmail);
}

/**
 * Retorna información básica de un usuario por email (demo + registrados).
 * Usado para la verificación de credenciales en la API de login.
 *
 * @param email - Email del usuario
 * @returns Objeto con datos básicos o `null` si no existe
 */
export function findUserInSystem(email: string): {
  userId: string;
  userName: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'owner';
  isManager: boolean;
} | null {
  const normalizedEmail = email.toLowerCase().trim();

  // Mapa de usuarios demo
  const demoMap: Record<string, {
    userId: string;
    userName: string;
    email: string;
    role: 'admin' | 'manager' | 'employee' | 'owner';
    isManager: boolean;
  }> = {
    'admin@empresa.com': {
      userId: 'admin-user',
      userName: 'Administrador',
      email: 'admin@empresa.com',
      role: 'admin',
      isManager: true,
    },
    'gerente@empresa.com': {
      userId: '0',
      userName: 'Directorio General',
      email: 'gerente@empresa.com',
      role: 'manager',
      isManager: true,
    },
    'manager@empresa.com': {
      userId: '4',
      userName: 'Asesor Fiscal',
      email: 'manager@empresa.com',
      role: 'manager',
      isManager: true,
    },
    'empleado@empresa.com': {
      userId: '1',
      userName: 'Empleado Albaranes',
      email: 'empleado@empresa.com',
      role: 'employee',
      isManager: false,
    },
    'owner@conectar.com': {
      userId: 'owner-1',
      userName: 'ConectAr Propietario',
      email: 'owner@conectar.com',
      role: 'owner',
      isManager: false,
    },
  };

  if (normalizedEmail in demoMap) {
    return demoMap[normalizedEmail];
  }

  // Buscar en usuarios registrados vía signup
  const registeredUsers = getRegisteredUsers();
  const registered = registeredUsers.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );

  if (registered) {
    return {
      userId: `user-${registered.createdAt}`,
      userName: `${registered.firstName} ${registered.lastName}`,
      email: registered.email,
      role: 'employee',
      isManager: false,
    };
  }

  return null;
}

/**
 * Inicializa el flag de usuarios demo para evitar re-inicializaciones.
 * Solo relevante en contextos de SSR/testing donde se necesita state tracking.
 */
export function markDemoUsersInitialized(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEMO_USERS_KEY, 'true');
  } catch {
    // Ignorar
  }
}

// ---------------------------------------------------------------------------
// Fortaleza de contraseña
// ---------------------------------------------------------------------------

/**
 * Calcula la fortaleza de una contraseña y retorna puntaje, etiqueta y
 * lista detallada de requisitos.
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements: PasswordRequirement[] = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Al menos una mayúscula', met: /[A-Z]/.test(password) },
    { label: 'Al menos una minúscula', met: /[a-z]/.test(password) },
    { label: 'Al menos un número', met: /[0-9]/.test(password) },
    {
      label: 'Al menos un carácter especial',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  const scoreMap: PasswordStrengthResult['score'][] = [0, 1, 2, 3, 4];
  const score = scoreMap[Math.min(metCount, 4)] as PasswordStrengthResult['score'];

  const labels: PasswordStrengthResult['label'][] = [
    'Muy débil',
    'Débil',
    'Regular',
    'Fuerte',
    'Muy fuerte',
  ];

  const colors = [
    'bg-red-500',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-lime-500',
    'bg-green-500',
  ];

  return {
    score,
    percent: (metCount / 5) * 100,
    label: password.length === 0 ? 'Muy débil' : labels[score],
    color: colors[score],
    requirements,
  };
}
