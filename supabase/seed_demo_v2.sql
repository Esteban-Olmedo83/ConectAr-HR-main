-- ============================================================
-- ConectAr HR — Demo Full Seed v2
-- Empresa: ConectAr RRHH S.A. (banco de pruebas del propietario)
-- Tenant:  c0nec7ar-0001-0001-0001-000000000001
-- 20 empleados + asistencia + licencias + nómina + reclutamiento
--
-- EJECUTAR DESPUÉS DE:
--   schema.sql  (o migrations en orden)
--   migrations/20260419_geolocation_branches.sql
--   migrations/20260420_employee_directory.sql  (si aplica)
--   migrations/20260421_tenant_modules_security.sql
--   migrations/20260422_client_invitations.sql
--   migrations/20260511_recruitment.sql
-- ============================================================

BEGIN;

-- ── Constantes de referencia ──────────────────────────────────────────────
-- Tenant
\set TENANT 'c0nec7ar-0001-0001-0001-000000000001'
-- Sucursales
\set BRA_BA  'c0nec7ar-bra1-0001-0001-000000000001'
\set BRA_ROS 'c0nec7ar-bra2-0001-0001-000000000001'
\set BRA_COR 'c0nec7ar-bra3-0001-0001-000000000001'

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TENANT
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO tenants (
  id, name, slug, description,
  country_code, timezone, currency,
  status, subscription_plan, subscription_status,
  max_employees, max_users, features
) VALUES (
  'c0nec7ar-0001-0001-0001-000000000001',
  'ConectAr RRHH S.A.',
  'conectar-rrhh',
  'Plataforma integral de gestión de recursos humanos para empresas argentinas',
  'AR', 'America/Argentina/Buenos_Aires', 'ARS',
  'active', 'enterprise', 'active', 200, 50,
  '{"payroll":true,"leave_management":true,"attendance_tracking":true,
    "geolocation_checkin":true,"performance_reviews":true,"training_programs":true,
    "document_management":true,"recruitment":true,"ai_assistant":true,"org_chart":true}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, features = EXCLUDED.features, updated_at = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SUCURSALES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO branches (id, tenant_id, name, address, city, province, latitude, longitude, allowed_radius_meters, status)
VALUES
  ('c0nec7ar-bra1-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001',
   'Sede Central Buenos Aires','Av. Corrientes 1234, Piso 8','Buenos Aires','Buenos Aires',-34.6037,-58.3816,150,'active'),
  ('c0nec7ar-bra2-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001',
   'Sucursal Rosario','Córdoba 1080, Piso 3','Rosario','Santa Fe',-32.9442,-60.6507,100,'active'),
  ('c0nec7ar-bra3-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001',
   'Sucursal Córdoba','Hipólito Yrigoyen 220','Córdoba','Córdoba',-31.4135,-64.1811,100,'active')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. DEPARTAMENTOS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO departments (id, tenant_id, name, description, status, cost_center)
VALUES
  ('c0nec7ar-dep1-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Dirección General',        'CEO y alta dirección',                  'active','CC-DIR'),
  ('c0nec7ar-dep2-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Recursos Humanos',         'Gestión del capital humano',            'active','CC-RRHH'),
  ('c0nec7ar-dep3-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Tecnología e Innovación',  'Desarrollo, QA y diseño digital',       'active','CC-TECH'),
  ('c0nec7ar-dep4-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Ventas y Comercial',       'Captación y gestión de clientes',       'active','CC-VTAS'),
  ('c0nec7ar-dep5-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Administración y Finanzas','Contabilidad y gestión financiera',     'active','CC-FIN'),
  ('c0nec7ar-dep6-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Operaciones',              'Logística y operaciones internas',      'active','CC-OPS'),
  ('c0nec7ar-dep7-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Marketing',                'Marca, contenidos y comunicaciones',    'active','CC-MKT')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. PUESTOS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO positions (id, tenant_id, name, description, department_id, salary_range_min, salary_range_max, level, status)
VALUES
  -- Dirección
  ('c0nec7ar-ps01-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Director General','CEO','c0nec7ar-dep1-0001-0001-000000000001',1200000,2000000,'director','active'),
  -- RRHH
  ('c0nec7ar-ps02-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Gerente de RRHH','Liderazgo del área','c0nec7ar-dep2-0001-0001-000000000001',700000,1100000,'senior','active'),
  ('c0nec7ar-ps03-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Analista RRHH Sr.','Gestión de procesos','c0nec7ar-dep2-0001-0001-000000000001',320000,520000,'mid','active'),
  ('c0nec7ar-ps04-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Analista RRHH Jr.','Soporte de procesos','c0nec7ar-dep2-0001-0001-000000000001',200000,320000,'junior','active'),
  -- Tecnología
  ('c0nec7ar-ps05-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','CTO','Gerente de Tecnología','c0nec7ar-dep3-0001-0001-000000000001',1000000,1600000,'director','active'),
  ('c0nec7ar-ps06-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Desarrollador/a Full Stack','Desarrollo web y APIs','c0nec7ar-dep3-0001-0001-000000000001',450000,780000,'senior','active'),
  ('c0nec7ar-ps07-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Desarrollador/a Backend','Backend y microservicios','c0nec7ar-dep3-0001-0001-000000000001',400000,700000,'mid','active'),
  ('c0nec7ar-ps08-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Analista QA','Aseguramiento de calidad','c0nec7ar-dep3-0001-0001-000000000001',300000,500000,'mid','active'),
  ('c0nec7ar-ps09-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Diseñador/a UX/UI','Diseño de experiencia','c0nec7ar-dep3-0001-0001-000000000001',350000,600000,'mid','active'),
  -- Ventas
  ('c0nec7ar-ps10-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Gerente Comercial','Dirección de ventas','c0nec7ar-dep4-0001-0001-000000000001',800000,1200000,'senior','active'),
  ('c0nec7ar-ps11-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Ejecutivo/a de Ventas','Captación de clientes','c0nec7ar-dep4-0001-0001-000000000001',250000,450000,'mid','active'),
  -- Finanzas
  ('c0nec7ar-ps12-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Contador General','Gestión contable','c0nec7ar-dep5-0001-0001-000000000001',750000,1100000,'senior','active'),
  ('c0nec7ar-ps13-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Analista Financiero','Análisis y reportes','c0nec7ar-dep5-0001-0001-000000000001',250000,420000,'mid','active'),
  -- Operaciones
  ('c0nec7ar-ps14-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Jefe de Operaciones','Dirección operativa','c0nec7ar-dep6-0001-0001-000000000001',580000,860000,'senior','active'),
  ('c0nec7ar-ps15-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Administrativa/o','Soporte administrativo','c0nec7ar-dep6-0001-0001-000000000001',200000,340000,'junior','active'),
  ('c0nec7ar-ps16-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Analista de Operaciones','Procesos y mejora continua','c0nec7ar-dep6-0001-0001-000000000001',230000,380000,'mid','active'),
  -- Marketing
  ('c0nec7ar-ps17-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Jefe de Marketing','Estrategia de marca','c0nec7ar-dep7-0001-0001-000000000001',550000,850000,'senior','active'),
  ('c0nec7ar-ps18-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Analista de Marketing Jr.','Contenidos y redes','c0nec7ar-dep7-0001-0001-000000000001',140000,250000,'junior','active')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TURNOS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO work_shifts (id, tenant_id, name, start_time, end_time, break_duration, working_days, status)
