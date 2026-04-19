-- ============================================================
-- ConectAr HR — Employee Directory Schema
-- Migration: 20260420_employee_directory
-- ============================================================

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  code            TEXT,
  parent_id       UUID REFERENCES departments(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Job positions / roles
CREATE TABLE IF NOT EXISTS positions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  department_id   UUID REFERENCES departments(id),
  level           TEXT CHECK (level IN ('director', 'manager', 'supervisor', 'analyst', 'staff', 'intern')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Main employees table
CREATE TABLE IF NOT EXISTS employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,

  -- Personal
  birth_date      DATE,
  nationality     TEXT DEFAULT 'Argentina',
  gender          TEXT CHECK (gender IN ('Masculino', 'Femenino', 'Otro', 'No especificado')),
  marital_status  TEXT,
  cuil            TEXT,
  dni             TEXT,
  blood_type      TEXT,

  -- Address
  address_street  TEXT,
  address_number  TEXT,
  address_floor   TEXT,
  address_unit    TEXT,
  address_city    TEXT,
  address_province TEXT,
  address_zip     TEXT,

  -- Employment
  employee_code   TEXT,
  hire_date       DATE,
  termination_date DATE,
  department_id   UUID REFERENCES departments(id),
  position_id     UUID REFERENCES positions(id),
  reports_to      UUID REFERENCES employees(id),
  employment_type TEXT CHECK (employment_type IN ('Tiempo Indeterminado', 'Tiempo Determinado', 'Pasantía', 'Contrato de Obra', 'Autónomo')),
  work_mode       TEXT CHECK (work_mode IN ('Presencial', 'Remoto', 'Híbrido')),
  branch_id       UUID REFERENCES branches(id),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),

  -- Registration / payroll
  obra_social_codigo  TEXT,
  obra_social_nombre  TEXT,
  art                 TEXT,
  regimen             TEXT DEFAULT 'SIPA',
  convenio_colectivo  TEXT,
  salary              NUMERIC(14, 2),
  salary_currency     TEXT DEFAULT 'ARS',
  payment_mode        TEXT DEFAULT 'Mensual',

  -- Banking
  bank_name       TEXT,
  bank_account    TEXT,
  bank_cbu        TEXT,
  bank_alias      TEXT,

  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, email),
  UNIQUE (tenant_id, employee_code)
);

-- Employee custom fields (key-value per employee)
CREATE TABLE IF NOT EXISTS employee_custom_fields (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  field_name      TEXT NOT NULL,
  field_value     TEXT,
  UNIQUE (employee_id, field_name)
);

-- Employee documents (attached files)
CREATE TABLE IF NOT EXISTS employee_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_type   TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_url        TEXT NOT NULL,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by     UUID
);

