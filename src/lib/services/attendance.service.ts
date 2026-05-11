import { getSupabaseAdminClient, isSupabaseConfigured } from '../supabase-server';

const TENANT = 'c0nec7ar-0001-0001-0001-000000000001';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  late_minutes: number;
  working_hours: number | null;
  branch_id: string | null;
  employees?: { first_name: string; last_name: string; employee_code: string; departments?: { name: string } | null } | null;
}

export interface AttendanceSummary {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

export async function getTodayAttendance(tenantId = TENANT): Promise<AttendanceRecord[]> {
  if (!isSupabaseConfigured) return getMockToday();
  const db = getSupabaseAdminClient();
  if (!db) return getMockToday();

  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await db
    .from('attendance')
    .select('*, employees(first_name, last_name, employee_code, departments(name))')
    .eq('tenant_id', tenantId)
    .eq('date', today)
    .order('check_in_time', { ascending: true });

  if (error) { console.error('[attendance.service]', error.message); return getMockToday(); }
  return (data ?? []) as AttendanceRecord[];
}

export async function getAttendanceHistory(
  tenantId = TENANT,
  from?: string,
  to?: string
): Promise<AttendanceRecord[]> {
  if (!isSupabaseConfigured) return getMockHistory();
  const db = getSupabaseAdminClient();
  if (!db) return getMockHistory();

  const endDate   = to   ?? new Date().toISOString().split('T')[0];
  const startDate = from ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const { data, error } = await db
    .from('attendance')
    .select('*, employees(first_name, last_name, employee_code, departments(name))')
    .eq('tenant_id', tenantId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .limit(500);

  if (error) { console.error('[attendance.service]', error.message); return getMockHistory(); }
  return (data ?? []) as AttendanceRecord[];
}

export async function getAttendanceStats(tenantId = TENANT) {
  if (!isSupabaseConfigured) {
    return { present: 17, absent: 2, late: 3, onLeave: 1, total: 20 };
  }
  const db = getSupabaseAdminClient();
  if (!db) return { present: 17, absent: 2, late: 3, onLeave: 1, total: 20 };

  const today = new Date().toISOString().split('T')[0];
  const { data } = await db
    .from('attendance')
    .select('status')
    .eq('tenant_id', tenantId)
    .eq('date', today);

  const rows = data ?? [];
  return {
    present: rows.filter(r => r.status === 'present').length,
    late:    rows.filter(r => r.status === 'late').length,
    absent:  rows.filter(r => r.status === 'absent').length,
    onLeave: rows.filter(r => r.status === 'on_leave').length,
    total:   rows.length,
  };
}

// ── Mock fallbacks ────────────────────────────────────────────────────────────

function getMockToday(): AttendanceRecord[] {
  const today = new Date().toISOString().split('T')[0];
  const names = ['Esteban Olmedo','María Elena González','Juan Pablo Fernández','Laura Rodríguez','Ricardo Morales',
    'Marcelo Aguirre','Sebastián Torres','Ana García','Carlos Martínez','Valentina Sánchez'];
  return names.map((n, i) => {
    const [fn, ...ln] = n.split(' ');
    return {
      id: `mock-att-${i}`,
      employee_id: String(i + 1).padStart(3, '0'),
      date: today,
      check_in_time: `${today}T${9 + (i % 2)}:${i * 3 % 60 < 10 ? '0' : ''}${i * 3 % 60}:00.000Z`,
      check_out_time: i < 8 ? `${today}T18:00:00.000Z` : null,
      status: i === 2 ? 'late' : i === 7 ? 'absent' : 'present',
      late_minutes: i === 2 ? 15 : 0,
      working_hours: i < 8 ? 8 : null,
      branch_id: null,
      employees: { first_name: fn, last_name: ln.join(' '), employee_code: `EMP-${String(i+1).padStart(3,'0')}`, departments: { name: ['Dirección','RRHH','Tecnología','Ventas','Finanzas','Operaciones','Marketing','RRHH','RRHH','Tecnología'][i] } },
    };
  });
}

function getMockHistory(): AttendanceRecord[] {
  return getMockToday();
}