VALUES
  ('c0nec7ar-sh1-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Turno General',    '09:00','18:00',60,'1,2,3,4,5','active'),
  ('c0nec7ar-sh2-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Home Office Flex', '10:00','19:00',30,'1,2,3,4,5','active'),
  ('c0nec7ar-sh3-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Turno Temprano',   '07:00','16:00',60,'1,2,3,4,5','active')
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ROLES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO roles (id, tenant_id, name, description, is_system_role, role_type)
VALUES
  ('c0nec7ar-ro1-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Administrador','Acceso completo',         true,'admin'),
  ('c0nec7ar-ro2-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Gerente',      'Gestión de equipos',      true,'manager'),
  ('c0nec7ar-ro3-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Empleado',     'Acceso a portal personal',true,'employee')
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. USUARIOS (profiles en public.users — deben existir en auth.users)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO users (id, tenant_id, email, first_name, last_name, phone, status, is_super_admin)
VALUES
  ('c0nec7ar-u01-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','eolmedo@conectarhr.net',    'Esteban',     'Olmedo',     '+54 9 11 5555-0001','active',true),
  ('c0nec7ar-u02-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','mgonzalez@conectarhr.net',  'María Elena', 'González',   '+54 9 11 5555-0002','active',false),
  ('c0nec7ar-u03-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','jfernandez@conectarhr.net', 'Juan Pablo',  'Fernández',  '+54 9 11 5555-0003','active',false),
  ('c0nec7ar-u04-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','lrodriguez@conectarhr.net', 'Laura',       'Rodríguez',  '+54 9 11 5555-0004','active',false),
  ('c0nec7ar-u05-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','rmorales@conectarhr.net',   'Ricardo',     'Morales',    '+54 9 351 5555-0005','active',false),
  ('c0nec7ar-u06-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','maguirre@conectarhr.net',   'Marcelo',     'Aguirre',    '+54 9 11 5555-0006','active',false),
  ('c0nec7ar-u07-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','storres@conectarhr.net',    'Sebastián',   'Torres',     '+54 9 11 5555-0007','active',false),
  ('c0nec7ar-u08-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','agarcia@conectarhr.net',    'Ana',         'García',     '+54 9 11 5555-0008','active',false),
  ('c0nec7ar-u09-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','cmartinez@conectarhr.net',  'Carlos',      'Martínez',   '+54 9 11 5555-0009','active',false),
  ('c0nec7ar-u10-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','vsanchez@conectarhr.net',   'Valentina',   'Sánchez',    '+54 9 341 5555-0010','active',false),
  ('c0nec7ar-u11-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','rblanco@conectarhr.net',    'Ramiro',      'Blanco',     '+54 9 11 5555-0011','active',false),
  ('c0nec7ar-u12-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','fibanez@conectarhr.net',    'Florencia',   'Ibáñez',     '+54 9 11 5555-0012','active',false),
  ('c0nec7ar-u13-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','lpereyra@conectarhr.net',   'Luciana',     'Pereyra',    '+54 9 11 5555-0013','active',false),
  ('c0nec7ar-u14-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','dperez@conectarhr.net',     'Diego',       'Pérez',      '+54 9 11 5555-0014','active',false),
  ('c0nec7ar-u15-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','nvega@conectarhr.net',      'Natalia',     'Vega',       '+54 9 11 5555-0015','active',false),
  ('c0nec7ar-u16-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','pmolina@conectarhr.net',    'Pablo',       'Molina',     '+54 9 341 5555-0016','active',false),
  ('c0nec7ar-u17-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','tcastro@conectarhr.net',    'Tomás',       'Castro',     '+54 9 11 5555-0017','active',false),
  ('c0nec7ar-u18-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','psuarez@conectarhr.net',    'Paola',       'Suárez',     '+54 9 11 5555-0018','active',false),
  ('c0nec7ar-u19-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','gherrera@conectarhr.net',   'Gabriela',    'Herrera',    '+54 9 11 5555-0019','active',false),
  ('c0nec7ar-u20-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','iacosta@conectarhr.net',    'Inés',        'Acosta',     '+54 9 11 5555-0020','active',false)
