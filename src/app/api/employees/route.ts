import { NextRequest, NextResponse } from 'next/server';
import { getEmployees, getEmployeeById } from '@/lib/services/employees.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  if (id) {
    const employee = await getEmployeeById(id);
    if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ employee });
  }

  const employees = await getEmployees();
  return NextResponse.json({ employees, total: employees.length });
}
