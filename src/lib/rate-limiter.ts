/**
 * @fileOverview Rate Limiter — ConectAr HR
 *
 * Implementación de rate limiting basada en localStorage (mock para desarrollo).
 * En producción reemplazar con Redis + sliding window o token bucket.
 *
 * Estructura en localStorage:
 * ```
 * {
 *   "rate_limits": {
 *     "IP:/api/auth/login:2026-04-14": 3,
 *     "IP:/api/auth/signup:2026-04-14": 1
 *   },
 *   "rate_limits_meta": {
 *     "IP:/api/auth/login:2026-04-14": { "firstAttempt": 1713052800000, "lockedUntil": null }
 *   }
 * }
 * ```
 */

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const RATE_LIMITS_KEY = 'rate_limits';
const RATE_LIMITS_META_KEY = 'rate_limits_meta';

// En servidor: almacenar en memoria (nota: perdido en reinicio)
// En producción: usar Redis o similar
const SERVER_RATE_LIMITS: Record<string, number> = {};
const SERVER_RATE_LIMITS_META: Record<string, RateLimitMeta> = {};

/**
 * Configuración de límites por endpoint.
 * `max` = intentos máximos antes de bloquear.
 * `ttlMs` = ventana de tiempo en milisegundos.
 */
const ENDPOINT_LIMITS: Record<string, { max: number; ttlMs: number }> = {
  '/api/auth/login': { max: 5, ttlMs: 15 * 60 * 1000 },
  '/api/auth/signup': { max: 3, ttlMs: 15 * 60 * 1000 },
  '/api/auth/reset-password/request': { max: 5, ttlMs: 60 * 60 * 1000 },
  '/api/auth/reset-password/confirm': { max: 5, ttlMs: 15 * 60 * 1000 },
  '/api/auth/refresh-session': { max: 30, ttlMs: 60 * 60 * 1000 },
};

const DEFAULT_LIMIT = { max: 10, ttlMs: 15 * 60 * 1000 };

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

interface RateLimitCounts {
  [key: string]: number;
}

interface RateLimitMeta {
  firstAttempt: number;
  lockedUntil: number | null;
}