ON CONFLICT (tenant_id, email) DO UPDATE SET first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, updated_at=NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. EMPLEADOS (20)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO employees (
  id, tenant_id, user_id, employee_code,
  first_name, last_name, email, phone,
  date_of_birth, gender, nationality, id_type, id_number,
  department_id, position_id, manager_id,
  employment_type, hire_date, salary, salary_frequency,
  status, address, city, state, postal_code, country,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
) VALUES
  -- 01 Esteban Olmedo · CEO
  ('c0nec7ar-e01-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u01-0001-0001-000000000001','EMP-001',
   'Esteban','Olmedo','eolmedo@conectarhr.net','+54 9 11 5555-0001',
   '1983-07-15','male','Argentina','cuit','20-83715234-9',
   'c0nec7ar-dep1-0001-0001-000000000001','c0nec7ar-ps01-0001-0001-000000000001',NULL,
   'full_time','2020-01-15',1500000,'monthly',
   'active','Av. Rivadavia 4500 PB A','CABA','Buenos Aires','C1424','Argentina',
   'Patricia Olmedo','+54 9 11 5555-9901','Cónyuge'),

  -- 02 María Elena González · Gerente RRHH
  ('c0nec7ar-e02-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u02-0001-0001-000000000001','EMP-002',
   'María Elena','González','mgonzalez@conectarhr.net','+54 9 11 5555-0002',
   '1985-03-22','female','Argentina','dni','28456789',
   'c0nec7ar-dep2-0001-0001-000000000001','c0nec7ar-ps02-0001-0001-000000000001','c0nec7ar-e01-0001-0001-000000000001',
   'full_time','2021-03-01',850000,'monthly',
   'active','Mendoza 1234 Piso 2','CABA','Buenos Aires','C1428','Argentina',
   'Roberto González','+54 9 11 5555-9902','Hermano'),

  -- 03 Juan Pablo Fernández · CTO
  ('c0nec7ar-e03-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u03-0001-0001-000000000001','EMP-003',
   'Juan Pablo','Fernández','jfernandez@conectarhr.net','+54 9 11 5555-0003',
   '1988-11-08','male','Argentina','dni','32178456',
   'c0nec7ar-dep3-0001-0001-000000000001','c0nec7ar-ps05-0001-0001-000000000001','c0nec7ar-e01-0001-0001-000000000001',
   'full_time','2021-06-15',1200000,'monthly',
   'active','Billinghurst 890 Dto 3A','CABA','Buenos Aires','C1174','Argentina',
   'Silvia Fernández','+54 9 11 5555-9903','Madre'),

  -- 04 Laura Rodríguez · Gerente Comercial
  ('c0nec7ar-e04-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u04-0001-0001-000000000001','EMP-004',
   'Laura','Rodríguez','lrodriguez@conectarhr.net','+54 9 11 5555-0004',
   '1986-05-14','female','Argentina','dni','30234567',
   'c0nec7ar-dep4-0001-0001-000000000001','c0nec7ar-ps10-0001-0001-000000000001','c0nec7ar-e01-0001-0001-000000000001',
   'full_time','2022-02-01',950000,'monthly',
   'active','Scalabrini Ortiz 2100 Piso 5','CABA','Buenos Aires','C1414','Argentina',
   'Marcelo Rodríguez','+54 9 11 5555-9904','Padre'),

  -- 05 Ricardo Morales · Contador
  ('c0nec7ar-e05-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u05-0001-0001-000000000001','EMP-005',
   'Ricardo','Morales','rmorales@conectarhr.net','+54 9 351 5555-0005',
   '1987-09-11','male','Argentina','cuit','20-31234567-8',
   'c0nec7ar-dep5-0001-0001-000000000001','c0nec7ar-ps12-0001-0001-000000000001','c0nec7ar-e01-0001-0001-000000000001',
   'full_time','2021-09-01',980000,'monthly',
   'active','Deán Funes 456 Dto 2B','Córdoba','Córdoba','X5000','Argentina',
   'Elena Morales','+54 9 351 5555-9905','Cónyuge'),

  -- 06 Marcelo Aguirre · Jefe Ops
  ('c0nec7ar-e06-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u06-0001-0001-000000000001','EMP-006',
   'Marcelo','Aguirre','maguirre@conectarhr.net','+54 9 11 5555-0006',
   '1982-04-03','male','Argentina','dni','27890123',
   'c0nec7ar-dep6-0001-0001-000000000001','c0nec7ar-ps14-0001-0001-000000000001','c0nec7ar-e01-0001-0001-000000000001',
   'full_time','2020-03-10',720000,'monthly',
   'active','Av. San Martín 3400','CABA','Buenos Aires','C1416','Argentina',
   'Norma Aguirre','+54 9 11 5555-9906','Madre'),

  -- 07 Sebastián Torres · Jefe Marketing
  ('c0nec7ar-e07-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u07-0001-0001-000000000001','EMP-007',
   'Sebastián','Torres','storres@conectarhr.net','+54 9 11 5555-0007',
   '1990-12-19','male','Argentina','dni','35678901',
   'c0nec7ar-dep7-0001-0001-000000000001','c0nec7ar-ps17-0001-0001-000000000001','c0nec7ar-e01-0001-0001-000000000001',
   'full_time','2022-07-01',680000,'monthly',
   'active','Guatemala 5678 Piso 1 A','CABA','Buenos Aires','C1414','Argentina',
   'Andrea Torres','+54 9 11 5555-9907','Hermana'),

  -- 08 Ana García · Analista RRHH Sr.
  ('c0nec7ar-e08-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u08-0001-0001-000000000001','EMP-008',
   'Ana','García','agarcia@conectarhr.net','+54 9 11 5555-0008',
   '1993-06-07','female','Argentina','dni','37654321',
   'c0nec7ar-dep2-0001-0001-000000000001','c0nec7ar-ps03-0001-0001-000000000001','c0nec7ar-e02-0001-0001-000000000001',
   'full_time','2022-08-01',420000,'monthly',
   'active','Thames 567 PB','CABA','Buenos Aires','C1414','Argentina',
   'Jorge García','+54 9 11 5555-9908','Padre'),

  -- 09 Carlos Martínez · Analista RRHH Jr.
  ('c0nec7ar-e09-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u09-0001-0001-000000000001','EMP-009',
   'Carlos','Martínez','cmartinez@conectarhr.net','+54 9 11 5555-0009',
   '1997-08-30','male','Argentina','dni','42345678',
   'c0nec7ar-dep2-0001-0001-000000000001','c0nec7ar-ps04-0001-0001-000000000001','c0nec7ar-e02-0001-0001-000000000001',
   'contractor','2024-04-01',280000,'monthly',
   'active','Av. Corrientes 3456 Piso 1','CABA','Buenos Aires','C1193','Argentina',
   'Isabel Martínez','+54 9 11 5555-9909','Madre'),

  -- 10 Valentina Sánchez · Dev Full Stack (Rosario)
  ('c0nec7ar-e10-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u10-0001-0001-000000000001','EMP-010',
   'Valentina','Sánchez','vsanchez@conectarhr.net','+54 9 341 5555-0010',
   '1996-06-25','female','Argentina','dni','41234567',
   'c0nec7ar-dep3-0001-0001-000000000001','c0nec7ar-ps06-0001-0001-000000000001','c0nec7ar-e03-0001-0001-000000000001',
   'full_time','2024-02-01',580000,'monthly',
   'active','San Martín 890 Piso 4 A','Rosario','Santa Fe','2000','Argentina',
   'Héctor Sánchez','+54 9 341 5555-9910','Padre'),

  -- 11 Ramiro Blanco · Dev Backend
  ('c0nec7ar-e11-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u11-0001-0001-000000000001','EMP-011',
   'Ramiro','Blanco','rblanco@conectarhr.net','+54 9 11 5555-0011',
   '1994-02-14','male','Argentina','dni','39876543',
   'c0nec7ar-dep3-0001-0001-000000000001','c0nec7ar-ps07-0001-0001-000000000001','c0nec7ar-e03-0001-0001-000000000001',
   'full_time','2023-05-15',520000,'monthly',
   'active','Av. Pueyrredón 1800 7F','CABA','Buenos Aires','C1119','Argentina',
   'Claudia Blanco','+54 9 11 5555-9911','Madre'),

  -- 12 Florencia Ibáñez · QA
  ('c0nec7ar-e12-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u12-0001-0001-000000000001','EMP-012',
   'Florencia','Ibáñez','fibanez@conectarhr.net','+54 9 11 5555-0012',
   '1995-09-28','female','Argentina','dni','40654321',
   'c0nec7ar-dep3-0001-0001-000000000001','c0nec7ar-ps08-0001-0001-000000000001','c0nec7ar-e03-0001-0001-000000000001',
   'full_time','2023-10-01',390000,'monthly',
   'active','Godoy Cruz 1234 Piso 2 C','CABA','Buenos Aires','C1414','Argentina',
   'Gustavo Ibáñez','+54 9 11 5555-9912','Padre'),

  -- 13 Luciana Pereyra · UX/UI
  ('c0nec7ar-e13-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u13-0001-0001-000000000001','EMP-013',
   'Luciana','Pereyra','lpereyra@conectarhr.net','+54 9 11 5555-0013',
   '1998-01-16','female','Argentina','dni','43123456',
   'c0nec7ar-dep3-0001-0001-000000000001','c0nec7ar-ps09-0001-0001-000000000001','c0nec7ar-e03-0001-0001-000000000001',
   'full_time','2024-03-01',450000,'monthly',
   'active','El Salvador 4567','CABA','Buenos Aires','C1414','Argentina',
   'Mirta Pereyra','+54 9 11 5555-9913','Madre'),

  -- 14 Diego Pérez · Ejecutivo Ventas
  ('c0nec7ar-e14-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u14-0001-0001-000000000001','EMP-014',
   'Diego','Pérez','dperez@conectarhr.net','+54 9 11 5555-0014',
   '1991-12-03','male','Argentina','dni','36789012',
   'c0nec7ar-dep4-0001-0001-000000000001','c0nec7ar-ps11-0001-0001-000000000001','c0nec7ar-e04-0001-0001-000000000001',
   'full_time','2023-01-15',340000,'monthly',
   'active','Av. Corrientes 2890 Piso 3 B','CABA','Buenos Aires','C1193','Argentina',
   'Norma Pérez','+54 9 11 5555-9914','Madre'),

  -- 15 Natalia Vega · Ejecutiva Ventas
  ('c0nec7ar-e15-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u15-0001-0001-000000000001','EMP-015',
   'Natalia','Vega','nvega@conectarhr.net','+54 9 11 5555-0015',
   '1993-05-21','female','Argentina','dni','38765432',
   'c0nec7ar-dep4-0001-0001-000000000001','c0nec7ar-ps11-0001-0001-000000000001','c0nec7ar-e04-0001-0001-000000000001',
   'full_time','2023-06-01',320000,'monthly',
   'active','Lavalle 1234 Piso 5 A','CABA','Buenos Aires','C1048','Argentina',
   'Pablo Vega','+54 9 11 5555-9915','Hermano'),

  -- 16 Pablo Molina · Ventas Rosario
  ('c0nec7ar-e16-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u16-0001-0001-000000000001','EMP-016',
   'Pablo','Molina','pmolina@conectarhr.net','+54 9 341 5555-0016',
   '1989-08-09','male','Argentina','dni','33456789',
   'c0nec7ar-dep4-0001-0001-000000000001','c0nec7ar-ps11-0001-0001-000000000001','c0nec7ar-e04-0001-0001-000000000001',
   'full_time','2022-09-01',350000,'monthly',
   'active','Córdoba 1500 Piso 2 C','Rosario','Santa Fe','2000','Argentina',
   'Sara Molina','+54 9 341 5555-9916','Cónyuge'),

  -- 17 Tomás Castro · Analista Financiero
  ('c0nec7ar-e17-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u17-0001-0001-000000000001','EMP-017',
   'Tomás','Castro','tcastro@conectarhr.net','+54 9 11 5555-0017',
   '1996-03-27','male','Argentina','dni','41098765',
   'c0nec7ar-dep5-0001-0001-000000000001','c0nec7ar-ps13-0001-0001-000000000001','c0nec7ar-e05-0001-0001-000000000001',
   'full_time','2025-03-01',310000,'monthly',
   'active','Av. del Libertador 6789 Piso 4 B','CABA','Buenos Aires','C1428','Argentina',
   'Cristina Castro','+54 9 11 5555-9917','Madre'),

  -- 18 Paola Suárez · Administrativa
  ('c0nec7ar-e18-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u18-0001-0001-000000000001','EMP-018',
   'Paola','Suárez','psuarez@conectarhr.net','+54 9 11 5555-0018',
   '1992-11-12','female','Argentina','dni','37890123',
   'c0nec7ar-dep6-0001-0001-000000000001','c0nec7ar-ps15-0001-0001-000000000001','c0nec7ar-e06-0001-0001-000000000001',
   'full_time','2021-06-01',260000,'monthly',
   'active','Rivadavia 5678 Piso 1 A','CABA','Buenos Aires','C1424','Argentina',
   'Ernesto Suárez','+54 9 11 5555-9918','Padre'),

  -- 19 Gabriela Herrera · Analista Ops
  ('c0nec7ar-e19-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u19-0001-0001-000000000001','EMP-019',
   'Gabriela','Herrera','gherrera@conectarhr.net','+54 9 11 5555-0019',
   '1994-07-05','female','Argentina','dni','39543210',
   'c0nec7ar-dep6-0001-0001-000000000001','c0nec7ar-ps16-0001-0001-000000000001','c0nec7ar-e06-0001-0001-000000000001',
   'full_time','2023-08-15',295000,'monthly',
   'active','Av. Brasil 890','CABA','Buenos Aires','C1154','Argentina',
   'Andrés Herrera','+54 9 11 5555-9919','Hermano'),

  -- 20 Inés Acosta · Analista Marketing
  ('c0nec7ar-e20-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-u20-0001-0001-000000000001','EMP-020',
   'Inés','Acosta','iacosta@conectarhr.net','+54 9 11 5555-0020',
   '1999-10-30','female','Argentina','dni','44321098',
   'c0nec7ar-dep7-0001-0001-000000000001','c0nec7ar-ps18-0001-0001-000000000001','c0nec7ar-e07-0001-0001-000000000001',
   'intern','2024-11-01',180000,'monthly',
   'active','Julián Álvarez 2345 Piso 3 D','CABA','Buenos Aires','C1414','Argentina',
   'Horacio Acosta','+54 9 11 5555-9920','Padre')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. ASIGNACIÓN DE TURNOS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO employee_shifts (tenant_id, employee_id, shift_id, effective_from)
