-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ConectAr HR - Multi-Tenant Architecture
-- ============================================================================
-- Las políticas de RLS garantizan que los datos están correctamente aislados
-- por tenant y que los usuarios solo pueden acceder a la información permitida.
-- ============================================================================

-- ============================================================================
-- FUNCIÓN AUXILIAR: Obtener tenant_id actual
-- ============================================================================
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'tenant_id')::UUID;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- FUNCIÓN AUXILIAR: Verificar si el usuario es super admin
-- ============================================================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() ->> 'is_super_admin')::BOOLEAN = true;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- FUNCIÓN AUXILIAR: Obtener user_id actual
-- ============================================================================
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- TABLA: tenants
-- ============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Super admin puede ver todos los tenants
CREATE POLICY "super_admin_select_all_tenants"
ON tenants FOR SELECT
USING (is_super_admin());

-- Los usuarios normales solo ven su propio tenant
CREATE POLICY "users_see_own_tenant"
ON tenants FOR SELECT
USING (
  get_current_tenant_id() = id
);

-- Solo super admin puede crear tenants
CREATE POLICY "super_admin_create_tenants"
ON tenants FOR INSERT
WITH CHECK (is_super_admin());

-- Solo super admin puede actualizar tenants
CREATE POLICY "super_admin_update_tenants"
ON tenants FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- ============================================================================
-- TABLA: users
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver a otros usuarios del mismo tenant
CREATE POLICY "users_see_same_tenant"
ON users FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
);

-- Super admin ve todos los usuarios
CREATE POLICY "super_admin_see_all_users"
ON users FOR SELECT
USING (is_super_admin());

-- Los administradores de tenant pueden crear usuarios
CREATE POLICY "tenant_admin_create_users"
ON users FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own_profile"
ON users FOR UPDATE
USING (id = get_current_user_id())
WITH CHECK (id = get_current_user_id());

-- Los administradores pueden actualizar usuarios del mismo tenant
CREATE POLICY "tenant_admin_update_users"
ON users FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: employees
-- ============================================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Usuarios del mismo tenant pueden ver empleados (con algunas excepciones)
CREATE POLICY "users_see_employees_same_tenant"
ON employees FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
);

-- Los administradores pueden crear empleados
CREATE POLICY "tenant_admin_create_employees"
ON employees FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type IN ('admin', 'manager')
    AND r.tenant_id = tenant_id
  )
);

-- Los administradores y managers pueden actualizar empleados
CREATE POLICY "tenant_admin_manager_update_employees"
ON employees FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type IN ('admin', 'manager')
    AND r.tenant_id = tenant_id
  )
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type IN ('admin', 'manager')
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: attendance
-- ============================================================================
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Los empleados pueden ver su propia asistencia
CREATE POLICY "employees_see_own_attendance"
ON attendance FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND employee_id = (
    SELECT id FROM employees
    WHERE user_id = get_current_user_id()
    AND tenant_id = attendance.tenant_id
  )
);

-- Los managers y admins pueden ver asistencia de su departamento
CREATE POLICY "managers_see_attendance_department"
ON attendance FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM employees e1
    WHERE e1.user_id = get_current_user_id()
    AND e1.tenant_id = attendance.tenant_id
    AND EXISTS (
      SELECT 1 FROM employees e2
      WHERE e2.id = attendance.employee_id
      AND e2.department_id = e1.department_id
    )
  )
);

-- Los admins ven toda la asistencia del tenant
CREATE POLICY "admins_see_all_attendance"
ON attendance FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- Los empleados pueden registrar su propia asistencia
CREATE POLICY "employees_insert_own_attendance"
ON attendance FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND employee_id = (
    SELECT id FROM employees
    WHERE user_id = get_current_user_id()
    AND tenant_id = attendance.tenant_id
  )
);

-- Los admins pueden crear asistencia para otros empleados
CREATE POLICY "admins_insert_attendance"
ON attendance FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: leaves
-- ============================================================================
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- Los empleados pueden ver sus propias solicitudes
CREATE POLICY "employees_see_own_leaves"
ON leaves FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND employee_id = (
    SELECT id FROM employees
    WHERE user_id = get_current_user_id()
    AND tenant_id = leaves.tenant_id
  )
);

-- Los admins ven todas las solicitudes
CREATE POLICY "admins_see_all_leaves"
ON leaves FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- Los empleados pueden solicitar licencias
CREATE POLICY "employees_insert_own_leaves"
ON leaves FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND employee_id = (
    SELECT id FROM employees
    WHERE user_id = get_current_user_id()
    AND tenant_id = leaves.tenant_id
  )
);

