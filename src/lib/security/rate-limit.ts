/**
 * Edge-compatible in-memory rate limiter — ConectAr HR
 *
 * Runs in Next.js Edge Runtime (no Node.js built-ins allowed).
 * In production with high traffic, replace the store with Upstash Redis:
 *   npm install @upstash/ratelimit @upstash/redis
 *
 * Threat model addressed:
 *   - Brute-force login attacks
 *   - Credential stuffing
 *   - DoS via request flooding
 *   - Owner portal scraping
 */

interface RateLimitEntry {
  count: number;
  firstRequestAt: number;
  resetAt: number;
  violations: number; // escalates block time on repeat offenders
}

// Shared store across requests within the same Edge worker instance
const store = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}

// ─── Rate Limit Profiles ──────────────────────────────────────────────────────

export interface RateLimitProfile {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number; // how long to block after limit exceeded
}

export const PROFILES: Record<string, RateLimitProfile> = {
  /** Login / auth endpoints — very tight */
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,   // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 min block after exceeding
  },
  /** Owner portal — tight, since it's the highest privilege */
  owner: {
    maxRequests: 200,
    windowMs: 60 * 1000,         // 1 minute
    blockDurationMs: 5 * 60 * 1000,
  },
  /** General API routes */
  api: {
    maxRequests: 400,
    windowMs: 60 * 1000,
    blockDurationMs: 2 * 60 * 1000,
  },
  /** Page/asset routes */
  global: {
    maxRequests: 800,
    windowMs: 60 * 1000,
    blockDurationMs: 60 * 1000,
  },
} as const;

// ─── Result type ──────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;         // epoch ms
  retryAfterSec: number;
  isBlocked: boolean;      // true when in block period (not just limited)
}

// ─── Core function ────────────────────────────────────────────────────────────

export function checkRateLimit(
  ip: string,
  profileKey: keyof typeof PROFILES,
): RateLimitResult {
  cleanup();

  const profile = PROFILES[profileKey];
  const now = Date.now();
  const key = `${profileKey}:${ip}`;
  const entry = store.get(key);

  // If currently blocked (after exceeding limit)
  if (entry && entry.resetAt > now && entry.count > profile.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
      isBlocked: true,
    };
  }

  // Expired window — reset
  if (!entry || entry.resetAt <= now) {
    store.set(key, {
      count: 1,
      firstRequestAt: now,
      resetAt: now + profile.windowMs,
      violations: entry?.violations ?? 0,
    });
    return {
      allowed: true,
      remaining: profile.maxRequests - 1,
      resetAt: now + profile.windowMs,
      retryAfterSec: 0,
      isBlocked: false,
    };
  }

  entry.count++;

  if (entry.count > profile.maxRequests) {
    entry.violations++;
    // Escalate block time for repeat offenders (exponential: 1x, 2x, 4x... capped at 2h)
    const multiplier = Math.min(Math.pow(2, entry.violations - 1), 8);
    entry.resetAt = now + profile.blockDurationMs * multiplier;

    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
      isBlocked: true,
    };
  }

  return {
    allowed: true,
    remaining: profile.maxRequests - entry.count,
    resetAt: entry.resetAt,
    retryAfterSec: 0,
    isBlocked: false,
  };
}

// ─── IP extraction ────────────────────────────────────────────────────────────

/**
 * Extracts the real client IP from common proxy headers.
 * IMPORTANT: Only trust these headers if your infra (Vercel/Cloudflare) sets them.
 */
export function getClientIP(request: Request): string {
  return (
    // Vercel
    request.headers.get('x-real-ip') ||
    // Cloudflare
    request.headers.get('cf-connecting-ip') ||
    // Standard proxy chain (take first, leftmost = original client)
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    // Fallback
    '0.0.0.0'
  );
}

/**
 * Determines which rate limit profile to use based on the pathname.
 */
export function getProfile(pathname: string): keyof typeof PROFILES {
  if (pathname.startsWith('/api/auth')) return 'auth';
  if (pathname.startsWith('/owner') || pathname.startsWith('/api/owner')) return 'owner';
  if (pathname.startsWith('/api')) return 'api';
  return 'global';
}