SELECT 'c0nec7ar-0001-0001-0001-000000000001', e.id,
  CASE
    WHEN e.employee_code IN ('EMP-003','EMP-010','EMP-013') THEN 'c0nec7ar-sh2-0001-0001-000000000001'
    WHEN e.employee_code IN ('EMP-011','EMP-012','EMP-007','EMP-020') THEN 'c0nec7ar-sh2-0001-0001-000000000001'
    ELSE 'c0nec7ar-sh1-0001-0001-000000000001'
  END,
  '2026-01-01'
FROM employees e
WHERE e.tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. TIPOS DE LICENCIAS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO leave_types (id, tenant_id, name, code, default_days_per_year, is_paid, requires_approval, requires_medical_certificate, max_consecutive_days)
VALUES
  ('c0nec7ar-lt1-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Vacaciones Anuales',    'annual',    14, true,  true,  false, 21),
  ('c0nec7ar-lt2-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Enfermedad',            'sick',      30, true,  true,  true,  30),
  ('c0nec7ar-lt3-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Maternidad',            'maternity', 90, true,  true,  true,  90),
  ('c0nec7ar-lt4-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Paternidad',            'paternity',  2, true,  true,  false,  2),
  ('c0nec7ar-lt5-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Duelo',                 'bereavement',3, true,  true,  false,  5),
  ('c0nec7ar-lt6-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Estudio/Examen',        'study',     10, true,  true,  false,  2),
  ('c0nec7ar-lt7-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Asunto Personal',       'personal',   3, true,  true,  false,  3),
  ('c0nec7ar-lt8-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001','Sin Goce de Sueldo',    'unpaid',    30, false, true,  false, 30)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. SALDOS DE LICENCIAS 2026
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO leave_balances (tenant_id, employee_id, leave_type_id, year, total_days, used_days, approved_days)
SELECT
  'c0nec7ar-0001-0001-0001-000000000001', e.id, lt.id, 2026,
  lt.default_days_per_year,
  CASE lt.code WHEN 'annual' THEN FLOOR(RANDOM()*8)::int WHEN 'sick' THEN FLOOR(RANDOM()*3)::int ELSE 0 END,
  0
