import { NextRequest, NextResponse } from 'next/server';
import { UpdateSubscriptionInput } from '@/lib/types/system-dev';

/**
 * PUT /api/system-dev/clients/:clientId/subscription
 * Cambiar plan y módulos de un cliente
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
    const body: UpdateSubscriptionInput = await request.json();

    if (!body.planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }

    // TODO: Get current subscription
    // TODO: UPDATE client_subscriptions SET plan_id = :planId, assigned_modules = :modules
    // TODO: Calculate proration if mid-cycle
    // TODO: INSERT INTO client_audit_logs
    // TODO: Send notification to client (email)

    const updatedSubscription = {
      id: `sub_${Date.now()}`,
      clientId,
      planId: body.planId,
      assignedModules: body.modules || [],
      startedAt: new Date(),
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    console.log('[API /system-dev/clients/:clientId/subscription] Updated subscription:', clientId);

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
      message: 'Suscripción actualizada exitosamente',
    });
  } catch (error) {
    console.error('[API /system-dev/clients/:clientId/subscription] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
