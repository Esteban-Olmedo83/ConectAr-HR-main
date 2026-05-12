import { getSupabaseAdminClient, isSupabaseConfigured } from '../supabase-server';
import { mockEmployees, initialRequests, initialVacancies } from '../mock-data';

const TENANT = 'c0nec7ar-0001-0001-0001-000000000001';

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  openVacancies: number;
  pendingPayrolls: number;
  departments: DeptStat[];
  recentActivity: ActivityItem[];
}

export interface DeptStat {
  name: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  type: 'leave_request' | 'new_hire' | 'payroll' | 'recruitment';
  description: string;
  time: string;
}

export async function getDashboardStats(tenantId = TENANT): Promise<DashboardStats> {
  if (!isSupabaseConfigured) return getMockStats();
  const db = getSupabaseAdminClient();
  if (!db) return getMockStats();

  const today = new Date().toISOString().split('T')[0];

  const [empRes, leaveRes, attRes, vacRes] = await Promise.all([
    db.from('employees').select('id, status, departments(name)').eq('tenant_id', tenantId),
    db.from('leaves').select('status').eq('tenant_id', tenantId).eq('status', 'pending'),
    db.from('attendance').select('status').eq('tenant_id', tenantId).eq('date', today),
    db.from('recruitment_positions').select('id').eq('tenant_id', tenantId).eq('status', 'open'),
  ]);

  const employees  = (empRes.data  ?? []) as { status: string; departments?: { name: string } | null }[];
  const leaves     = (leaveRes.data ?? []) as { status: string }[];
  const attendance = (attRes.data  ?? []) as { status: string }[];
  const vacancies  = (vacRes.data  ?? []) as { id: string }[];

  const deptMap: Record<string, number> = {};
  for (const e of employees) {
    const dept = e.departments?.name ?? 'Sin departamento';
    deptMap[dept] = (deptMap[dept] ?? 0) + 1;
  }

  return {
    totalEmployees:  employees.length,
    activeEmployees: employees.filter(e => e.status === 'active').length,
    pendingLeaves:   leaves.length,
    presentToday:    attendance.filter(a => a.status === 'present').length,
    lateToday:       attendance.filter(a => a.status === 'late').length,
    absentToday:     attendance.filter(a => a.status === 'absent').length,
    openVacancies:   vacancies.length,
    pendingPayrolls: 0,
    departments: Object.entries(deptMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    recentActivity: [],
  };
}

// ── Mock fallback ─────────────────────────────────────────────────────────────

function getMockStats(): DashboardStats {
  const active = mockEmployees.filter(e => !e.fechaEgreso);
  const pending = initialRequests.filter(r => r.status === 'Pendiente' || r.status === 'Pendiente de Admin');
  const openVac = initialVacancies.filter(v => v.status !== 'Contratado');

  const deptMap: Record<string, number> = {};
  for (const e of active) {
    const d = e.empresa.sector || 'Sin sector';
    deptMap[d] = (deptMap[d] ?? 0) + 1;
  }

  return {
    totalEmployees:  active.length,
    activeEmployees: active.length,
    pendingLeaves:   pending.length,
    presentToday:    Math.round(active.length * 0.85),
    lateToday:       Math.round(active.length * 0.08),
    absentToday:     Math.round(active.length * 0.07),
    openVacancies:   openVac.length,
    pendingPayrolls: 0,
    departments: Object.entries(deptMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    recentActivity: [
      { id: '1', type: 'leave_request', description: 'Ana García solicitó 8 días de vacaciones', time: '2h' },
      { id: '2', type: 'leave_request', description: 'Ramiro Blanco solicitó vacaciones de invierno', time: '3h' },
      { id: '3', type: 'payroll',       description: 'Nómina Abril 2026 disponible para 20 empleados', time: '1d' },
      { id: '4', type: 'recruitment',   description: 'Julieta Rossi avanzó a etapa de entrevista técnica', time: '1d' },
      { id: '5', type: 'new_hire',      description: 'Inés Acosta incorporada como Analista Marketing', time: '2d' },
    ],
  };
}