FROM employees e
CROSS JOIN leave_types lt
WHERE e.tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'
  AND lt.tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'
  AND lt.code IN ('annual','sick','study','personal')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. SOLICITUDES DE LICENCIA
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO leaves (id, tenant_id, employee_id, leave_type_id, start_date, end_date, days_taken, status, reason, approved_by, approved_at)
VALUES
  -- Aprobadas
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e08-0001-0001-000000000001','c0nec7ar-lt1-0001-0001-000000000001','2026-05-05','2026-05-14',8,'approved','Vacaciones programadas','c0nec7ar-e02-0001-0001-000000000001','2026-04-25 10:00:00'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e10-0001-0001-000000000001','c0nec7ar-lt2-0001-0001-000000000001','2026-05-05','2026-05-06',2,'approved','Gripe','c0nec7ar-e03-0001-0001-000000000001','2026-05-05 08:30:00'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e03-0001-0001-000000000001','c0nec7ar-lt7-0001-0001-000000000001','2026-05-14','2026-05-14',1,'approved','Trámite bancario','c0nec7ar-e01-0001-0001-000000000001','2026-05-10 09:00:00'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e15-0001-0001-000000000001','c0nec7ar-lt1-0001-0001-000000000001','2026-05-19','2026-05-23',5,'approved','Vacaciones','c0nec7ar-e04-0001-0001-000000000001','2026-05-08 11:00:00'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e12-0001-0001-000000000001','c0nec7ar-lt6-0001-0001-000000000001','2026-05-08','2026-05-09',2,'approved','Final de UBA - Administración','c0nec7ar-e03-0001-0001-000000000001','2026-05-05 14:00:00'),
  -- Pendientes
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e11-0001-0001-000000000001','c0nec7ar-lt1-0001-0001-000000000001','2026-06-02','2026-06-13',10,'pending','Vacaciones de invierno',NULL,NULL),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e09-0001-0001-000000000001','c0nec7ar-lt7-0001-0001-000000000001','2026-05-28','2026-05-28',1,'pending','Mudanza',NULL,NULL),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e16-0001-0001-000000000001','c0nec7ar-lt1-0001-0001-000000000001','2026-06-16','2026-06-20',5,'pending','Vacaciones',NULL,NULL),
  -- Rechazadas
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e14-0001-0001-000000000001','c0nec7ar-lt7-0001-0001-000000000001','2026-05-01','2026-05-05',5,'rejected','Asunto personal','c0nec7ar-e04-0001-0001-000000000001','2026-04-28 09:00:00'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e17-0001-0001-000000000001','c0nec7ar-lt1-0001-0001-000000000001','2026-04-20','2026-04-30',9,'rejected','Vacaciones','c0nec7ar-e05-0001-0001-000000000001','2026-04-15 10:00:00')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. ASISTENCIA — Enero–Abril 2026 (días hábiles)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_date DATE; v_emp RECORD;
  v_ci TIMESTAMPTZ; v_co TIMESTAMPTZ;
  v_late INT; v_status TEXT;
  v_branch UUID; v_lat DECIMAL(10,7); v_lon DECIMAL(10,7);
