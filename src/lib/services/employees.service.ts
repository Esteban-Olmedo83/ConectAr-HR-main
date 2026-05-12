import { getSupabaseAdminClient, isSupabaseConfigured } from '../supabase-server';
import { mockEmployees } from '../mock-data';

const TENANT = 'c0nec7ar-0001-0001-0001-000000000001';

export interface EmployeeRow {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  department_id: string | null;
  position_id: string | null;
  manager_id: string | null;
  employment_type: string;
  hire_date: string;
  salary: number | null;
  status: string;
  city: string | null;
  state: string | null;
  departments?: { name: string } | null;
  positions?: { name: string } | null;
}

export async function getEmployees(tenantId = TENANT): Promise<EmployeeRow[]> {
  if (!isSupabaseConfigured) return getMockEmployees();
  const db = getSupabaseAdminClient();
  if (!db) return getMockEmployees();

  const { data, error } = await db
    .from('employees')
    .select('*, departments(name), positions(name)')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('employee_code');

  if (error) { console.error('[employees.service]', error.message); return getMockEmployees(); }
  return (data ?? []) as EmployeeRow[];
}

export async function getEmployeeById(id: string, tenantId = TENANT): Promise<EmployeeRow | null> {
  if (!isSupabaseConfigured) {
    const e = mockEmployees.find(e => e.id === id);
    return e ? mockToRow(e) : null;
  }
  const db = getSupabaseAdminClient();
  if (!db) return null;

  const { data, error } = await db
    .from('employees')
    .select('*, departments(name), positions(name)')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as EmployeeRow;
}

// ── Mock bridge ──────────────────────────────────────────────────────────────

function getMockEmployees(): EmployeeRow[] {
  return mockEmployees
    .filter(e => !e.fechaEgreso)
    .map(mockToRow);
}

function mockToRow(e: (typeof mockEmployees)[0]): EmployeeRow {
  const [fn, ...ln] = e.name.split(' ');
  return {
    id: e.id,
    employee_code: `EMP-${e.empresa.legajo}`,
    first_name: fn,
    last_name: ln.join(' '),
    email: e.email,
    phone: e.personal.telefono || null,
    date_of_birth: e.personal.fechaNacimiento || null,
    gender: e.personal.sexo === 'Masculino' ? 'male' : 'female',
    department_id: null,
    position_id: null,
    manager_id: e.reportaA,
    employment_type: 'full_time',
    hire_date: e.empresa.fechaIngreso,
    salary: parseFloat(e.registracion.retribucionPactada) || null,
    status: 'active',
    city: e.personal.domicilio.localidad || null,
    state: e.personal.domicilio.provincia || null,
    departments: { name: e.empresa.sector },
    positions: { name: e.empresa.tarea },
  };
}
