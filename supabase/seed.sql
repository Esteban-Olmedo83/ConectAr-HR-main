-- ============================================================================
-- SEED DATA: Datos de ejemplo para ConectAr HR
-- ============================================================================
-- Este script inserta datos de ejemplo para testing y desarrollo.
-- ADVERTENCIA: Solo usar en entornos de desarrollo/testing.
-- ============================================================================

-- Limpiar datos existentes (opcional, comentar en producción)
-- DELETE FROM users;
-- DELETE FROM tenants;

-- ============================================================================
-- 1. INSERTAR TENANTS (Empresas cliente)
-- ============================================================================

INSERT INTO tenants (id, name, slug, description, country_code, timezone, currency, status, subscription_plan, max_employees, max_users, features)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'TechCorp Argentina',
    'techcorp-arg',
    'Empresa de tecnología con focus en transformación digital',
    'AR',
    'America/Argentina/Buenos_Aires',
    'ARS',
    'active',
    'professional',
    500,
    50,
    jsonb_build_object(
      'payroll', true,
      'leave_management', true,
      'attendance_tracking', true,
      'performance_reviews', true,
      'training_programs', true,
      'document_management', true
    )
  )
ON CONFLICT DO NOTHING;

INSERT INTO tenants (id, name, slug, description, country_code, timezone, currency, status, subscription_plan, max_employees, max_users, features)
VALUES
  (
    'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6'::UUID,
    'Consultoría Global',
    'consultoria-global',
    'Empresa de consultoría empresarial',
    'AR',
    'America/Argentina/Buenos_Aires',
    'ARS',
    'active',
    'enterprise',
    1000,
    100,
    jsonb_build_object(
      'payroll', true,
      'leave_management', true,
      'attendance_tracking', true,
      'performance_reviews', true,
      'training_programs', true,
      'document_management', true,
      'multi_location', true
    )
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. INSERTAR USUARIOS
-- ============================================================================

-- Super Administrador (usuario que no pertenece a un tenant específico)
INSERT INTO users (id, tenant_id, email, email_confirmed, first_name, last_name, status, is_super_admin)
VALUES
  (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'admin@conectar-hr.com',
    true,
    'Carlos',
    'Administrador',
    'active',
    true
  )
ON CONFLICT DO NOTHING;

-- Administrador Tenant 1
INSERT INTO users (id, tenant_id, email, email_confirmed, first_name, last_name, status, is_super_admin)
VALUES
  (
    '10000000-0000-0000-0000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'rrhh-admin@techcorp.com.ar',
    true,
    'María',
    'González',
    'active',
    false
  )
ON CONFLICT DO NOTHING;

-- Manager Tenant 1
INSERT INTO users (id, tenant_id, email, email_confirmed, first_name, last_name, status, is_super_admin)
VALUES
  (
    '20000000-0000-0000-0000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'manager@techcorp.com.ar',
    true,
    'Juan',
    'Pérez',
    'active',
    false
  )
ON CONFLICT DO NOTHING;

-- Empleado Tenant 1
INSERT INTO users (id, tenant_id, email, email_confirmed, first_name, last_name, status, is_super_admin)
VALUES
  (
    '30000000-0000-0000-0000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'empleado@techcorp.com.ar',
    true,
    'Ana',
    'García',
    'active',
    false
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. INSERTAR PERMISOS
-- ============================================================================

INSERT INTO permissions (id, code, name, description, resource, action, is_system_permission)
VALUES
  ('10000000-1000-1000-1000-000000000001'::UUID, 'users_read', 'Leer usuarios', 'Ver listado de usuarios', 'users', 'read', true),
  ('10000000-1000-1000-1000-000000000002'::UUID, 'users_create', 'Crear usuarios', 'Crear nuevos usuarios', 'users', 'create', true),
  ('10000000-1000-1000-1000-000000000003'::UUID, 'users_update', 'Actualizar usuarios', 'Modificar usuarios', 'users', 'update', true),
  ('10000000-1000-1000-1000-000000000004'::UUID, 'users_delete', 'Eliminar usuarios', 'Eliminar usuarios', 'users', 'delete', true),
  ('10000000-1000-1000-1000-000000000005'::UUID, 'employees_read', 'Leer empleados', 'Ver listado de empleados', 'employees', 'read', true),
  ('10000000-1000-1000-1000-000000000006'::UUID, 'employees_create', 'Crear empleados', 'Crear nuevos empleados', 'employees', 'create', true),
  ('10000000-1000-1000-1000-000000000007'::UUID, 'employees_update', 'Actualizar empleados', 'Modificar datos de empleados', 'employees', 'update', true),
  ('10000000-1000-1000-1000-000000000008'::UUID, 'payroll_read', 'Leer nómina', 'Ver datos de nómina', 'payroll', 'read', true),
  ('10000000-1000-1000-1000-000000000009'::UUID, 'payroll_create', 'Crear nómina', 'Generar nóminas', 'payroll', 'create', true),
  ('10000000-1000-1000-1000-000000000010'::UUID, 'payroll_approve', 'Aprobar nómina', 'Aprobar nóminas', 'payroll', 'approve', true),
  ('10000000-1000-1000-1000-000000000011'::UUID, 'leaves_read', 'Leer licencias', 'Ver solicitudes de licencia', 'leaves', 'read', true),
  ('10000000-1000-1000-1000-000000000012'::UUID, 'leaves_create', 'Crear solicitudes', 'Solicitar licencias', 'leaves', 'create', true),
  ('10000000-1000-1000-1000-000000000013'::UUID, 'leaves_approve', 'Aprobar solicitudes', 'Aprobar licencias', 'leaves', 'approve', true),
  ('10000000-1000-1000-1000-000000000014'::UUID, 'attendance_read', 'Leer asistencia', 'Ver registros de asistencia', 'attendance', 'read', true),
  ('10000000-1000-1000-1000-000000000015'::UUID, 'attendance_checkin', 'Registrar entrada', 'Registrar entrada/salida', 'attendance', 'checkin', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. INSERTAR ROLES
-- ============================================================================

-- Rol: Administrador
INSERT INTO roles (id, tenant_id, name, description, is_system_role, role_type, permissions)
VALUES
  (
    '40000000-1000-1000-1000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Administrador',
    'Acceso total al sistema',
    true,
    'admin',
    jsonb_build_array(
      'users_read', 'users_create', 'users_update', 'users_delete',
      'employees_read', 'employees_create', 'employees_update',
      'payroll_read', 'payroll_create', 'payroll_approve',
      'leaves_read', 'leaves_approve',
      'attendance_read'
    )
  )
ON CONFLICT DO NOTHING;

-- Rol: Manager
INSERT INTO roles (id, tenant_id, name, description, is_system_role, role_type, permissions)
VALUES
  (
    '40000000-1000-1000-1000-000000000002'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Manager',
    'Gestión de equipo y reportes',
    true,
    'manager',
    jsonb_build_array(
      'employees_read', 'employees_update',
      'leaves_read', 'leaves_approve',
      'attendance_read'
    )
  )
ON CONFLICT DO NOTHING;

-- Rol: Empleado
INSERT INTO roles (id, tenant_id, name, description, is_system_role, role_type, permissions)
VALUES
  (
    '40000000-1000-1000-1000-000000000003'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Empleado',
    'Acceso limitado a funciones básicas',
    true,
    'employee',
    jsonb_build_array(
      'employees_read', 'leaves_create', 'attendance_checkin'
    )
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. ASIGNAR ROLES A USUARIOS
-- ============================================================================

INSERT INTO user_roles (user_id, role_id, assigned_by)
VALUES
  (
    '10000000-0000-0000-0000-000000000001'::UUID,
    '40000000-1000-1000-1000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID
  )
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id, assigned_by)
VALUES
  (
    '20000000-0000-0000-0000-000000000001'::UUID,
    '40000000-1000-1000-1000-000000000002'::UUID,
    '10000000-0000-0000-0000-000000000001'::UUID
  )
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id, assigned_by)
VALUES
  (
    '30000000-0000-0000-0000-000000000001'::UUID,
    '40000000-1000-1000-1000-000000000003'::UUID,
    '10000000-0000-0000-0000-000000000001'::UUID
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. INSERTAR DEPARTAMENTOS
-- ============================================================================

INSERT INTO departments (id, tenant_id, name, description, manager_id, status, cost_center)
VALUES
  (
    '50000000-1000-1000-1000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Tecnología',
    'Departamento de desarrollo y tecnología',
    '20000000-0000-0000-0000-000000000001'::UUID,
    'active',
    'CC-001'
  )
ON CONFLICT DO NOTHING;

INSERT INTO departments (id, tenant_id, name, description, manager_id, status, cost_center)
VALUES
  (
    '50000000-1000-1000-1000-000000000002'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Recursos Humanos',
    'Departamento de RRHH',
    '10000000-0000-0000-0000-000000000001'::UUID,
    'active',
    'CC-002'
  )
ON CONFLICT DO NOTHING;

INSERT INTO departments (id, tenant_id, name, description, status, cost_center)
VALUES
  (
    '50000000-1000-1000-1000-000000000003'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Ventas',
    'Departamento de ventas',
    'active',
    'CC-003'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. INSERTAR POSICIONES
-- ============================================================================

INSERT INTO positions (id, tenant_id, name, description, department_id, salary_range_min, salary_range_max, level, status)
VALUES
  (
    '60000000-1000-1000-1000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Desarrollador Senior',
    'Desarrollador de software con experiencia',
    '50000000-1000-1000-1000-000000000001'::UUID,
    150000,
    250000,
    'senior',
    'active'
  )
ON CONFLICT DO NOTHING;

INSERT INTO positions (id, tenant_id, name, description, department_id, salary_range_min, salary_range_max, level, status)
VALUES
  (
    '60000000-1000-1000-1000-000000000002'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Desarrollador Junior',
    'Desarrollador en formación',
    '50000000-1000-1000-1000-000000000001'::UUID,
    70000,
    120000,
    'junior',
    'active'
  )
ON CONFLICT DO NOTHING;

INSERT INTO positions (id, tenant_id, name, description, department_id, salary_range_min, salary_range_max, level, status)
VALUES
  (
    '60000000-1000-1000-1000-000000000003'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Especialista RRHH',
    'Especialista en gestión de recursos humanos',
    '50000000-1000-1000-1000-000000000002'::UUID,
    100000,
    160000,
    'senior',
    'active'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. INSERTAR EMPLEADOS
-- ============================================================================

INSERT INTO employees (id, tenant_id, user_id, employee_code, first_name, last_name, email, phone, mobile, date_of_birth, gender, nationality, id_number, id_type, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, department_id, position_id, manager_id, employment_type, hire_date, salary, salary_frequency, currency, status, address_line_1, city, state, country)
VALUES
  (
    '70000000-1000-1000-1000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    '20000000-0000-0000-0000-000000000001'::UUID,
    'EMP-001',
    'Juan',
    'Pérez',
    'manager@techcorp.com.ar',
    '0223555-1234',
    '+5491123555678',
    '1990-05-15'::DATE,
    'male',
    'Argentino',
    '35555123',
    'dni',
    'María Pérez',
    '0223555-5678',
    'Esposa',
    '50000000-1000-1000-1000-000000000001'::UUID,
    '60000000-1000-1000-1000-000000000001'::UUID,
    null,
    'full_time',
    '2020-01-15'::DATE,
    200000,
    'monthly',
    'ARS',
    'active',
    'Calle Principal 123',
    'Buenos Aires',
    'Buenos Aires',
    'Argentina'
  )
ON CONFLICT DO NOTHING;

INSERT INTO employees (id, tenant_id, user_id, employee_code, first_name, last_name, email, phone, mobile, date_of_birth, gender, nationality, id_number, id_type, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, department_id, position_id, manager_id, employment_type, hire_date, salary, salary_frequency, currency, status, address_line_1, city, state, country)
VALUES
  (
    '70000000-1000-1000-1000-000000000002'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    '30000000-0000-0000-0000-000000000001'::UUID,
    'EMP-002',
    'Ana',
    'García',
    'empleado@techcorp.com.ar',
    '0223555-9012',
    '+5491123555999',
    '1995-08-22'::DATE,
    'female',
    'Argentino',
    '40555456',
    'dni',
    'Carlos García',
    '0223555-3456',
    'Padre',
    '50000000-1000-1000-1000-000000000001'::UUID,
    '60000000-1000-1000-1000-000000000002'::UUID,
    '70000000-1000-1000-1000-000000000001'::UUID,
    'full_time',
    '2022-06-01'::DATE,
    95000,
    'monthly',
    'ARS',
    'active',
    'Avenida Secundaria 456',
    'Buenos Aires',
    'Buenos Aires',
    'Argentina'
  )
ON CONFLICT DO NOTHING;

INSERT INTO employees (id, tenant_id, user_id, employee_code, first_name, last_name, email, phone, mobile, date_of_birth, gender, nationality, id_number, id_type, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, department_id, position_id, manager_id, employment_type, hire_date, salary, salary_frequency, currency, status, address_line_1, city, state, country)
VALUES
  (
    '70000000-1000-1000-1000-000000000003'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    '10000000-0000-0000-0000-000000000001'::UUID,
    'EMP-003',
    'María',
    'González',
    'rrhh-admin@techcorp.com.ar',
    '0223555-7890',
    '+5491123555321',
    '1988-03-10'::DATE,
    'female',
    'Argentino',
    '38555789',
    'dni',
    'Roberto González',
    '0223555-1111',
    'Hermano',
    '50000000-1000-1000-1000-000000000002'::UUID,
    '60000000-1000-1000-1000-000000000003'::UUID,
    null,
    'full_time',
    '2019-02-20'::DATE,
    130000,
    'monthly',
    'ARS',
    'active',
    'Calle Tercera 789',
    'Buenos Aires',
    'Buenos Aires',
    'Argentina'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. INSERTAR TIPOS DE LICENCIA
-- ============================================================================

INSERT INTO leave_types (id, tenant_id, name, description, code, default_days_per_year, is_paid, requires_approval, requires_medical_certificate, max_consecutive_days, status)
VALUES
  (
    '80000000-1000-1000-1000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Licencia Anual',
    'Vacaciones anuales',
    'annual',
    20,
    true,
    true,
    false,
    15,
    'active'
  )
ON CONFLICT DO NOTHING;

INSERT INTO leave_types (id, tenant_id, name, description, code, default_days_per_year, is_paid, requires_approval, requires_medical_certificate, max_consecutive_days, status)
VALUES
  (
    '80000000-1000-1000-1000-000000000002'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Licencia por Enfermedad',
    'Licencia médica',
    'sick',
    10,
    true,
    true,
    true,
    5,
    'active'
  )
ON CONFLICT DO NOTHING;

INSERT INTO leave_types (id, tenant_id, name, description, code, default_days_per_year, is_paid, requires_approval, requires_medical_certificate, max_consecutive_days, status)
VALUES
  (
    '80000000-1000-1000-1000-000000000003'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Licencia sin Sueldo',
    'Licencia sin goce de sueldo',
    'unpaid',
    0,
    false,
    true,
    false,
    30,
    'active'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. INSERTAR SALDOS DE LICENCIA
-- ============================================================================

INSERT INTO leave_balances (tenant_id, employee_id, leave_type_id, year, total_days, used_days, pending_approval_days, approved_days, rollover_days)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    '70000000-1000-1000-1000-000000000001'::UUID,
    '80000000-1000-1000-1000-000000000001'::UUID,
    2026,
    20,
    5,
    0,
    5,
    0
  )
ON CONFLICT DO NOTHING;

INSERT INTO leave_balances (tenant_id, employee_id, leave_type_id, year, total_days, used_days, pending_approval_days, approved_days, rollover_days)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    '70000000-1000-1000-1000-000000000002'::UUID,
    '80000000-1000-1000-1000-000000000001'::UUID,
    2026,
    20,
    0,
    0,
    0,
    0
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. INSERTAR ASISTENCIA (últimos 30 días)
-- ============================================================================

INSERT INTO attendance (tenant_id, employee_id, date, check_in_time, check_out_time, check_in_method, status, working_hours)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    '70000000-1000-1000-1000-000000000001'::UUID,
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '1 hour',
    CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '7 hours',
    'manual',
    'present',
    8.0
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 12. INSERTAR CONFIGURACIÓN DE EMPRESA
-- ============================================================================

INSERT INTO company_settings (tenant_id, company_name, legal_entity_name, cuit, industry, website, email, phone, city, state, country, work_week_days, working_hours_per_day, start_financial_year, currency, timezone)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'TechCorp Argentina',
    'TechCorp Argentina S.A.',
    '23-12345678-0',
    'Tecnología',
    'https://techcorp.com.ar',
    'contacto@techcorp.com.ar',
    '+54-11-1234-5678',
    'Buenos Aires',
    'Buenos Aires',
    'Argentina',
    '1,2,3,4,5',
    8,
    1,
    'ARS',
    'America/Argentina/Buenos_Aires'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 13. INSERTAR TURNOS DE TRABAJO
-- ============================================================================

INSERT INTO work_shifts (id, tenant_id, name, description, start_time, end_time, break_duration, working_days, status)
VALUES
  (
    '90000000-1000-1000-1000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Turno Mañana',
    'Turno matutino de 9:00 a 17:00',
    '09:00'::TIME,
    '17:00'::TIME,
    60,
    '1,2,3,4,5',
    'active'
  )
ON CONFLICT DO NOTHING;

INSERT INTO work_shifts (id, tenant_id, name, description, start_time, end_time, break_duration, working_days, status)
VALUES
  (
    '90000000-1000-1000-1000-000000000002'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Turno Tarde',
    'Turno vespertino de 14:00 a 22:00',
    '14:00'::TIME,
    '22:00'::TIME,
    60,
    '1,2,3,4,5',
    'active'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 14. ASIGNAR TURNOS A EMPLEADOS
-- ============================================================================

INSERT INTO employee_shifts (tenant_id, employee_id, shift_id, effective_from)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    '70000000-1000-1000-1000-000000000001'::UUID,
    '90000000-1000-1000-1000-000000000001'::UUID,
    CURRENT_DATE - INTERVAL '30 days'
  )
ON CONFLICT DO NOTHING;

INSERT INTO employee_shifts (tenant_id, employee_id, shift_id, effective_from)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    '70000000-1000-1000-1000-000000000002'::UUID,
    '90000000-1000-1000-1000-000000000001'::UUID,
    CURRENT_DATE - INTERVAL '30 days'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 15. INSERTAR HABILIDADES
-- ============================================================================

INSERT INTO skills (id, tenant_id, name, category, description)
VALUES
  (
    'b0000000-1000-1000-1000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'JavaScript',
    'technical',
    'Lenguaje de programación JavaScript'
  )
ON CONFLICT DO NOTHING;

INSERT INTO skills (id, tenant_id, name, category, description)
VALUES
  (
    'b0000000-1000-1000-1000-000000000002'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Liderazgo',
    'soft',
    'Capacidad de liderazgo y gestión de equipos'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 16. ASIGNAR HABILIDADES A EMPLEADOS
-- ============================================================================

INSERT INTO employee_skills (tenant_id, employee_id, skill_id, proficiency_level, years_of_experience, verified)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    '70000000-1000-1000-1000-000000000001'::UUID,
    'b0000000-1000-1000-1000-000000000001'::UUID,
    'expert',
    8,
    true
  )
ON CONFLICT DO NOTHING;

INSERT INTO employee_skills (tenant_id, employee_id, skill_id, proficiency_level, years_of_experience, verified)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    '70000000-1000-1000-1000-000000000001'::UUID,
    'b0000000-1000-1000-1000-000000000002'::UUID,
    'advanced',
    6,
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 17. INSERTAR ANUNCIOS
-- ============================================================================

INSERT INTO announcements (id, tenant_id, title, content, announcement_type, priority, published_by, status, target_roles, target_departments)
VALUES
  (
    'c0000000-1000-1000-1000-000000000001'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Bienvenida al Sistema ConectAr HR',
    'Nos complace anunciar el lanzamiento de nuestro nuevo sistema de gestión de RRHH. Este sistema modernizará todos nuestros procesos de gestión de recursos humanos.',
    'general',
    'high',
    '10000000-0000-0000-0000-000000000001'::UUID,
    'published',
    jsonb_build_array('40000000-1000-1000-1000-000000000001', '40000000-1000-1000-1000-000000000002', '40000000-1000-1000-1000-000000000003'),
    jsonb_build_array()
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIN DEL SCRIPT DE SEED DATA
-- ============================================================================
-- Datos insertados correctamente.
-- Próximos pasos:
-- 1. Verificar que todos los datos se insertaron correctamente
-- 2. Ejecutar los scripts de RLS policies
-- 3. Configurar las variables de entorno de Supabase
-- ============================================================================