BEGIN
  FOR v_date IN
    SELECT d::DATE FROM generate_series('2026-01-02'::DATE,'2026-04-30'::DATE,'1 day') d
    WHERE EXTRACT(DOW FROM d) NOT IN (0,6)
      AND d NOT IN ('2026-01-01','2026-02-24','2026-02-25','2026-03-24','2026-04-02','2026-04-03') -- feriados AR
  LOOP
    FOR v_emp IN
      SELECT id, employee_code FROM employees
      WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'
    LOOP
      -- ~8% ausentes
      IF RANDOM() < 0.08 THEN
        INSERT INTO attendance (tenant_id,employee_id,date,status,check_in_method)
        VALUES ('c0nec7ar-0001-0001-0001-000000000001',v_emp.id,v_date,'absent','manual')
        ON CONFLICT DO NOTHING;
        CONTINUE;
      END IF;

      -- Sucursal por empleado
      IF v_emp.employee_code IN ('EMP-010','EMP-016') THEN
        v_branch := 'c0nec7ar-bra2-0001-0001-000000000001';
        v_lat := -32.9442 + (RANDOM()-0.5)*0.0005; v_lon := -60.6507 + (RANDOM()-0.5)*0.0005;
      ELSIF v_emp.employee_code = 'EMP-005' THEN
        v_branch := 'c0nec7ar-bra3-0001-0001-000000000001';
        v_lat := -31.4135 + (RANDOM()-0.5)*0.0005; v_lon := -64.1811 + (RANDOM()-0.5)*0.0005;
      ELSE
        v_branch := 'c0nec7ar-bra1-0001-0001-000000000001';
        v_lat := -34.6037 + (RANDOM()-0.5)*0.0005; v_lon := -58.3816 + (RANDOM()-0.5)*0.0005;
      END IF;

      -- ~13% tarde
      v_late := 0; v_status := 'present';
      IF RANDOM() < 0.13 THEN v_late := 5 + FLOOR(RANDOM()*30)::int; v_status := 'late'; END IF;

      v_ci := (v_date + TIME '09:00' + (v_late||' minutes')::INTERVAL) AT TIME ZONE 'America/Argentina/Buenos_Aires';
      v_co := (v_date + TIME '18:00' + ((RANDOM()-0.5)*20||' minutes')::INTERVAL) AT TIME ZONE 'America/Argentina/Buenos_Aires';

      INSERT INTO attendance (
        tenant_id, employee_id, date,
        check_in_time, check_out_time,
        check_in_method, check_out_method,
        check_in_latitude, check_in_longitude,
        check_out_latitude, check_out_longitude,
        branch_id, status, late_minutes, working_hours
      ) VALUES (
        'c0nec7ar-0001-0001-0001-000000000001', v_emp.id, v_date,
        v_ci, v_co, 'geo', 'geo',
        v_lat, v_lon, v_lat+(RANDOM()-0.5)*0.0001, v_lon+(RANDOM()-0.5)*0.0001,
        v_branch, v_status, v_late,
        ROUND(EXTRACT(EPOCH FROM (v_co-v_ci))/3600.0 - 1.0, 2)
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. NÓMINA — Enero, Febrero, Marzo, Abril 2026
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_period TEXT; v_emp RECORD;
  v_gross NUMERIC; v_net NUMERIC;
  v_payroll_id UUID;
BEGIN
  FOREACH v_period IN ARRAY ARRAY['2026-01','2026-02','2026-03','2026-04'] LOOP
    FOR v_emp IN
      SELECT id, salary FROM employees
      WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001'
        AND status = 'active'
    LOOP
      v_gross := v_emp.salary * 1.1;  -- básico + extras ~10%
      v_net   := v_gross * 0.83;       -- 17% retenciones (jubilación 11%+OS 3%+INSSJP 3%)
      v_payroll_id := gen_random_uuid();

      INSERT INTO payroll (id, tenant_id, employee_id, payroll_period,
        base_salary, gross_salary, net_salary, status, payment_method, paid_at)
      VALUES (v_payroll_id, 'c0nec7ar-0001-0001-0001-000000000001',
        v_emp.id, v_period,
        v_emp.salary, v_gross, v_net,
        CASE WHEN v_period < '2026-05' THEN 'paid' ELSE 'pending' END,
        'bank_transfer',
        CASE WHEN v_period < '2026-05'
          THEN (v_period||'-28 10:00:00')::TIMESTAMPTZ
          ELSE NULL END)
      ON CONFLICT (tenant_id, employee_id, payroll_period) DO NOTHING;

      -- Componentes básicos
      IF NOT EXISTS (SELECT 1 FROM payroll_components WHERE payroll_id = v_payroll_id) THEN
        INSERT INTO payroll_components (payroll_id, tenant_id, name, component_type, amount, calculation_method, is_deduction)
        VALUES
          (v_payroll_id,'c0nec7ar-0001-0001-0001-000000000001','Sueldo Básico','basic_salary',v_emp.salary,'fixed',false),
          (v_payroll_id,'c0nec7ar-0001-0001-0001-000000000001','Jubilación SIPA (11%)','tax',v_emp.salary*0.11,'percentage',true),
          (v_payroll_id,'c0nec7ar-0001-0001-0001-000000000001','Obra Social (3%)','insurance',v_emp.salary*0.03,'percentage',true),
          (v_payroll_id,'c0nec7ar-0001-0001-0001-000000000001','INSSJP (3%)','insurance',v_emp.salary*0.03,'percentage',true),
          (v_payroll_id,'c0nec7ar-0001-0001-0001-000000000001','Adicional Presentismo','bonus',v_emp.salary*0.05,'percentage',false),
          (v_payroll_id,'c0nec7ar-0001-0001-0001-000000000001','Antigüedad','bonus',v_emp.salary*0.05,'percentage',false);
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. RECLUTAMIENTO
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO recruitment_positions (id, tenant_id, title, department_id, description, requirements, salary_min, salary_max, work_mode, status, priority, openings, deadline)
VALUES
  ('c0nec7ar-rp1-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001',
   'Desarrollador/a Backend Senior','c0nec7ar-dep3-0001-0001-000000000001',
   'Buscamos un/a dev backend senior para trabajar en nuestra plataforma SaaS.',
   'Node.js / Go, PostgreSQL, AWS, 4+ años exp.', 450000, 780000, 'Híbrido','open','high',1,'2026-06-15'),
  ('c0nec7ar-rp2-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001',
   'Analista de Marketing Digital','c0nec7ar-dep7-0001-0001-000000000001',
   'Posición de analista para gestionar campañas digitales y contenidos.',
   'Google Ads, Meta Ads, SEO, 2+ años exp.', 250000, 420000, 'Híbrido','open','normal',1,'2026-06-30'),
  ('c0nec7ar-rp3-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001',
   'Ejecutivo/a de Cuentas Corporativas','c0nec7ar-dep4-0001-0001-000000000001',
   'Captación y gestión de cuentas B2B en zona Pampeana.',
   'Ventas consultivas, CRM Salesforce, 3+ años exp.', 300000, 500000, 'Presencial','open','high',2,'2026-05-30'),
  ('c0nec7ar-rp4-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001',
   'Analista de Tesorería','c0nec7ar-dep5-0001-0001-000000000001',
   'Gestión de pagos, flujos de caja y conciliaciones bancarias.',
   'Excel avanzado, SAP o Tango, contador/a público/a o afín.', 280000, 480000, 'Presencial','open','normal',1,'2026-07-15')
ON CONFLICT DO NOTHING;

-- Candidatos
INSERT INTO candidates (id, tenant_id, position_id, full_name, email, phone, source, stage, rating, notes, applied_at)
VALUES
  -- Posición 1: Backend Senior
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp1-0001-0001-000000000001','Julieta Rossi','jrossi@email.com','+54 9 11 5544-0001','linkedin','interview',4,'Muy buena entrevista técnica. Conoce Go y PostgreSQL a nivel avanzado.','2026-04-10'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp1-0001-0001-000000000001','Agustín Ferraro','aferraro@email.com','+54 9 11 5544-0002','referral','interview',3,'Referido por Ramiro Blanco. Experiencia en AWS sólida.','2026-04-12'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp1-0001-0001-000000000001','Matías Rivero','mrivero@email.com','+54 9 11 5544-0003','portal','screening',2,'CV interesante. Pendiente de primera entrevista.','2026-04-20'),

  -- Posición 2: Marketing
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp2-0001-0001-000000000001','Laura Gómez','lgomez@email.com','+54 9 11 5544-0004','linkedin','screening',4,'Especialista en SEO con casos de éxito en e-commerce.','2026-04-15'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp2-0001-0001-000000000001','Marcos Villalba','mvillalba@email.com','+54 9 11 5544-0005','portal','screening',3,'Experiencia en Meta Ads. Portafolio completo.','2026-04-18'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp2-0001-0001-000000000001','Sofía Reyes','sreyes@email.com','+54 9 11 5544-0006','linkedin','new',NULL,'Recién aplicó. Perfil a evaluar.','2026-05-02'),

  -- Posición 3: Ejecutivo Ventas
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp3-0001-0001-000000000001','Hernán Díaz','hdiaz@email.com','+54 9 11 5544-0007','direct','offer',5,'Excelente candidato. Oferta enviada el 05/05.','2026-04-05'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp3-0001-0001-000000000001','Camila Soria','csoria@email.com','+54 9 11 5544-0008','linkedin','technical',3,'En proceso de evaluación de habilidades comerciales.','2026-04-08'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp3-0001-0001-000000000001','Pablo Domínguez','pdominguez@email.com','+54 9 11 5544-0009','referral','hired',5,'Contratado. Ingresa el 01/06/2026.','2026-03-20'),

  -- Posición 4: Tesorería
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp4-0001-0001-000000000001','Verónica Suárez','vsuarez@email.com','+54 9 11 5544-0010','portal','new',NULL,'Contador/a recibido/a con 2 años en tesorería.','2026-05-05'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-rp4-0001-0001-000000000001','Nicolás Bauer','nbauer@email.com','+54 9 11 5544-0011','linkedin','new',NULL,'Perfil sólido en finanzas corporativas.','2026-05-06')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. COMUNICADOS / ANUNCIOS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO announcements (id, tenant_id, title, content, announcement_type, priority, status, published_at, expires_at, created_by)
VALUES
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001',
   'Bienvenida a ConectAr RRHH S.A. 🎉',
   'Nos complace presentar nuestra nueva plataforma de gestión de RRHH. Desde hoy pueden acceder a su legajo digital, solicitar licencias y consultar recibos de sueldo directamente desde el sistema. Ante cualquier duda, contactar a rrhh@conectarhr.net.',
   'general','high','published','2026-01-15 09:00:00','2026-12-31',
   'c0nec7ar-u01-0001-0001-000000000001'),

  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001',
   'Política de Home Office actualizada',
   'A partir del 01/02/2026 el esquema híbrido aplica a todos los equipos de Tecnología y Marketing: 3 días presenciales y 2 remotos por semana. Coordinar con su jefe/a directo/a los días presenciales del equipo.',
   'policy','normal','published','2026-01-28 10:00:00','2026-12-31',
   'c0nec7ar-u02-0001-0001-000000000001'),

  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001',
   'Liquidación de sueldos — Abril 2026',
   'Los recibos de sueldo de Abril 2026 estarán disponibles en el sistema a partir del 30/04. El acreditación en cuentas bancarias se realizará el mismo día. Ante errores o discrepancias, comunicarse antes del 05/05 con el área de RRHH.',
   'important','high','published','2026-04-29 08:00:00','2026-05-15',
   'c0nec7ar-u02-0001-0001-000000000001'),

  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001',
   'Jornada de integración — Julio 2026',
   'Estamos organizando nuestra primera jornada de integración presencial en Buenos Aires, viernes 18 de julio. Se confirmarán detalles de logística durante las próximas semanas. Los colaboradores de Rosario y Córdoba tendrán cobertura de viáticos.',
   'event','normal','published','2026-05-01 09:00:00','2026-07-18',
   'c0nec7ar-u01-0001-0001-000000000001'),

  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001',
   'Actualización de sistema: versión 2.1',
   'Lanzamos la versión 2.1 de ConectAr HR con mejoras en el módulo de asistencia (geolocalización más precisa), panel de reclutamiento renovado y nuevo visor de recibos con firma digital. Ante bugs, reportar desde el panel de soporte.',
   'general','normal','published','2026-04-15 10:00:00','2026-12-31',
   'c0nec7ar-u01-0001-0001-000000000001')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. PROGRAMAS DE CAPACITACIÓN
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO training_programs (id, tenant_id, name, description, provider, duration_hours, start_date, end_date, max_participants, cost, status)
VALUES
  ('c0nec7ar-tp1-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001',
   'Liderazgo y Gestión de Equipos','Taller intensivo de habilidades de liderazgo para mandos medios y altos.',
   'Universidad de San Andrés',24,'2026-04-07','2026-04-09',15,180000,'active'),
  ('c0nec7ar-tp2-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001',
   'Excel Avanzado para RRHH','Automatización de reportes, tablas dinámicas, Power Query y macros.',
   'Capacitaciones.ar',16,'2026-05-05','2026-05-06',20,45000,'active'),
  ('c0nec7ar-tp3-0001-0001-000000000001','c0nec7ar-0001-0001-0001-000000000001',
   'Metodologías Ágiles — Scrum & Kanban','Certificación en gestión ágil de proyectos de tecnología.',
   'Scrum Alliance Argentina',20,'2026-06-02','2026-06-04',12,220000,'active')
