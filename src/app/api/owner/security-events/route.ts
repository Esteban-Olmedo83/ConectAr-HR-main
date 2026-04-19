import { NextRequest, NextResponse } from 'next/server';
import { hasSQLInjection, sanitizeText } from '@/lib/security/sanitize';

function requireOwner(request: NextRequest): { ok: true } | NextResponse {
  const cookie = request.cookies.get('conectar_session')?.value;
  if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = JSON.parse(atob(cookie));
    if (data.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (data.expiresAt && new Date(data.expiresAt) < new Date())
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
  return { ok: true };
}

// GET /api/owner/security-events?limit=50&offset=0&resolved=false
export async function GET(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const limit    = Math.min(Number(searchParams.get('limit') ?? 50), 200);
  const offset   = Math.max(Number(searchParams.get('offset') ?? 0), 0);
  const resolved = searchParams.get('resolved');

  // In production: SELECT * FROM security_events WHERE ($1::bool IS NULL OR resolved = $1)
  //   ORDER BY created_at DESC LIMIT $2 OFFSET $3
  return NextResponse.json({ events: [], total: 0, limit, offset });
}

// POST /api/owner/security-events — log a security event (called from other API routes)
export async function POST(request: NextRequest) {
  // Accepts requests only from same origin (enforced by CORS in middleware)
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { eventType, ip, userAgent, pathname, userId, tenantId, payload, severity } = body;

  const VALID_TYPES = [
    'rate_limit_exceeded', 'failed_login', 'invalid_session',
    'sql_injection_attempt', 'xss_attempt', 'path_traversal_attempt',
    'unauthorized_access', 'suspicious_ip', 'csrf_violation', 'session_hijack_attempt',
  ];

  if (!eventType || !VALID_TYPES.includes(String(eventType))) {
    return NextResponse.json({ error: 'Invalid or missing eventType' }, { status: 400 });
  }

  const cleanIp       = sanitizeText(String(ip ?? '0.0.0.0'));
  const cleanPathname = sanitizeText(String(pathname ?? '/'));

  if (hasSQLInjection(cleanIp) || hasSQLInjection(cleanPathname)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // In production: INSERT INTO security_events (event_type, ip, user_agent, pathname, user_id, tenant_id, payload, severity)
  return NextResponse.json({ success: true }, { status: 201 });
}

// PATCH /api/owner/security-events — resolve event or block IP
export async function PATCH(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  let body: { id?: string; action?: 'resolve' | 'block_ip'; ip?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { id, action, ip } = body;
  if (!action || !['resolve', 'block_ip'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (action === 'resolve' && id) {
    const cleanId = sanitizeText(String(id));
    // In production: UPDATE security_events SET resolved = TRUE WHERE id = $1
    return NextResponse.json({ success: true, id: cleanId, resolved: true });
  }

  if (action === 'block_ip' && ip) {
    const cleanIp = sanitizeText(String(ip));
    if (!/^[\d.:a-fA-F]+$/.test(cleanIp)) {
      return NextResponse.json({ error: 'Invalid IP format' }, { status: 400 });
    }
    // In production: INSERT INTO blocked_ips (ip, blocked_by) VALUES ($1, $2) ON CONFLICT DO NOTHING
    return NextResponse.json({ success: true, ip: cleanIp, blocked: true });
  }

  return NextResponse.json({ error: 'Missing required fields for action' }, { status: 400 });
}