-- Work schedules per employee per day
CREATE TABLE IF NOT EXISTS employee_schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week     TEXT NOT NULL CHECK (day_of_week IN ('lunes','martes','miercoles','jueves','viernes','sabado','domingo')),
  works           BOOLEAN NOT NULL DEFAULT true,
  branch_id       UUID REFERENCES branches(id),
  start_time      TIME,
  end_time        TIME,
  UNIQUE (employee_id, day_of_week)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_employees_tenant     ON employees (tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees (department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status     ON employees (status);
CREATE INDEX IF NOT EXISTS idx_employees_reports_to ON employees (reports_to);
CREATE INDEX IF NOT EXISTS idx_departments_tenant   ON departments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_positions_tenant     ON positions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_emp_docs_employee    ON employee_documents (employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_schedules_emp    ON employee_schedules (employee_id);

-- ─── updated_at triggers ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE employees              ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_schedules     ENABLE ROW LEVEL SECURITY;

-- Helpers: extract tenant from JWT claim
CREATE OR REPLACE FUNCTION auth_tenant_id() RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT (auth.jwt() ->> 'tenant_id')::UUID;
$$;

-- employees: tenant isolation + employees can only see themselves
CREATE POLICY "employees_tenant_isolation" ON employees
  FOR ALL USING (tenant_id = auth_tenant_id());

CREATE POLICY "departments_tenant_isolation" ON departments
  FOR ALL USING (tenant_id = auth_tenant_id());

CREATE POLICY "positions_tenant_isolation" ON positions
  FOR ALL USING (tenant_id = auth_tenant_id());

CREATE POLICY "emp_custom_fields_via_employee" ON employee_custom_fields
  FOR ALL USING (
    employee_id IN (SELECT id FROM employees WHERE tenant_id = auth_tenant_id())
  );

CREATE POLICY "emp_documents_tenant" ON employee_documents
  FOR ALL USING (tenant_id = auth_tenant_id());

CREATE POLICY "emp_schedules_via_employee" ON employee_schedules
  FOR ALL USING (
    employee_id IN (SELECT id FROM employees WHERE tenant_id = auth_tenant_id())
  );

-- ─── Demo seed data ───────────────────────────────────────────────────────────

DO $$
DECLARE
  v_tenant_id UUID := 'c0nec7ar-0001-0001-0001-000000000001';
  v_branch_id UUID;
  v_dept_dir UUID;
  v_dept_rrhh UUID;
  v_dept_tech UUID;
  v_dept_ventas UUID;
  v_dept_compras UUID;
  v_dept_produccion UUID;
  v_dept_finanzas UUID;
  v_dept_admin UUID;
BEGIN
  -- Get main branch id
  SELECT id INTO v_branch_id FROM branches WHERE tenant_id = v_tenant_id AND name ILIKE '%Central%' LIMIT 1;

  -- Departments
  INSERT INTO departments (id, tenant_id, name, code) VALUES
    (gen_random_uuid(), v_tenant_id, 'Dirección General',   'DIR')   RETURNING id INTO v_dept_dir;
  INSERT INTO departments (id, tenant_id, name, code, parent_id) VALUES
    (gen_random_uuid(), v_tenant_id, 'Recursos Humanos',    'RRHH',  v_dept_dir) RETURNING id INTO v_dept_rrhh;
  INSERT INTO departments (id, tenant_id, name, code, parent_id) VALUES
    (gen_random_uuid(), v_tenant_id, 'Tecnología',          'TECH',  v_dept_dir) RETURNING id INTO v_dept_tech;
  INSERT INTO departments (id, tenant_id, name, code, parent_id) VALUES
    (gen_random_uuid(), v_tenant_id, 'Ventas',              'VENT',  v_dept_dir) RETURNING id INTO v_dept_ventas;
  INSERT INTO departments (id, tenant_id, name, code, parent_id) VALUES
    (gen_random_uuid(), v_tenant_id, 'Compras',             'COMP',  v_dept_dir) RETURNING id INTO v_dept_compras;
  INSERT INTO departments (id, tenant_id, name, code, parent_id) VALUES
    (gen_random_uuid(), v_tenant_id, 'Producción',          'PROD',  v_dept_dir) RETURNING id INTO v_dept_produccion;
  INSERT INTO departments (id, tenant_id, name, code, parent_id) VALUES
    (gen_random_uuid(), v_tenant_id, 'Finanzas',            'FIN',   v_dept_dir) RETURNING id INTO v_dept_finanzas;
  INSERT INTO departments (id, tenant_id, name, code, parent_id) VALUES
    (gen_random_uuid(), v_tenant_id, 'Administración',      'ADM',   v_dept_dir) RETURNING id INTO v_dept_admin;

  -- Sample employees
  INSERT INTO employees (tenant_id, full_name, email, employee_code, hire_date, department_id, employment_type, work_mode, branch_id, salary, status)
  VALUES
    (v_tenant_id, 'Directorio General',       'directorio@example.com',        'EMP-000', '2019-01-01', v_dept_dir,       'Tiempo Indeterminado', 'Presencial', v_branch_id, 0,         'active'),
    (v_tenant_id, 'Secretaria',               'secretaria@example.com',        'EMP-001', '2020-01-10', v_dept_admin,     'Tiempo Indeterminado', 'Híbrido',    v_branch_id, 950000,    'active'),
    (v_tenant_id, 'Asesor Fiscal',            'asesor@example.com',            'EMP-002', '2019-07-20', v_dept_finanzas,  'Tiempo Indeterminado', 'Presencial', v_branch_id, 2500000,   'active'),
    (v_tenant_id, 'Director de Compras',      'compras@example.com',           'EMP-003', '2020-09-10', v_dept_compras,   'Tiempo Indeterminado', 'Presencial', v_branch_id, 800000,    'active'),
    (v_tenant_id, 'Director de Producción',   'produccion@example.com',        'EMP-004', '2023-02-15', v_dept_produccion,'Tiempo Indeterminado', 'Híbrido',    v_branch_id, 650000,    'active'),
    (v_tenant_id, 'Director de Ventas',       'ventas@example.com',            'EMP-005', '2017-08-01', v_dept_ventas,    'Tiempo Indeterminado', 'Presencial', v_branch_id, 1200000,   'active'),
    (v_tenant_id, 'Director de RRHH',         'rrhh@example.com',              'EMP-006', '2022-05-02', v_dept_rrhh,      'Tiempo Indeterminado', 'Presencial', v_branch_id, 700000,    'active'),
    (v_tenant_id, 'Jefe de Facturación',      'facturacion@example.com',       'EMP-007', '2018-04-01', v_dept_compras,   'Tiempo Indeterminado', 'Presencial', v_branch_id, 2800000,   'active'),
    (v_tenant_id, 'Empleado Albaranes',       'albaranes@example.com',         'EMP-008', '2018-08-22', v_dept_compras,   'Tiempo Indeterminado', 'Híbrido',    v_branch_id, 1100000,   'active'),
    (v_tenant_id, 'Analista de Marketing',    'marketing@example.com',         'EMP-009', '2021-03-03', v_dept_produccion,'Tiempo Indeterminado', 'Híbrido',    v_branch_id, 650000,    'active'),
    (v_tenant_id, 'Desarrollador Backend',    'backend@example.com',           'EMP-010', '2022-06-15', v_dept_tech,      'Tiempo Indeterminado', 'Remoto',     NULL,        1800000,   'active'),
    (v_tenant_id, 'Diseñadora UX/UI',         'uxdesign@example.com',          'EMP-011', '2023-09-01', v_dept_tech,      'Tiempo Indeterminado', 'Híbrido',    v_branch_id, 950000,    'active'),
    (v_tenant_id, 'Ejecutivo de Cuentas',     'cuentas@example.com',           'EMP-012', '2019-01-10', v_dept_ventas,    'Tiempo Indeterminado', 'Presencial', v_branch_id, 1100000,   'active'),
    (v_tenant_id, 'Analista de RRHH',         'analistaRRHH@example.com',      'EMP-013', '2023-05-05', v_dept_rrhh,      'Tiempo Indeterminado', 'Presencial', v_branch_id, 600000,    'active'),
    (v_tenant_id, 'Responsable de Logística', 'logistica@example.com',         'EMP-014', '2017-11-20', v_dept_compras,   'Tiempo Indeterminado', 'Presencial', v_branch_id, 1400000,   'active'),
    (v_tenant_id, 'Tesorera',                 'tesoreria@example.com',         'EMP-015', '2020-02-12', v_dept_finanzas,  'Tiempo Indeterminado', 'Presencial', v_branch_id, 1600000,   'active'),
    (v_tenant_id, 'Vendedor Regional',        'ventas.regional@example.com',   'EMP-016', '2021-07-01', v_dept_ventas,    'Tiempo Indeterminado', 'Presencial', NULL,        900000,    'active'),
    (v_tenant_id, 'Coordinadora de Producción','coord.produccion@example.com', 'EMP-017', '2020-08-08', v_dept_produccion,'Tiempo Indeterminado', 'Presencial', NULL,        1200000,   'active'),
    (v_tenant_id, 'Asistente Administrativo', 'asistente.admin@example.com',   'EMP-018', '2024-01-03', v_dept_admin,     'Tiempo Determinado',   'Presencial', v_branch_id, 480000,    'active');

  RAISE NOTICE 'Employee directory seed completed for tenant %', v_tenant_id;
END $$;
