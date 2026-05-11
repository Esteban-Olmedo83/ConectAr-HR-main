import { NextRequest, NextResponse } from 'next/server';
import { getLeaveRequests, getLeaveStats } from '@/lib/services/leave.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const view = searchParams.get('view') ?? 'list';

  if (view === 'stats') {
    const stats = await getLeaveStats();
    return NextResponse.json({ stats });
  }

  const requests = await getLeaveRequests();
  return NextResponse.json({ requests, total: requests.length });
}
