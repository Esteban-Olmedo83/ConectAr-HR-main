/**
 * Security Headers — ConectAr HR
 * OWASP Top 10 + NIST 800-53 compliant header configuration.
 * Applied to every response via middleware.
 */

const isDev = process.env.NODE_ENV === 'development';

// ─── Content Security Policy ─────────────────────────────────────────────────

function buildCSP(): string {
  const directives: [string, string[]][] = [
    ['default-src',   ["'self'"]],
    ['script-src',    [
      "'self'",
      // Next.js requires unsafe-inline for hydration chunks
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ]],
    ['style-src',     ["'self'", "'unsafe-inline'"]],  // Tailwind needs inline
    ['img-src',       ["'self'", 'data:', 'blob:', 'https://avatar.iran.liara.run', 'https://placehold.co']],
    ['font-src',      ["'self'", 'data:']],
    ['connect-src',   [
      "'self'",
      'https://*.supabase.co',
      'wss://*.supabase.co',
      ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : []),
    ]],
    ['media-src',     ["'self'"]],
    ['object-src',    ["'none'"]],   // Block Flash/plugins
    ['base-uri',      ["'self'"]],   // Prevent base tag injection
    ['form-action',   ["'self'"]],   // Prevent form hijacking
    ['frame-src',     ["'none'"]],   // No iframes
    ['frame-ancestors', ["'none'"]], // Prevent clickjacking (also in X-Frame-Options)
    ['worker-src',    ["'self'", 'blob:']],
    ...(!isDev ? [['upgrade-insecure-requests', []] as [string, string[]]] : []),
  ];

  return directives
    .map(([key, values]) => values.length > 0 ? `${key} ${values.join(' ')}` : key)
    .join('; ');
}

// ─── Permissions Policy ───────────────────────────────────────────────────────

const PERMISSIONS_POLICY = [
  'camera=()',
  'display-capture=()',
  'fullscreen=(self)',
  'geolocation=(self)',   // Required for attendance GPS
  'gyroscope=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'picture-in-picture=()',
  'usb=()',
  'web-share=(self)',
  'xr-spatial-tracking=()',
].join(', ');

// ─── Final Headers Map ────────────────────────────────────────────────────────

export const SECURITY_HEADERS: Record<string, string> = {
  // Anti-MIME-sniffing
  'X-Content-Type-Options': 'nosniff',

  // Clickjacking protection (defense-in-depth with CSP frame-ancestors)
  'X-Frame-Options': 'DENY',

  // XSS filter for legacy browsers
  'X-XSS-Protection': '1; mode=block',

  // Referrer leakage control
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Restrict browser feature APIs
  'Permissions-Policy': PERMISSIONS_POLICY,

  // Cross-origin isolation (prevents Spectre-class attacks)
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',

  // Remove server fingerprints
  'X-Powered-By': '',

  // HSTS — only in production (Strict-Transport-Security)
  ...(!isDev ? {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  } : {}),

  // Content Security Policy
  'Content-Security-Policy': buildCSP(),
};

/**
 * Returns CORS headers for API routes.
 * Allows only same-origin by default; override per-route if needed.
 */
export function buildCORSHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);
  const isAllowed = origin && (allowedOrigins.includes(origin) || isDev);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}
