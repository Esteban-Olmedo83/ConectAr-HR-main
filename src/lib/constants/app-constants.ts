/**
 * Constantes de la Aplicación
 * Define constantes globales para toda la aplicación
 */

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
};

// Configuración de timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000,
  SESSION_REFRESH: 5 * 60 * 1000, // 5 minutos
  SESSION_WARNING: 10 * 60 * 1000, // 10 minutos
  SESSION_EXPIRY: 30 * 60 * 1000, // 30 minutos
};

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  EMPLOYEES_VIEW: '/employees/:id',
  EMPLOYEES_CREATE: '/employees/create',
  EMPLOYEES_EDIT: '/employees/:id/edit',
  ATTENDANCE: '/attendance',
  LEAVE: '/leave',
  LEAVE_REQUESTS: '/leave/requests',
  PAYROLL: '/payroll',
  DOCUMENTS: '/documents',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/not-found',
};

// Mensajes de validación comunes
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  INVALID_EMAIL: 'Por favor, ingresa un email válido',
  INVALID_PHONE: 'Por favor, ingresa un teléfono válido',
  INVALID_URL: 'Por favor, ingresa una URL válida',
  MIN_LENGTH: (min: number) => `Debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (max: number) => `No debe exceder ${max} caracteres`,
  PATTERN_MISMATCH: 'El formato no es válido',
  PASSWORD_STRENGTH: 'La contraseña debe contener mayúsculas, minúsculas y números',
};

// Límites de archivo
export const FILE_LIMITS = {
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.ms-excel'],
};

// Formatos
export const FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
  PHONE: '(###) ###-####',
  CURRENCY: 'USD',
  LANGUAGE: 'es-ES',
};

// Colores para estados
export const STATUS_COLORS = {
  active: 'green',
  inactive: 'gray',
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  cancelled: 'gray',
  draft: 'blue',
  processing: 'yellow',
  completed: 'green',
  failed: 'red',
};

// Duración de animaciones
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Cache
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutos
  MEDIUM: 15 * 60 * 1000, // 15 minutos
  LONG: 60 * 60 * 1000, // 1 hora
};

// Notificaciones
export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
};

// Paginación de tablas
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  DENSE_MODE: false,
  STICKY_HEADER: true,
};

// Permisos por defecto según rol
export const DEFAULT_PERMISSIONS = {
  admin: [
    'employees:create',
    'employees:read',
    'employees:update',
    'employees:delete',
    'attendance:read',
    'attendance:approve',
    'leave:read',
    'leave:approve',
    'payroll:read',
    'payroll:create',
    'documents:read',
    'documents:verify',
    'settings:read',
    'settings:update',
  ],
  manager: [
    'employees:read',
    'employees:update',
    'attendance:read',
    'attendance:approve',
    'leave:read',
    'leave:approve',
    'payroll:read',
    'documents:read',
  ],
  employee: [
    'employees:read',
    'attendance:read',
    'leave:read',
    'leave:create',
    'payroll:read',
    'documents:read',
  ],
  owner: [
    'employees:create',
    'employees:read',
    'employees:update',
    'employees:delete',
    'attendance:read',
    'attendance:approve',
    'leave:read',
    'leave:approve',
    'payroll:read',
    'payroll:create',
    'payroll:update',
    'documents:read',
    'documents:verify',
    'documents:delete',
    'settings:read',
    'settings:update',
  ],
};
