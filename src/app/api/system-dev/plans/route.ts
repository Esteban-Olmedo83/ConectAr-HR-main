import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * GET /api/system-dev/plans
 * Listar todos los planes de suscripción disponibles
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

    // TODO: Fetch from database
    // Por ahora, retornar datos mock
    const plans = [
      {
        id: 'plan_basic',
        name: 'Basic',
        slug: 'basic',
        description: 'Plan básico con funcionalidades esenciales',
        costCents: 4900,
        billingPeriod: 'monthly',
        modules: ['dashboard', 'my-portal'],
        features: { maxEmployees: 50, supportLevel: 'email' },
        isActive: true,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'plan_professional',
        name: 'Professional',
        slug: 'professional',
        description: 'Plan profesional con módulos principales',
        costCents: 14900,
        billingPeriod: 'monthly',
        modules: ['dashboard', 'employees', 'leave', 'payroll', 'analytics', 'my-portal'],
        features: { maxEmployees: 500, supportLevel: 'priority', apiAccess: false },
        isActive: true,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'plan_enterprise',
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'Plan empresarial con todas las funcionalidades',
        costCents: 49900,
        billingPeriod: 'monthly',
        modules: [
          'dashboard',
          'employees',
          'leave',
          'payroll',
          'recruitment',
          'organization-chart',
          'analytics',
          'my-portal',
        ],
        features: { maxEmployees: 5000, supportLevel: 'dedicated', apiAccess: true },
        isActive: true,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
    ];

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error('[API /system-dev/plans] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
