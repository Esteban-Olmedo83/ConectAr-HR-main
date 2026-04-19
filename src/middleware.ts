import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_HEADERS, buildCORSHeaders } from '@/lib/security/headers';
import { checkRateLimit, getClientIP, getProfile } from '@/lib/security/rate-limit';

// ─── Route definitions ────────────────────────────────────────────────────────

const PUBLIC_ROUTES = ['/login', '/signup'];
const OWNER_ROUTES  = ['/owner'];
const APP_ROUTES    = [
  '/dashboard', '/employees', '/attendance', '/leave', '/payslips',
  '/recruitment', '/organization-chart', '/my-portal', '/communications',
];

const DEFAULT_LOGIN = '/login';

const ROLE_REDIRECTS: Record<string, string> = {
  owner:    '/owner/dashboard',
  admin:    '/dashboard',
  manager:  '/dashboard',
  employee: '/dashboard',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (value === '') {
      response.headers.delete(key);
    } else {
      response.headers.set(key, value);
    }
  }
  // Always strip server fingerprints
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  return response;
}

function blockedResponse(retryAfterSec: number, resetAt: number): NextResponse {
  const res = new NextResponse(
    JSON.stringify({ error: 'Too Many Requests', retryAfter: retryAfterSec }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  res.headers.set('Retry-After', String(retryAfterSec));
  res.headers.set('X-RateLimit-Limit', '0');
  res.headers.set('X-RateLimit-Remaining', '0');
  res.headers.set('X-RateLimit-Reset', String(Math.floor(resetAt / 1000)));
  applySecurityHeaders(res);
  return res;
}

// ─── Session validation ───────────────────────────────────────────────────────

interface SessionData {
  role: string;
  userId?: string;
  tenantId?: string;
  expiresAt?: string;
}

function parseSession(cookie: string | undefined): { valid: boolean; data: SessionData | null } {
  if (!cookie) return { valid: false, data: null };
  try {
    const decoded = atob(cookie);
    const data: SessionData = JSON.parse(decoded);
    if (!data.role || typeof data.role !== 'string') return { valid: false, data: null };
    return { valid: true, data };
  } catch {
    return { valid: false, data: null };
  }
}

function isExpired(data: SessionData | null): boolean {
  if (!data?.expiresAt) return true;
  return new Date(data.expiresAt) < new Date();
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);

  // ── Rate limiting ──────────────────────────────────────────────────────────
  const profile = getProfile(pathname);
  const rl = checkRateLimit(ip, profile);

  if (!rl.allowed) {
    return blockedResponse(rl.retryAfterSec, rl.resetAt);
  }

  // ── CORS pre-flight for API routes ─────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');

    if (request.method === 'OPTIONS') {
      const corsRes = new NextResponse(null, { status: 204 });
      const corsHeaders = buildCORSHeaders(origin);
      for (const [k, v] of Object.entries(corsHeaders)) corsRes.headers.set(k, v);
      applySecurityHeaders(corsRes);
      return corsRes;
    }

    // Let API routes handle their own auth; apply headers + CORS and continue
    const next = NextResponse.next();
    const corsHeaders = buildCORSHeaders(origin);
    for (const [k, v] of Object.entries(corsHeaders)) next.headers.set(k, v);
    next.headers.set('X-RateLimit-Limit', String(400));
    next.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    next.headers.set('X-RateLimit-Reset', String(Math.floor(rl.resetAt / 1000)));
    return applySecurityHeaders(next);
  }

  // ── Session ────────────────────────────────────────────────────────────────
  const cookie = request.cookies.get('conectar_session')?.value;
  const { valid, data: sessionData } = parseSession(cookie);
  const hasSession = valid;
  const userRole   = sessionData?.role ?? 'guest';
  const expired    = isExpired(sessionData);

  // ── Public routes ──────────────────────────────────────────────────────────
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    if (hasSession && !expired && userRole !== 'guest') {
      const dest = ROLE_REDIRECTS[userRole] ?? '/dashboard';
      const res = NextResponse.redirect(new URL(dest, request.url));
      return applySecurityHeaders(res);
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // ── Owner routes ───────────────────────────────────────────────────────────
  if (OWNER_ROUTES.some(r => pathname.startsWith(r))) {
    if (!hasSession || expired || userRole !== 'owner') {
      const url = new URL(DEFAULT_LOGIN, request.url);
      url.searchParams.set('returnTo', pathname);
      url.searchParams.set('error', 'unauthorized');
      return applySecurityHeaders(NextResponse.redirect(url));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // ── App routes (require auth) ──────────────────────────────────────────────
  if (APP_ROUTES.some(r => pathname.startsWith(r)) || pathname === '/') {
    if (!hasSession || expired || userRole === 'guest') {
      const url = new URL(DEFAULT_LOGIN, request.url);
      url.searchParams.set('returnTo', pathname);
      url.searchParams.set('error', 'authentication_required');
      return applySecurityHeaders(NextResponse.redirect(url));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // ── Everything else ────────────────────────────────────────────────────────
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|assets).*)',
  ],
};