ON CONFLICT DO NOTHING;

-- Inscripciones a capacitaciones
INSERT INTO employee_training (tenant_id, employee_id, training_program_id, status, completion_date, score)
VALUES
  -- Liderazgo
  ('c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e01-0001-0001-000000000001','c0nec7ar-tp1-0001-0001-000000000001','completed','2026-04-09',92),
  ('c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e02-0001-0001-000000000001','c0nec7ar-tp1-0001-0001-000000000001','completed','2026-04-09',88),
  ('c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e03-0001-0001-000000000001','c0nec7ar-tp1-0001-0001-000000000001','completed','2026-04-09',95),
  ('c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e04-0001-0001-000000000001','c0nec7ar-tp1-0001-0001-000000000001','completed','2026-04-09',90),
  -- Excel RRHH
  ('c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e08-0001-0001-000000000001','c0nec7ar-tp2-0001-0001-000000000001','registered',NULL,NULL),
  ('c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e09-0001-0001-000000000001','c0nec7ar-tp2-0001-0001-000000000001','registered',NULL,NULL),
  ('c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e18-0001-0001-000000000001','c0nec7ar-tp2-0001-0001-000000000001','registered',NULL,NULL),
  -- Ágil
  ('c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e10-0001-0001-000000000001','c0nec7ar-tp3-0001-0001-000000000001','registered',NULL,NULL),
  ('c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e11-0001-0001-000000000001','c0nec7ar-tp3-0001-0001-000000000001','registered',NULL,NULL),
  ('c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e12-0001-0001-000000000001','c0nec7ar-tp3-0001-0001-000000000001','registered',NULL,NULL)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 18. EVALUACIONES DE DESEMPEÑO
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO performance_reviews (id, tenant_id, employee_id, reviewer_id, review_period, overall_rating, performance_score, technical_skills_score, soft_skills_score, status, feedback)
VALUES
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e03-0001-0001-000000000001','c0nec7ar-e01-0001-0001-000000000001','2025-H2',4.8,95,97,93,'completed','Liderazgo técnico sobresaliente. Entregó el proyecto de migración cloud en tiempo y forma.'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e02-0001-0001-000000000001','c0nec7ar-e01-0001-0001-000000000001','2025-H2',4.5,92,88,96,'completed','Excelente gestión del equipo. Redujo la rotación en un 30% durante el año.'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e04-0001-0001-000000000001','c0nec7ar-e01-0001-0001-000000000001','2025-H2',4.2,88,80,94,'completed','Superó los objetivos de ventas. Incorporó 3 cuentas enterprise nuevas.'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e10-0001-0001-000000000001','c0nec7ar-e03-0001-0001-000000000001','2025-H2',4.6,94,96,90,'completed','Desarrolladora muy sólida. Lidera de facto la arquitectura del frontend.'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e08-0001-0001-000000000001','c0nec7ar-e02-0001-0001-000000000001','2025-H2',4.0,85,82,88,'completed','Muy buena gestión de procesos. Oportunidad de mejora en análisis de datos.'),
  (gen_random_uuid(),'c0nec7ar-0001-0001-0001-000000000001','c0nec7ar-e11-0001-0001-000000000001','c0nec7ar-e03-0001-0001-000000000001','2025-H2',3.8,82,88,76,'completed','Buenas habilidades técnicas. Necesita mejorar la comunicación con stakeholders.')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 19. CONFIGURACIÓN DE EMPRESA
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO company_settings (tenant_id, company_name, cuit, industry, working_hours_per_day, timezone, currency, work_week_days)
VALUES (
  'c0nec7ar-0001-0001-0001-000000000001',
  'ConectAr RRHH S.A.',
  '30-71234567-0',
  'Software & Servicios',
  8,
  'America/Argentina/Buenos_Aires',
  'ARS',
  ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday']
) ON CONFLICT (tenant_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  updated_at   = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 20. MÓDULOS HABILITADOS (tenant demo)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO tenant_modules (tenant_id, module_key, enabled, licensed_at)
SELECT 'c0nec7ar-0001-0001-0001-000000000001', key, TRUE, NOW()
FROM system_modules
ON CONFLICT (tenant_id, module_key) DO UPDATE SET enabled = TRUE;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN
-- ─────────────────────────────────────────────────────────────────────────────
SELECT 'Empleados'       AS tabla, COUNT(*) AS total FROM employees         WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001' UNION ALL
SELECT 'Asistencia',      COUNT(*) FROM attendance        WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001' UNION ALL
SELECT 'Licencias',       COUNT(*) FROM leaves            WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001' UNION ALL
SELECT 'Nómina',          COUNT(*) FROM payroll           WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001' UNION ALL
SELECT 'Reclutamiento',   COUNT(*) FROM recruitment_positions WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001' UNION ALL
SELECT 'Candidatos',      COUNT(*) FROM candidates        WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001' UNION ALL
SELECT 'Comunicados',     COUNT(*) FROM announcements     WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001' UNION ALL
SELECT 'Capacitaciones',  COUNT(*) FROM training_programs WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001' UNION ALL
SELECT 'Evaluaciones',    COUNT(*) FROM performance_reviews WHERE tenant_id = 'c0nec7ar-0001-0001-0001-000000000001';

COMMIT;
