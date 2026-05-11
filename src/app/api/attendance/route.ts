import { NextRequest, NextResponse } from 'next/server';
import { getTodayAttendance, getAttendanceHistory, getAttendanceStats } from '@/lib/services/attendance.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const view = searchParams.get('view') ?? 'today';
  const from = searchParams.get('from') ?? undefined;
  const to   = searchParams.get('to')   ?? undefined;

  if (view === 'stats') {
    const stats = await getAttendanceStats();
    return NextResponse.json({ stats });
  }

  if (view === 'history') {
    const records = await getAttendanceHistory(undefined, from, to);
    return NextResponse.json({ records, total: records.length });
  }

  const records = await getTodayAttendance();
  return NextResponse.json({ records, total: records.length });
}
