import { getSupabaseAdminClient, isSupabaseConfigured } from '../supabase-server';

const TENANT = 'c0nec7ar-0001-0001-0001-000000000001';

export interface PayrollRow {
  id: string;
  employee_id: string;
  payroll_period: string;
  base_salary: number;
  gross_salary: number;
  net_salary: number;
  status: string;
  payment_method: string;
  paid_at: string | null;
  employees?: { first_name: string; last_name: string; employee_code: string; departments?: { name: string } | null } | null;
  payroll_components?: PayrollComponent[];
}

export interface PayrollComponent {
  id: string;
  name: string;
  component_type: string;
  amount: number;
  is_deduction: boolean;
}

export async function getPayrolls(tenantId = TENANT, period?: string): Promise<PayrollRow[]> {
  if (!isSupabaseConfigured) return getMockPayrolls(period);
  const db = getSupabaseAdminClient();
  if (!db) return getMockPayrolls(period);

  let q = db
    .from('payroll')
    .select('*, employees(first_name,last_name,employee_code,departments(name)), payroll_components(*)')
    .eq('tenant_id', tenantId)
    .order('payroll_period', { ascending: false });

  if (period) q = q.eq('payroll_period', period);

  const { data, error } = await q.limit(200);
  if (error) { console.error('[payroll.service]', error.message); return getMockPayrolls(period); }
  return (data ?? []) as PayrollRow[];
}

export async function getPayrollsByEmployee(employeeId: string, tenantId = TENANT): Promise<PayrollRow[]> {
  if (!isSupabaseConfigured) return getMockPayrolls().filter(p => p.employee_id === employeeId);
  const db = getSupabaseAdminClient();
  if (!db) return [];

  const { data, error } = await db
    .from('payroll')
    .select('*, payroll_components(*)')
    .eq('tenant_id', tenantId)
    .eq('employee_id', employeeId)
    .order('payroll_period', { ascending: false });

  if (error) return [];
  return (data ?? []) as PayrollRow[];
}

// ── Mock fallback ─────────────────────────────────────────────────────────────

const MOCK_EMPLOYEES = [
  { id: '001', name: 'Esteban Olmedo',        dept: 'Dirección',  salary: 1500000 },
  { id: '002', name: 'María Elena González',  dept: 'RRHH',       salary: 850000  },
  { id: '003', name: 'Juan Pablo Fernández',  dept: 'Tecnología', salary: 1200000 },
  { id: '004', name: 'Laura Rodríguez',       dept: 'Ventas',     salary: 950000  },
  { id: '005', name: 'Ricardo Morales',       dept: 'Finanzas',   salary: 980000  },
  { id: '006', name: 'Marcelo Aguirre',       dept: 'Operaciones',salary: 720000  },
  { id: '007', name: 'Sebastián Torres',      dept: 'Marketing',  salary: 680000  },
  { id: '008', name: 'Ana García',            dept: 'RRHH',       salary: 420000  },
  { id: '009', name: 'Carlos Martínez',       dept: 'RRHH',       salary: 280000  },
  { id: '010', name: 'Valentina Sánchez',     dept: 'Tecnología', salary: 580000  },
];

const PERIODS = ['2026-04','2026-03','2026-02','2026-01'];

function getMockPayrolls(period?: string): PayrollRow[] {
  const periods = period ? [period] : PERIODS;
  const rows: PayrollRow[] = [];
  for (const p of periods) {
    for (const e of MOCK_EMPLOYEES) {
      const [fn, ...ln] = e.name.split(' ');
      const gross = e.salary * 1.1;
      const net   = gross * 0.83;
      rows.push({
        id: `mock-pay-${p}-${e.id}`,
        employee_id: e.id,
        payroll_period: p,
        base_salary: e.salary,
        gross_salary: gross,
        net_salary: net,
        status: 'paid',
        payment_method: 'bank_transfer',
        paid_at: `${p}-28T10:00:00.000Z`,
        employees: {
          first_name: fn, last_name: ln.join(' '),
          employee_code: `EMP-${e.id}`,
          departments: { name: e.dept },
        },
      });
    }
  }
  return rows;
}
