import { NextRequest, NextResponse } from 'next/server';
import { CreateClientInput } from '@/lib/types/system-dev';

/**
 * GET /api/system-dev/clients
 * Listar todos los clientes
 */
export async function GET(request: NextRequest) {
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

    // TODO: Fetch from database (SELECT * FROM clients)
    // Por ahora, retornar datos mock
    const clients = [
      {
        id: 'client_1',
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
          planName: 'Professional',
          assignedModules: ['dashboard', 'employees', 'leave', 'payroll', 'my-portal'],
          startedAt: new Date('2025-04-15'),
          renewsAt: new Date('2026-05-15'),
        },
        createdAt: new Date('2025-04-15'),
        updatedAt: new Date('2026-04-10'),
      },
      {
        id: 'client_2',
        companyName: 'TechStartup Inc',
        companySlug: 'techstartup-inc',
        contactEmail: 'admin@techstartup.com',
        contactPerson: 'Jane Smith',
        contactPhone: '+1-555-0101',
        country: 'Canada',
        region: 'Ontario',
        city: 'Toronto',
        status: 'active',
        subscription: {
          id: 'sub_2',
          planId: 'plan_basic',
          planName: 'Basic',
          assignedModules: ['dashboard', 'my-portal'],
          startedAt: new Date('2026-03-01'),
          renewsAt: new Date('2026-04-01'),
        },
        createdAt: new Date('2026-03-01'),
        updatedAt: new Date('2026-04-01'),
      },
    ];

    return NextResponse.json({
      success: true,
      data: clients,
      total: clients.length,
    });
  } catch (error) {
    console.error('[API /system-dev/clients] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/system-dev/clients
 * Crear nuevo cliente
 */
export async function POST(request: NextRequest) {
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

    const body: CreateClientInput = await request.json();

    // Validar campos requeridos
    if (!body.companyName || !body.companySlug || !body.contactEmail || !body.planId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Insert into database
    // INSERT INTO clients (...)
    // INSERT INTO client_subscriptions (...)
    // INSERT INTO client_audit_logs (...)

    const newClient = {
      id: `client_${Date.now()}`,
      companyName: body.companyName,
      companySlug: body.companySlug,
      contactEmail: body.contactEmail,
      contactPerson: body.contactPerson,
      contactPhone: body.contactPhone,
      country: body.country,
      region: body.region,
      city: body.city,
      status: 'trial',
      subscription: {
        id: `sub_${Date.now()}`,
        planId: body.planId,
        assignedModules: body.modules || [],
        startedAt: new Date(),
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('[API /system-dev/clients] Created client:', newClient.id);

    return NextResponse.json(
      { success: true, data: newClient },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /system-dev/clients POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
