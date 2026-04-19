import { NextRequest, NextResponse } from 'next/server';
import { hasSQLInjection, sanitizeText, sanitizeObject } from '@/lib/security/sanitize';

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

// GET /api/owner/hotfixes?status=draft|published|rolled_back
export async function GET(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const VALID_STATUSES = ['draft', 'published', 'rolled_back'];
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // In production: SELECT * FROM hotfixes WHERE ($1::text IS NULL OR status = $1) ORDER BY created_at DESC
  return NextResponse.json({ hotfixes: [], status: status ?? null });
}

// POST /api/owner/hotfixes — create draft
export async function POST(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, description, type, scope, version, changelog, targetTenants, targetModules } = body;

  if (!title || !version || !type || !scope) {
    return NextResponse.json({ error: 'Required: title, version, type, scope' }, { status: 400 });
  }

  const VALID_TYPES  = ['bugfix', 'feature', 'security', 'performance'];
  const VALID_SCOPES = ['global', 'specific'];
  if (!VALID_TYPES.includes(String(type))) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  if (!VALID_SCOPES.includes(String(scope))) return NextResponse.json({ error: 'Invalid scope' }, { status: 400 });

  const clean = sanitizeObject({
    title: String(title),
    description: String(description ?? ''),
    version: String(version),
    changelog: String(changelog ?? ''),
  });

  if (Object.values(clean).some(v => hasSQLInjection(v))) {
    return NextResponse.json({ error: 'Invalid input detected' }, { status: 400 });
  }

  // In production: INSERT INTO hotfixes (...) VALUES (...) RETURNING id
  return NextResponse.json({
    success: true,
    hotfix: {
      id: `hf-${Date.now()}`,
      ...clean,
      type,
      scope,
      status: 'draft',
      targetTenants: Array.isArray(targetTenants) ? targetTenants : [],
      targetModules: Array.isArray(targetModules) ? targetModules : [],
      publishedAt: null,
      createdAt: new Date().toISOString(),
    },
  }, { status: 201 });
}

// PATCH /api/owner/hotfixes — publish or rollback
export async function PATCH(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  let body: { id?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { id, action } = body;
  if (!id || !action) return NextResponse.json({ error: 'Required: id, action' }, { status: 400 });

  const VALID_ACTIONS = ['publish', 'rollback'];
  if (!VALID_ACTIONS.includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  const cleanId = sanitizeText(String(id));
  if (hasSQLInjection(cleanId)) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const newStatus = action === 'publish' ? 'published' : 'rolled_back';

  // In production: UPDATE hotfixes SET status = $1, published_at = NOW() WHERE id = $2
  // Then: INSERT hotfix_deliveries for each target tenant
  // Then: INSERT audit_logs
  return NextResponse.json({ success: true, id: cleanId, status: newStatus });
}
