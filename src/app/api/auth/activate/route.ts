import { NextRequest, NextResponse } from 'next/server';
import { invitationStore } from '@/lib/invitation-store';
import { sanitizeText } from '@/lib/security/sanitize';

export const dynamic = 'force-dynamic';

// GET — validate token (activation page pre-fills form)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const clean = sanitizeText(token);
  const inv   = invitationStore.get(clean);

  if (!inv)                                 return NextResponse.json({ valid: false, error: 'Token inválido o no encontrado.' }, { status: 404 });
  if (inv.status === 'activated')           return NextResponse.json({ valid: false, error: 'Esta invitación ya fue utilizada.' }, { status: 409 });
  if (new Date(inv.expiresAt) < new Date()) return NextResponse.json({ valid: false, error: 'La invitación expiró. Solicitá una nueva al propietario del sistema.' }, { status: 410 });

  return NextResponse.json({
    valid:       true,
    companyName: inv.companyName,
    adminEmail:  inv.adminEmail,
    plan:        inv.plan,
    modules:     inv.modules,
    expiresAt:   inv.expiresAt,
  });
}

// POST — complete activation: provision tenant + admin user
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { token, password, confirmPassword } = body;

  if (!token || !password) {
    return NextResponse.json({ error: 'Required: token, password' }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'Las contraseñas no coinciden.' }, { status: 400 });
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
  }

  const cleanToken = sanitizeText(String(token));
  const inv        = invitationStore.get(cleanToken);

  if (!inv)                                 return NextResponse.json({ error: 'Token inválido.' }, { status: 404 });
  if (inv.status === 'activated')           return NextResponse.json({ error: 'Ya activado.' }, { status: 409 });
  if (new Date(inv.expiresAt) < new Date()) return NextResponse.json({ error: 'Invitación expirada.' }, { status: 410 });

  // In production: call provision_tenant_from_invitation() in Supabase
  const tenantId = crypto.randomUUID();
  invitationStore.set(cleanToken, { ...inv, status: 'activated' });

  return NextResponse.json({
    success:     true,
    tenantId,
    companyName: inv.companyName,
    adminEmail:  inv.adminEmail,
    plan:        inv.plan,
    modules:     inv.modules,
    message:     'Empresa activada. Podés iniciar sesión con tus credenciales.',
  }, { status: 201 });
}