interface RateLimitMetaMap {
  [key: string]: RateLimitMeta;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Construye la clave de almacenamiento: `IP:endpoint:YYYY-MM-DD`.
 * La fecha diaria evita acumulación indefinida de entradas.
 */
function buildKey(ip: string, endpoint: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${ip}:${endpoint}:${today}`;
}

/** Lee el mapa de conteos (cliente o servidor). */
function readCounts(): RateLimitCounts {
  if (typeof window === 'undefined') {
    // Servidor: leer desde mapa en memoria
    return { ...SERVER_RATE_LIMITS };
  }
  try {
    const raw = localStorage.getItem(RATE_LIMITS_KEY);
    return raw ? (JSON.parse(raw) as RateLimitCounts) : {};
  } catch {
    return {};
  }
}

/** Persiste el mapa de conteos (cliente o servidor). */
function writeCounts(counts: RateLimitCounts): void {
  if (typeof window === 'undefined') {
    // Servidor: escribir a mapa en memoria
    Object.assign(SERVER_RATE_LIMITS, counts);
    return;
  }
  try {
    localStorage.setItem(RATE_LIMITS_KEY, JSON.stringify(counts));
  } catch {
    // Ignorar errores de almacenamiento
  }
}

/** Lee el mapa de metadatos (cliente o servidor). */
function readMeta(): RateLimitMetaMap {
  if (typeof window === 'undefined') {
    // Servidor: leer desde mapa en memoria
    return { ...SERVER_RATE_LIMITS_META };
  }
  try {
    const raw = localStorage.getItem(RATE_LIMITS_META_KEY);
    return raw ? (JSON.parse(raw) as RateLimitMetaMap) : {};
  } catch {
    return {};
  }
}

/** Persiste el mapa de metadatos (cliente o servidor). */
function writeMeta(meta: RateLimitMetaMap): void {
  if (typeof window === 'undefined') {
    // Servidor: escribir a mapa en memoria
    Object.assign(SERVER_RATE_LIMITS_META, meta);
    return;
  }
  try {
    localStorage.setItem(RATE_LIMITS_META_KEY, JSON.stringify(meta));
  } catch {
    // Ignorar errores de almacenamiento
  }
}

/** Retorna la configuración del endpoint o el límite por defecto. */
function getLimitConfig(endpoint: string): { max: number; ttlMs: number } {
  return ENDPOINT_LIMITS[endpoint] ?? DEFAULT_LIMIT;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Verifica si una IP está actualmente limitada para un endpoint dado.
 *
 * @param ip - Dirección IP del cliente
 * @param endpoint - Ruta del endpoint (ej: '/api/auth/login')
 * @returns `true` si el cliente debe ser bloqueado
 */
export function isRateLimited(ip: string, endpoint: string): boolean {
  const key = buildKey(ip, endpoint);
  const { max, ttlMs } = getLimitConfig(endpoint);
  const meta = readMeta();
  const counts = readCounts();

  const record = meta[key];

  if (!record) return false;

  const now = Date.now();

  // Si hay bloqueo activo, verificar si ya expiró
  if (record.lockedUntil !== null) {
    if (now < record.lockedUntil) return true;
    // Bloqueo expirado: limpiar registro
    delete counts[key];
    delete meta[key];
    writeCounts(counts);
    writeMeta(meta);
    return false;
  }

  // Verificar si la ventana de tiempo expiró
  if (now - record.firstAttempt > ttlMs) {
    delete counts[key];
    delete meta[key];
    writeCounts(counts);
    writeMeta(meta);
    return false;
  }

  return (counts[key] ?? 0) >= max;
}

/**
 * Registra un nuevo intento para la combinación IP + endpoint.
 * Si se alcanza el máximo, activa el bloqueo con el TTL configurado.
 *
 * @param ip - Dirección IP del cliente
 * @param endpoint - Ruta del endpoint
 */
export function recordAttempt(ip: string, endpoint: string): void {
  const key = buildKey(ip, endpoint);
  const { max, ttlMs } = getLimitConfig(endpoint);
  const counts = readCounts();
  const meta = readMeta();
  const now = Date.now();

  // Inicializar si no existe
  if (!meta[key]) {
    meta[key] = { firstAttempt: now, lockedUntil: null };
    counts[key] = 0;
  }

  // Verificar si la ventana expiró (reiniciar contador)
  if (now - meta[key].firstAttempt > ttlMs) {
    meta[key] = { firstAttempt: now, lockedUntil: null };
    counts[key] = 0;
  }

  counts[key] = (counts[key] ?? 0) + 1;

  // Activar bloqueo si se superó el máximo
  if (counts[key] >= max) {
    meta[key].lockedUntil = now + ttlMs;
  }

  writeCounts(counts);
  writeMeta(meta);
}

/**
 * Limpia los registros de intentos para una combinación IP + endpoint.
 * Usar tras un login exitoso para resetear el contador.
 *
 * @param ip - Dirección IP del cliente
 * @param endpoint - Ruta del endpoint
 */
export function clearAttempts(ip: string, endpoint: string): void {
  const key = buildKey(ip, endpoint);
  const counts = readCounts();
  const meta = readMeta();

  delete counts[key];
  delete meta[key];

  writeCounts(counts);
  writeMeta(meta);
}

/**
 * Retorna el número de intentos actuales para una combinación IP + endpoint.
 * No considera si la ventana de tiempo expiró (usar `isRateLimited` para eso).
 *
 * @param ip - Dirección IP del cliente
 * @param endpoint - Ruta del endpoint
 * @returns Número de intentos registrados hoy
 */
export function getAttemptCount(ip: string, endpoint: string): number {
  const key = buildKey(ip, endpoint);
  const counts = readCounts();
  return counts[key] ?? 0;
}

/**
 * Retorna los segundos restantes de bloqueo para una IP + endpoint.
 * Devuelve `0` si no hay bloqueo activo.
 *
 * @param ip - Dirección IP del cliente
 * @param endpoint - Ruta del endpoint
 */
export function getLockoutRemainingSeconds(ip: string, endpoint: string): number {
  const key = buildKey(ip, endpoint);
  const meta = readMeta();

  const record = meta[key];
  if (!record || record.lockedUntil === null) return 0;

  const remaining = record.lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Retorna los intentos restantes antes del bloqueo para una IP + endpoint.
 *
 * @param ip - Dirección IP del cliente
 * @param endpoint - Ruta del endpoint
 */
export function getRemainingAttempts(ip: string, endpoint: string): number {
  const { max } = getLimitConfig(endpoint);
  const used = getAttemptCount(ip, endpoint);
  return Math.max(0, max - used);
}

/**
 * Elimina todas las entradas de rate limit expiradas del almacenamiento.
 * Llamar periódicamente para evitar acumulación de datos obsoletos.
 */
export function pruneExpiredEntries(): void {
  if (typeof window === 'undefined') return;

  const counts = readCounts();
  const meta = readMeta();
  const now = Date.now();

  for (const key of Object.keys(meta)) {
    const record = meta[key];
    // Determinar el endpoint desde la clave "IP:endpoint:fecha"
    const parts = key.split(':');
    const endpoint = parts.slice(1, -1).join(':');
    const { ttlMs } = getLimitConfig(endpoint);

    const isLockExpired = record.lockedUntil !== null && now >= record.lockedUntil;
    const isWindowExpired = now - record.firstAttempt > ttlMs;

    if (isLockExpired || isWindowExpired) {
      delete counts[key];
      delete meta[key];
    }
  }

  writeCounts(counts);
  writeMeta(meta);
}
