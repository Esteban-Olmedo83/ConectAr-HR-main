import { NextRequest, NextResponse } from 'next/server';
import { hasSQLInjection, sanitizeText } from '@/lib/security/sanitize';

// Owner-only: validates session role from cookie before any operation
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

// GET /api/owner/modules?tenantId=xxx
export async function GET(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  if (tenantId && hasSQLInjection(tenantId)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // In production: query Supabase tenant_modules JOIN system_modules with service role key
  // For now return a typed stub so the frontend can integrate
  return NextResponse.json({
    modules: [],
    tenantId: tenantId ?? null,
    message: 'Connect to Supabase to fetch real data',
  });
}

// PATCH /api/owner/modules — toggle a module for a tenant
export async function PATCH(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  let body: { tenantId?: string; moduleKey?: string; enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { tenantId, moduleKey, enabled } = body;

  if (!tenantId || !moduleKey || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'Missing required fields: tenantId, moduleKey, enabled' }, { status: 400 });
  }

  const cleanTenant = sanitizeText(String(tenantId));
  const cleanModule = sanitizeText(String(moduleKey));

  if (hasSQLInjection(cleanTenant) || hasSQLInjection(cleanModule)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // In production: UPDATE tenant_modules SET enabled = $1, updated_at = NOW()
  //   WHERE tenant_id = $2 AND module_key = $3
  //   Then insert audit_log row
  return NextResponse.json({
    success: true,
    tenantId: cleanTenant,
    moduleKey: cleanModule,
    enabled,
  });
}
