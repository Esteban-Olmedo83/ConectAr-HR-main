import { NextRequest, NextResponse } from 'next/server';
import { sanitizeText, sanitizeObject, hasSQLInjection, isValidEmail } from '@/lib/security/sanitize';
import { sendClientInvitationEmail } from '@/lib/email';

// ── In-memory store (replace with Supabase in production) ────────────────────
// In production: INSERT INTO client_invitations (...) VALUES (...)

export interface PendingInvitation {
  id: string;
  token: string;
  companyName: string;
  adminEmail: string;
  plan: string;
  modules: string[];
  status: 'pending' | 'activated' | 'expired';
  expiresAt: string;
  createdAt: string;
  activationUrl: string;
}

// Shared across requests in the same serverless instance
export const invitationStore = new Map<string, PendingInvitation>();

function requireOwner(request: NextRequest): boolean {
  try {
    const cookie = request.cookies.get('conectar_session')?.value;
    if (!cookie) return false;
    const data = JSON.parse(atob(cookie));
    return data.role === 'owner' && new Date(data.expiresAt) > new Date();
  } catch { return false; }
}

function generateToken(): string {
  // 32 random bytes → hex string
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// GET — list all invitations
export async function GET(request: NextRequest) {
  if (!requireOwner(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const list = Array.from(invitationStore.values()).map(inv => ({
    ...inv,
    token: undefined, // never expose token in list
  }));

  return NextResponse.json({ invitations: list });
}

// POST — create and send invitation
export async function POST(request: NextRequest) {
  if (!requireOwner(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { companyName, adminEmail, plan, modules } = body;

  if (!companyName || !adminEmail || !plan) {
    return NextResponse.json({ error: 'Required: companyName, adminEmail, plan' }, { status: 400 });
  }

  const cleanEmail = String(adminEmail).trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const clean = sanitizeObject({
    companyName: String(companyName),
    plan:        String(plan),
  });

  if (hasSQLInjection(clean.companyName) || hasSQLInjection(clean.plan)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const VALID_PLANS = ['starter', 'professional', 'enterprise'];
  if (!VALID_PLANS.includes(clean.plan.toLowerCase())) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const token     = generateToken();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h
  const baseUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://conect-ar-hr-main.vercel.app';
  const activationUrl = `${baseUrl}/activate?token=${token}`;

  const invitation: PendingInvitation = {
    id:             crypto.randomUUID(),
    token,
    companyName:    clean.companyName,
    adminEmail:     cleanEmail,
    plan:           clean.plan,
    modules:        Array.isArray(modules) ? modules.map(m => sanitizeText(String(m))) : [],
    status:         'pending',
    expiresAt:      expiresAt.toISOString(),
    createdAt:      new Date().toISOString(),
    activationUrl,
  };

  // Store locally + in production: INSERT INTO client_invitations
  invitationStore.set(token, invitation);

  // Send invitation email
  const emailResult = await sendClientInvitationEmail({
    to:             cleanEmail,
    companyName:    clean.companyName,
    activationUrl,
    expiresHours:   48,
  });

  return NextResponse.json({
    success:    true,
    id:         invitation.id,
    expiresAt:  invitation.expiresAt,
    emailSent:  emailResult.success,
    // devUrl returned only in development so owner can test without email
    ...(emailResult.devUrl ? { devUrl: emailResult.devUrl } : {}),
  }, { status: 201 });
}

// DELETE — cancel invitation
export async function DELETE(request: NextRequest) {
  if (!requireOwner(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const cleanId = sanitizeText(id);
  const entry   = Array.from(invitationStore.values()).find(i => i.id === cleanId);
  if (!entry) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  if (entry.status === 'activated') return NextResponse.json({ error: 'Cannot cancel activated invitation' }, { status: 409 });

  invitationStore.delete(entry.token);
  return NextResponse.json({ success: true });
}