-- Los empleados pueden cancelar sus propias solicitudes
CREATE POLICY "employees_update_own_leaves"
ON leaves FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND employee_id = (
    SELECT id FROM employees
    WHERE user_id = get_current_user_id()
    AND tenant_id = leaves.tenant_id
  )
  AND status = 'pending'
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND employee_id = (
    SELECT id FROM employees
    WHERE user_id = get_current_user_id()
    AND tenant_id = leaves.tenant_id
  )
);

-- Los admins pueden aprobar/rechazar solicitudes
CREATE POLICY "admins_update_leaves"
ON leaves FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: payroll
-- ============================================================================
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Los empleados pueden ver su propia nómina
CREATE POLICY "employees_see_own_payroll"
ON payroll FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND employee_id = (
    SELECT id FROM employees
    WHERE user_id = get_current_user_id()
    AND tenant_id = payroll.tenant_id
  )
);

-- Los admins ven toda la nómina
CREATE POLICY "admins_see_all_payroll"
ON payroll FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- Solo los admins pueden crear/actualizar nómina
CREATE POLICY "admins_manage_payroll"
ON payroll FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

CREATE POLICY "admins_update_payroll"
ON payroll FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: documents
-- ============================================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Los empleados pueden ver sus propios documentos
CREATE POLICY "employees_see_own_documents"
ON documents FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND employee_id = (
    SELECT id FROM employees
    WHERE user_id = get_current_user_id()
    AND tenant_id = documents.tenant_id
  )
);

-- Los admins ven todos los documentos
CREATE POLICY "admins_see_all_documents"
ON documents FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- Los empleados pueden subir sus documentos
CREATE POLICY "employees_upload_own_documents"
ON documents FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND employee_id = (
    SELECT id FROM employees
    WHERE user_id = get_current_user_id()
    AND tenant_id = documents.tenant_id
  )
);

-- Los admins pueden gestionar documentos
CREATE POLICY "admins_manage_documents"
ON documents FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: notifications
-- ============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo ven sus propias notificaciones
CREATE POLICY "users_see_own_notifications"
ON notifications FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND user_id = get_current_user_id()
);

-- Los usuarios pueden actualizar sus notificaciones (marcar como leída)
CREATE POLICY "users_update_own_notifications"
ON notifications FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND user_id = get_current_user_id()
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND user_id = get_current_user_id()
);

-- ============================================================================
-- TABLA: announcements
-- ============================================================================
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios pueden ver anuncios publicados
CREATE POLICY "users_see_published_announcements"
ON announcements FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND status = 'published'
);

-- Los admins ven todos los anuncios
CREATE POLICY "admins_see_all_announcements"
ON announcements FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- Solo los admins pueden crear anuncios
CREATE POLICY "admins_create_announcements"
ON announcements FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: departments
-- ============================================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios ven departamentos del mismo tenant
CREATE POLICY "users_see_same_tenant_departments"
ON departments FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
);

-- Solo admins pueden crear/actualizar departamentos
CREATE POLICY "admins_manage_departments"
ON departments FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

CREATE POLICY "admins_update_departments"
ON departments FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: positions
-- ============================================================================
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios ven puestos del mismo tenant
CREATE POLICY "users_see_same_tenant_positions"
ON positions FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
);

-- Solo admins pueden gestionar puestos
CREATE POLICY "admins_manage_positions"
ON positions FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

CREATE POLICY "admins_update_positions"
ON positions FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: roles
-- ============================================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios ven roles de su tenant
CREATE POLICY "users_see_same_tenant_roles"
ON roles FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
);

-- Solo admins pueden gestionar roles
CREATE POLICY "admins_manage_roles"
ON roles FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND is_system_role = FALSE
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

CREATE POLICY "admins_update_roles"
ON roles FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND is_system_role = FALSE
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND is_system_role = FALSE
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: audit_logs
-- ============================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver logs de auditoría
CREATE POLICY "admins_see_audit_logs"
ON audit_logs FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- Función de auditoría inserta automáticamente (ver triggers)
CREATE POLICY "system_insert_audit_logs"
ON audit_logs FOR INSERT
WITH CHECK (TRUE);

-- ============================================================================
-- TABLA: company_settings
-- ============================================================================
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios ven la configuración de su tenant
CREATE POLICY "users_see_company_settings"
ON company_settings FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
);

-- Solo admins pueden actualizar configuración
CREATE POLICY "admins_update_company_settings"
ON company_settings FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- TABLA: leave_types
-- ============================================================================
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios ven tipos de licencia de su tenant
CREATE POLICY "users_see_leave_types"
ON leave_types FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
);

-- Solo admins pueden gestionar tipos de licencia
CREATE POLICY "admins_manage_leave_types"
ON leave_types FOR INSERT
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

CREATE POLICY "admins_update_leave_types"
ON leave_types FOR UPDATE
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
)
WITH CHECK (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
    AND r.tenant_id = tenant_id
  )
);

-- ============================================================================
-- FIN DE LAS POLÍTICAS RLS
-- ============================================================================
