-- ============================================================================
-- SEED: Datos Reales para Testing - ConectAr HR
-- Fecha: 2026-04-19
-- Empresa demo: ConectAr RRHH S.A. (el propio cliente)
-- IMPORTANTE: Ejecutar DESPUÉS de schema.sql y migrations/20260419_geolocation_branches.sql
-- ============================================================================

-- UUIDs fijos para referencia cruzada
-- Tenant:    'c0nec7ar-0001-0001-0001-000000000001'
-- Dept RRHH: 'c0nec7ar-dep1-0001-0001-000000000001'
-- etc.

-- ============================================================================
-- 1. TENANT: ConectAr RRHH S.A.
-- ============================================================================
INSERT INTO tenants (
  id, name, slug, description,
  country_code, timezone, currency,
  status, subscription_plan, subscription_status,
  max_employees, max_users, features
) VALUES (
  'c0nec7ar-0001-0001-0001-000000000001'::UUID,
  'ConectAr RRHH S.A.',
  'conectar-rrhh',
  'Plataforma integral de gestión de recursos humanos para empresas argentinas',
  'AR',
  'America/Argentina/Buenos_Aires',
  'ARS',
  'active',
  'enterprise',
  'active',
  200,
  50,
  jsonb_build_object(
    'payroll', true,
    'leave_management', true,
    'attendance_tracking', true,
    'geolocation_checkin', true,
    'performance_reviews', true,
    'training_programs', true,
    'document_management', true,
    'recruitment', true,
    'ai_assistant', true,
    'org_chart', true
  )
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  features = EXCLUDED.features,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 2. SUCURSALES (Branches)
-- ============================================================================
INSERT INTO branches (id, tenant_id, name, address, city, province, latitude, longitude, allowed_radius_meters, status)
VALUES
  (
    'c0nec7ar-bra1-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'Sede Central Buenos Aires',
    'Av. Corrientes 1234, Piso 8',
    'Ciudad Autónoma de Buenos Aires',
    'Buenos Aires',
    -34.6037,
    -58.3816,
    150,
    'active'
  ),
  (
    'c0nec7ar-bra2-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'Sucursal Rosario',
    'Córdoba 1080, Piso 3',
    'Rosario',
    'Santa Fe',
    -32.9442,
    -60.6507,
    100,
    'active'
  ),
  (
    'c0nec7ar-bra3-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'Sucursal Córdoba',
    'Hipólito Yrigoyen 220',
    'Córdoba',
    'Córdoba',
    -31.4135,
    -64.1811,
    100,
    'active'
  )
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ============================================================================
-- 3. ROLES
-- ============================================================================
INSERT INTO roles (id, tenant_id, name, description, is_system_role, role_type)
VALUES
  ('c0nec7ar-rol1-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Administrador', 'Acceso completo al sistema', true, 'admin'),
  ('c0nec7ar-rol2-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Gerente', 'Gestión de equipos y reportes', true, 'manager'),
  ('c0nec7ar-rol3-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Empleado', 'Acceso básico a portal personal', true, 'employee')
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ============================================================================
-- 4. DEPARTAMENTOS
-- ============================================================================
INSERT INTO departments (id, tenant_id, name, description, status, cost_center)
VALUES
  ('c0nec7ar-dep1-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Recursos Humanos', 'Gestión del capital humano', 'active', 'CC-RRHH'),
  ('c0nec7ar-dep2-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Tecnología e Innovación', 'Desarrollo y sistemas', 'active', 'CC-TECH'),
  ('c0nec7ar-dep3-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Ventas y Comercial', 'Gestión comercial y clientes', 'active', 'CC-VENTAS'),
  ('c0nec7ar-dep4-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Administración y Finanzas', 'Contabilidad y gestión financiera', 'active', 'CC-ADMIN'),
  ('c0nec7ar-dep5-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Operaciones', 'Logística y operaciones internas', 'active', 'CC-OPS')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. PUESTOS
-- ============================================================================
INSERT INTO positions (id, tenant_id, name, description, department_id, salary_range_min, salary_range_max, level, status)
VALUES
  -- RRHH
  ('c0nec7ar-pos1-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Gerente de RRHH', 'Liderazgo del área de RRHH', 'c0nec7ar-dep1-0001-0001-000000000001'::UUID, 450000, 700000, 'senior', 'active'),
  ('c0nec7ar-pos2-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Analista de RRHH', 'Gestión de procesos de RRHH', 'c0nec7ar-dep1-0001-0001-000000000001'::UUID, 200000, 350000, 'mid', 'active'),
  ('c0nec7ar-pos3-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Administrativo RRHH', 'Soporte administrativo', 'c0nec7ar-dep1-0001-0001-000000000001'::UUID, 130000, 200000, 'junior', 'active'),
  -- Tecnología
  ('c0nec7ar-pos4-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Gerente de Tecnología', 'CTO y liderazgo técnico', 'c0nec7ar-dep2-0001-0001-000000000001'::UUID, 600000, 950000, 'director', 'active'),
  ('c0nec7ar-pos5-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Desarrollador Full Stack', 'Desarrollo web y APIs', 'c0nec7ar-dep2-0001-0001-000000000001'::UUID, 280000, 550000, 'senior', 'active'),
  ('c0nec7ar-pos6-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Analista QA', 'Aseguramiento de calidad', 'c0nec7ar-dep2-0001-0001-000000000001'::UUID, 200000, 350000, 'mid', 'active'),
  -- Ventas
  ('c0nec7ar-pos7-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Gerente Comercial', 'Dirección de ventas', 'c0nec7ar-dep3-0001-0001-000000000001'::UUID, 500000, 800000, 'senior', 'active'),
  ('c0nec7ar-pos8-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Ejecutivo de Ventas', 'Captación y gestión de clientes', 'c0nec7ar-dep3-0001-0001-000000000001'::UUID, 180000, 320000, 'mid', 'active'),
  -- Admin
  ('c0nec7ar-pos9-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID, 'Contador General', 'Gestión contable y financiera', 'c0nec7ar-dep4-0001-0001-000000000001'::UUID, 350000, 600000, 'senior', 'active')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. TURNOS DE TRABAJO
-- ============================================================================
INSERT INTO work_shifts (id, tenant_id, name, description, start_time, end_time, break_duration, working_days, status)
VALUES
  (
    'c0nec7ar-shi1-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'Turno General',
    'Lunes a viernes de 9 a 18 hs',
    '09:00:00', '18:00:00', 60, '1,2,3,4,5', 'active'
  ),
  (
    'c0nec7ar-shi2-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'Turno Temprano',
    'Lunes a viernes de 7 a 16 hs',
    '07:00:00', '16:00:00', 60, '1,2,3,4,5', 'active'
  ),
  (
    'c0nec7ar-shi3-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'Turno Tarde',
    'Lunes a viernes de 14 a 23 hs',
    '14:00:00', '23:00:00', 60, '1,2,3,4,5', 'active'
  ),
  (
    'c0nec7ar-shi4-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'Home Office Flexible',
    'Horario flexible con core hours 10-16 hs',
    '10:00:00', '16:00:00', 30, '1,2,3,4,5', 'active'
  )
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ============================================================================
-- 7. USUARIOS (auth.users en Supabase — estos son los perfiles en public.users)
-- NOTA: Los UUIDs deben coincidir con los de auth.users creados en Supabase Auth.
--       En testing, crear estos usuarios en el dashboard de Supabase Auth primero.
-- ============================================================================
INSERT INTO users (id, tenant_id, email, first_name, last_name, phone, status, is_super_admin)
VALUES
  -- Admin principal
  ('c0nec7ar-usr1-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'eolmedo@conectarhr.net', 'Esteban', 'Olmedo', '+54 11 5555-0001', 'active', true),
  -- Gerente RRHH
  ('c0nec7ar-usr2-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'mgonzalez@conectarhr.net', 'María Elena', 'González', '+54 11 5555-0002', 'active', false),
  -- Gerente Tech
  ('c0nec7ar-usr3-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'jfernandez@conectarhr.net', 'Juan Pablo', 'Fernández', '+54 11 5555-0003', 'active', false),
  -- Gerente Comercial
  ('c0nec7ar-usr4-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'lrodriguez@conectarhr.net', 'Laura', 'Rodríguez', '+54 11 5555-0004', 'active', false),
  -- Empleados
  ('c0nec7ar-usr5-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'cmartinez@conectarhr.net', 'Carlos', 'Martínez', '+54 11 5555-0005', 'active', false),
  ('c0nec7ar-usr6-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'alopez@conectarhr.net', 'Analía', 'López', '+54 11 5555-0006', 'active', false),
  ('c0nec7ar-usr7-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'dpérez@conectarhr.net', 'Diego', 'Pérez', '+54 11 5555-0007', 'active', false),
  ('c0nec7ar-usr8-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'vsanchez@conectarhr.net', 'Valentina', 'Sánchez', '+54 341 5555-0008', 'active', false),
  ('c0nec7ar-usr9-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'rmorales@conectarhr.net', 'Ricardo', 'Morales', '+54 351 5555-0009', 'active', false)
ON CONFLICT (tenant_id, email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 8. EMPLEADOS
-- ============================================================================
INSERT INTO employees (
  id, tenant_id, user_id, employee_code,
  first_name, last_name, email, phone,
  date_of_birth, gender, nationality, id_type, id_number,
  department_id, position_id, manager_id,
  employment_type, hire_date, salary, salary_frequency,
  status, address, city, state, postal_code, country,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
) VALUES
  -- Esteban Olmedo (Admin / Owner)
  (
    'c0nec7ar-emp1-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'c0nec7ar-usr1-0001-0001-000000000001'::UUID,
    'EMP-001',
    'Esteban', 'Olmedo', 'eolmedo@conectarhr.net', '+54 11 5555-0001',
    '1983-07-15', 'male', 'Argentina', 'cuit', '20-83715234-9',
    'c0nec7ar-dep1-0001-0001-000000000001'::UUID,
    'c0nec7ar-pos1-0001-0001-000000000001'::UUID,
    NULL,
    'full_time', '2020-01-15', 750000, 'monthly',
    'active', 'Av. Rivadavia 4500 PB A', 'CABA', 'Buenos Aires', 'C1424', 'Argentina',
    'Patricia Olmedo', '+54 11 5555-9999', 'Cónyuge'
  ),
  -- María Elena González (Gerente RRHH)
  (
    'c0nec7ar-emp2-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'c0nec7ar-usr2-0001-0001-000000000001'::UUID,
    'EMP-002',
    'María Elena', 'González', 'mgonzalez@conectarhr.net', '+54 11 5555-0002',
    '1985-03-22', 'female', 'Argentina', 'dni', '28456789',
    'c0nec7ar-dep1-0001-0001-000000000001'::UUID,
    'c0nec7ar-pos1-0001-0001-000000000001'::UUID,
    'c0nec7ar-emp1-0001-0001-000000000001'::UUID,
    'full_time', '2021-03-01', 520000, 'monthly',
    'active', 'Mendoza 1234 Piso 2', 'CABA', 'Buenos Aires', 'C1428', 'Argentina',
    'Roberto González', '+54 11 5555-8888', 'Hermano'
  ),
  -- Juan Pablo Fernández (Gerente Tech)
  (
    'c0nec7ar-emp3-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'c0nec7ar-usr3-0001-0001-000000000001'::UUID,
    'EMP-003',
    'Juan Pablo', 'Fernández', 'jfernandez@conectarhr.net', '+54 11 5555-0003',
    '1988-11-08', 'male', 'Argentina', 'dni', '32178456',
    'c0nec7ar-dep2-0001-0001-000000000001'::UUID,
    'c0nec7ar-pos4-0001-0001-000000000001'::UUID,
    'c0nec7ar-emp1-0001-0001-000000000001'::UUID,
    'full_time', '2021-06-15', 680000, 'monthly',
    'active', 'Billinghurst 890 Dto 3A', 'CABA', 'Buenos Aires', 'C1174', 'Argentina',
    'Silvia Fernández', '+54 11 5555-7777', 'Madre'
  ),
  -- Laura Rodríguez (Gerente Comercial)
  (
    'c0nec7ar-emp4-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'c0nec7ar-usr4-0001-0001-000000000001'::UUID,
    'EMP-004',
    'Laura', 'Rodríguez', 'lrodriguez@conectarhr.net', '+54 11 5555-0004',
    '1986-05-14', 'female', 'Argentina', 'dni', '30234567',
    'c0nec7ar-dep3-0001-0001-000000000001'::UUID,
    'c0nec7ar-pos7-0001-0001-000000000001'::UUID,
    'c0nec7ar-emp1-0001-0001-000000000001'::UUID,
    'full_time', '2022-02-01', 590000, 'monthly',
    'active', 'Scalabrini Ortiz 2100 Piso 5', 'CABA', 'Buenos Aires', 'C1414', 'Argentina',
    'Marcelo Rodríguez', '+54 11 5555-6666', 'Padre'
  ),
  -- Carlos Martínez (Dev Full Stack)
  (
    'c0nec7ar-emp5-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'c0nec7ar-usr5-0001-0001-000000000001'::UUID,
    'EMP-005',
    'Carlos', 'Martínez', 'cmartinez@conectarhr.net', '+54 11 5555-0005',
    '1992-08-30', 'male', 'Argentina', 'dni', '37654321',
    'c0nec7ar-dep2-0001-0001-000000000001'::UUID,
    'c0nec7ar-pos5-0001-0001-000000000001'::UUID,
    'c0nec7ar-emp3-0001-0001-000000000001'::UUID,
    'full_time', '2022-08-01', 380000, 'monthly',
    'active', 'Thames 567 PB', 'CABA', 'Buenos Aires', 'C1414', 'Argentina',
    'Isabel Martínez', '+54 11 5555-5555', 'Madre'
  ),
  -- Analía López (Analista RRHH)
  (
    'c0nec7ar-emp6-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'c0nec7ar-usr6-0001-0001-000000000001'::UUID,
    'EMP-006',
    'Analía', 'López', 'alopez@conectarhr.net', '+54 11 5555-0006',
    '1994-02-17', 'female', 'Argentina', 'dni', '39876543',
    'c0nec7ar-dep1-0001-0001-000000000001'::UUID,
    'c0nec7ar-pos2-0001-0001-000000000001'::UUID,
    'c0nec7ar-emp2-0001-0001-000000000001'::UUID,
    'full_time', '2023-04-01', 250000, 'monthly',
    'active', 'Gurruchaga 345 Dto 7', 'CABA', 'Buenos Aires', 'C1414', 'Argentina',
    'Jorge López', '+54 11 5555-4444', 'Padre'
  ),
  -- Diego Pérez (Ejecutivo de Ventas)
  (
    'c0nec7ar-emp7-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'c0nec7ar-usr7-0001-0001-000000000001'::UUID,
    'EMP-007',
    'Diego', 'Pérez', 'dpérez@conectarhr.net', '+54 11 5555-0007',
    '1991-12-03', 'male', 'Argentina', 'dni', '36789012',
    'c0nec7ar-dep3-0001-0001-000000000001'::UUID,
    'c0nec7ar-pos8-0001-0001-000000000001'::UUID,
    'c0nec7ar-emp4-0001-0001-000000000001'::UUID,
    'full_time', '2023-01-15', 210000, 'monthly',
    'active', 'Corrientes 3456 Piso 1', 'CABA', 'Buenos Aires', 'C1193', 'Argentina',
    'Norma Pérez', '+54 11 5555-3333', 'Madre'
  ),
  -- Valentina Sánchez (Dev, Rosario)
  (
    'c0nec7ar-emp8-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'c0nec7ar-usr8-0001-0001-000000000001'::UUID,
    'EMP-008',
    'Valentina', 'Sánchez', 'vsanchez@conectarhr.net', '+54 341 5555-0008',
    '1996-06-25', 'female', 'Argentina', 'dni', '41234567',
    'c0nec7ar-dep2-0001-0001-000000000001'::UUID,
    'c0nec7ar-pos5-0001-0001-000000000001'::UUID,
    'c0nec7ar-emp3-0001-0001-000000000001'::UUID,
    'full_time', '2024-02-01', 320000, 'monthly',
    'active', 'San Martín 890 Piso 4 A', 'Rosario', 'Santa Fe', '2000', 'Argentina',
    'Héctor Sánchez', '+54 341 5555-2222', 'Padre'
  ),
  -- Ricardo Morales (Contador, Córdoba)
  (
    'c0nec7ar-emp9-0001-0001-000000000001'::UUID,
    'c0nec7ar-0001-0001-0001-000000000001'::UUID,
    'c0nec7ar-usr9-0001-0001-000000000001'::UUID,
    'EMP-009',
    'Ricardo', 'Morales', 'rmorales@conectarhr.net', '+54 351 5555-0009',
    '1987-09-11', 'male', 'Argentina', 'cuit', '20-87911234-5',
    'c0nec7ar-dep4-0001-0001-000000000001'::UUID,
    'c0nec7ar-pos9-0001-0001-000000000001'::UUID,
    'c0nec7ar-emp1-0001-0001-000000000001'::UUID,
    'full_time', '2021-09-01', 420000, 'monthly',
    'active', 'Deán Funes 456 Dto 2B', 'Córdoba', 'Córdoba', 'X5000', 'Argentina',
    'Elena Morales', '+54 351 5555-1111', 'Cónyuge'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. ASIGNACIÓN DE TURNOS
-- ============================================================================
INSERT INTO employee_shifts (tenant_id, employee_id, shift_id, effective_from)
SELECT
  'c0nec7ar-0001-0001-0001-000000000001'::UUID,
  e.id,
  CASE
    WHEN e.employee_code IN ('EMP-001', 'EMP-002', 'EMP-004') THEN 'c0nec7ar-shi1-0001-0001-000000000001'::UUID
    WHEN e.employee_code IN ('EMP-003', 'EMP-005', 'EMP-008') THEN 'c0nec7ar-shi4-0001-0001-000000000001'::UUID
    ELSE 'c0nec7ar-shi1-0001-0001-000000000001'::UUID
  END,
  '2026-01-01'
FROM employees e
WHERE e.tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'::UUID
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. TIPOS DE LICENCIAS
-- ============================================================================
INSERT INTO leave_types (id, tenant_id, name, description, code, default_days_per_year, is_paid, requires_approval, requires_medical_certificate, max_consecutive_days)
VALUES
  ('c0nec7ar-lt01-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'Vacaciones Anuales', 'Licencia anual remunerada según LCT', 'annual', 14, true, true, false, 21),
  ('c0nec7ar-lt02-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'Enfermedad', 'Licencia por enfermedad con certificado médico', 'sick', 30, true, true, true, 30),
  ('c0nec7ar-lt03-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'Maternidad', 'Licencia por maternidad (90 días LCT)', 'maternity', 90, true, true, true, 90),
  ('c0nec7ar-lt04-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'Paternidad', 'Licencia por paternidad (2 días LCT)', 'paternity', 2, true, true, false, 2),
  ('c0nec7ar-lt05-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'Duelo', 'Licencia por fallecimiento familiar', 'bereavement', 3, true, true, false, 5),
  ('c0nec7ar-lt06-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'Estudio/Examen', 'Días para rendir exámenes universitarios', 'study', 10, true, true, false, 2),
  ('c0nec7ar-lt07-0001-0001-000000000001'::UUID, 'c0nec7ar-0001-0001-0001-000000000001'::UUID,
   'Sin Goce de Sueldo', 'Licencia sin remuneración', 'unpaid', 30, false, true, false, 30)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- ============================================================================
-- 11. SALDOS DE LICENCIAS (año 2026)
-- ============================================================================
INSERT INTO leave_balances (tenant_id, employee_id, leave_type_id, year, total_days, used_days, approved_days)
SELECT
  'c0nec7ar-0001-0001-0001-000000000001'::UUID,
  e.id,
  lt.id,
  2026,
  lt.default_days_per_year,
  CASE lt.code
    WHEN 'annual' THEN FLOOR(RANDOM() * 5)
    WHEN 'sick'   THEN FLOOR(RANDOM() * 3)
    ELSE 0
  END,
  0
FROM employees e
CROSS JOIN leave_types lt
WHERE e.tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'::UUID
  AND lt.tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'::UUID
  AND lt.code IN ('annual', 'sick', 'study')
ON CONFLICT (tenant_id, employee_id, leave_type_id, year) DO NOTHING;

-- ============================================================================
-- 12. REGISTROS DE ASISTENCIA - Abril 2026 (días hábiles)
-- ============================================================================
-- Genera asistencia para los días hábiles de abril 2026 (1-18)
-- Los empleados de Buenos Aires fichan en Sede Central
-- Valentina ficha en Sucursal Rosario, Ricardo en Sucursal Córdoba

DO $$
DECLARE
  v_date DATE;
  v_emp RECORD;
  v_check_in TIMESTAMP WITH TIME ZONE;
  v_check_out TIMESTAMP WITH TIME ZONE;
  v_late_min INTEGER;
  v_status VARCHAR(20);
  v_branch_id UUID;
  v_lat DECIMAL(10,7);
  v_lon DECIMAL(10,7);
BEGIN
  FOR v_date IN
    SELECT d::DATE FROM generate_series('2026-04-01'::DATE, '2026-04-18'::DATE, '1 day'::INTERVAL) d
    WHERE EXTRACT(DOW FROM d) NOT IN (0, 6) -- excluir sábado y domingo
  LOOP
    FOR v_emp IN
      SELECT id, employee_code FROM employees
      WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'::UUID
    LOOP
      -- Ausencias esporádicas (~10% de probabilidad)
      IF RANDOM() < 0.10 THEN
        INSERT INTO attendance (tenant_id, employee_id, date, status, check_in_method)
        VALUES (
          'c0nec7ar-0001-0001-0001-000000000001'::UUID,
          v_emp.id, v_date, 'absent', 'geo'
        ) ON CONFLICT DO NOTHING;
        CONTINUE;
      END IF;

      -- Sucursal y coordenadas según empleado
      IF v_emp.employee_code = 'EMP-008' THEN
        v_branch_id := 'c0nec7ar-bra2-0001-0001-000000000001'::UUID;
        v_lat := -32.9442 + (RANDOM() - 0.5) * 0.0005;
        v_lon := -60.6507 + (RANDOM() - 0.5) * 0.0005;
      ELSIF v_emp.employee_code = 'EMP-009' THEN
        v_branch_id := 'c0nec7ar-bra3-0001-0001-000000000001'::UUID;
        v_lat := -31.4135 + (RANDOM() - 0.5) * 0.0005;
        v_lon := -64.1811 + (RANDOM() - 0.5) * 0.0005;
      ELSE
        v_branch_id := 'c0nec7ar-bra1-0001-0001-000000000001'::UUID;
        v_lat := -34.6037 + (RANDOM() - 0.5) * 0.0005;
        v_lon := -58.3816 + (RANDOM() - 0.5) * 0.0005;
      END IF;

      -- Hora de entrada (puntual o con retraso)
      v_late_min := 0;
      v_status := 'present';
      IF RANDOM() < 0.15 THEN
        -- Tarde entre 5 y 30 min
        v_late_min := 5 + FLOOR(RANDOM() * 25);
        v_status := 'late';
      END IF;

      v_check_in := (v_date + TIME '09:00:00' + (v_late_min || ' minutes')::INTERVAL)
                    AT TIME ZONE 'America/Argentina/Buenos_Aires';
      v_check_out := (v_date + TIME '18:00:00' + ((RANDOM() - 0.5) * 30 || ' minutes')::INTERVAL)
                     AT TIME ZONE 'America/Argentina/Buenos_Aires';

      INSERT INTO attendance (
        tenant_id, employee_id, date,
        check_in_time, check_out_time,
        check_in_method, check_out_method,
        check_in_location, check_out_location,
        check_in_latitude, check_in_longitude,
        check_out_latitude, check_out_longitude,
        branch_id, status, late_minutes,
        working_hours, notes
      ) VALUES (
        'c0nec7ar-0001-0001-0001-000000000001'::UUID,
        v_emp.id,
        v_date,
        v_check_in,
        v_check_out,
        'geo', 'geo',
        (SELECT name FROM branches WHERE id = v_branch_id),
        (SELECT name FROM branches WHERE id = v_branch_id),
        v_lat, v_lon,
        v_lat + (RANDOM() - 0.5) * 0.0001,
        v_lon + (RANDOM() - 0.5) * 0.0001,
        v_branch_id,
        v_status,
        v_late_min,
        ROUND(EXTRACT(EPOCH FROM (v_check_out - v_check_in)) / 3600.0 - 1.0, 2),
        NULL
      ) ON CONFLICT (tenant_id, employee_id, date) DO NOTHING;

    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
SELECT 'Tenants'    AS tabla, COUNT(*) AS registros FROM tenants    WHERE id = 'c0nec7ar-0001-0001-0001-000000000001'::UUID
UNION ALL
SELECT 'Branches',   COUNT(*) FROM branches   WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'::UUID
UNION ALL
SELECT 'Employees',  COUNT(*) FROM employees  WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'::UUID
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'::UUID
UNION ALL
SELECT 'Leave Types',COUNT(*) FROM leave_types WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'::UUID
UNION ALL
SELECT 'Leave Balances', COUNT(*) FROM leave_balances WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'::UUID;
