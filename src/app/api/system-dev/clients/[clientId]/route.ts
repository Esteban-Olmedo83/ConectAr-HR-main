import { NextRequest, NextResponse } from 'next/server';
import { UpdateClientInput } from '@/lib/types/system-dev';

/**
 * GET /api/system-dev/clients/:clientId
 * Ver detalles de un cliente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Validar que es owner
    const sessionCookie = request.cookies.get('conectar_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const decodedSession = JSON.parse(atob(sessionCookie.value));
    if (decodedSession?.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { clientId } = params;

    // TODO: SELECT * FROM clients WHERE id = :clientId
    // TODO: JOIN with client_subscriptions and subscription_plans

    const client = {
      id: clientId,
      companyName: 'Acme Corp',
      companySlug: 'acme-corp',
      contactEmail: 'admin@acmecorp.com',
      contactPerson: 'John Doe',
      contactPhone: '+1-555-0100',
      country: 'United States',
      region: 'California',
      city: 'San Francisco',
      status: 'active',
      subscription: {
        id: 'sub_1',
        planId: 'plan_professional',
        plan: {
          id: 'plan_professional',
          name: 'Professional',
          costCents: 14900,
          modules: ['dashboard', 'employees', 'leave', 'payroll', 'analytics', 'my-portal'],
        },
        assignedModules: ['dashboard', 'employees', 'leave', 'payroll', 'my-portal'],
        startedAt: new Date('2025-04-15'),
        renewsAt: new Date('2026-05-15'),
      },
      createdAt: new Date('2025-04-15'),
      updatedAt: new Date('2026-04-10'),
    };

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error('[API /system-dev/clients/:clientId] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/system-dev/clients/:clientId
 * Editar cliente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Validar que es owner
    const sessionCookie = request.cookies.get('conectar_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const decodedSession = JSON.parse(atob(sessionCookie.value));
    if (decodedSession?.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { clientId } = params;
    const body: UpdateClientInput = await request.json();

    // TODO: UPDATE clients SET ... WHERE id = :clientId
    // TODO: INSERT INTO client_audit_logs (before_state, after_state, ...)

    const updatedClient = {
      id: clientId,
      companyName: body.companyName || 'Acme Corp',
      companySlug: 'acme-corp',
      contactEmail: body.contactEmail || 'admin@acmecorp.com',
      contactPerson: body.contactPerson || 'John Doe',
      contactPhone: body.contactPhone || '+1-555-0100',
      country: body.country || 'United States',
      region: body.region || 'California',
      city: body.city || 'San Francisco',
      status: body.status || 'active',
      updatedAt: new Date(),
    };

    console.log('[API /system-dev/clients/:clientId PUT] Updated client:', clientId);

    return NextResponse.json({ success: true, data: updatedClient });
  } catch (error) {
    console.error('[API /system-dev/clients/:clientId PUT] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
