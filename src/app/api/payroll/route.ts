import { NextRequest, NextResponse } from 'next/server';
import { getPayrolls, getPayrollsByEmployee } from '@/lib/services/payroll.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const period     = searchParams.get('period')     ?? undefined;
  const employeeId = searchParams.get('employeeId') ?? undefined;

  if (employeeId) {
    const payrolls = await getPayrollsByEmployee(employeeId);
    return NextResponse.json({ payrolls, total: payrolls.length });
  }

  const payrolls = await getPayrolls(undefined, period);
  return NextResponse.json({ payrolls, total: payrolls.length });
}
