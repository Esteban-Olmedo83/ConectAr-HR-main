import { getSupabaseAdminClient, isSupabaseConfigured } from '../supabase-server';
import { initialRequests } from '../mock-data';

const TENANT = 'c0nec7ar-0001-0001-0001-000000000001';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_taken: number;
  status: string;
  reason: string | null;
  approved_by: string | null;
  employees?: { first_name: string; last_name: string; employee_code: string } | null;
  leave_types?: { name: string; code: string } | null;
}

export async function getLeaveRequests(tenantId = TENANT): Promise<LeaveRequest[]> {
  if (!isSupabaseConfigured) return getMockLeaves();
  const db = getSupabaseAdminClient();
  if (!db) return getMockLeaves();

  const { data, error } = await db
    .from('leaves')
    .select('*, employees(first_name,last_name,employee_code), leave_types(name,code)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) { console.error('[leave.service]', error.message); return getMockLeaves(); }
  return (data ?? []) as LeaveRequest[];
}

export async function getLeaveStats(tenantId = TENANT) {
  if (!isSupabaseConfigured) {
    return { pending: 3, approved: 5, rejected: 2, total: 10 };
  }
  const db = getSupabaseAdminClient();
  if (!db) return { pending: 3, approved: 5, rejected: 2, total: 10 };

  const { data } = await db
    .from('leaves')
    .select('status')
    .eq('tenant_id', tenantId);

  const rows = data ?? [];
  return {
    pending:  rows.filter(r => r.status === 'pending').length,
    approved: rows.filter(r => r.status === 'approved').length,
    rejected: rows.filter(r => r.status === 'rejected').length,
    total: rows.length,
  };
}

// ── Mock bridge ───────────────────────────────────────────────────────────────

function getMockLeaves(): LeaveRequest[] {
  return initialRequests.map(r => ({
    id: r.id,
    employee_id: r.employeeId,
    leave_type_id: '',
    start_date: r.startDate.toISOString().split('T')[0],
    end_date: r.endDate.toISOString().split('T')[0],
    days_taken: Math.ceil((r.endDate.getTime() - r.startDate.getTime()) / 86400000) + 1,
    status: statusMap(r.status),
    reason: null,
    approved_by: null,
    employees: { first_name: r.employeeName.split(' ')[0], last_name: r.employeeName.split(' ').slice(1).join(' '), employee_code: '' },
    leave_types: { name: r.type, code: r.type.toLowerCase().replace(/ /g, '_') },
  }));
}

function statusMap(s: string) {
  if (s === 'Aprobado') return 'approved';
  if (s === 'Rechazado') return 'rejected';
  return 'pending';
}
