-- ============================================================================
-- TRIGGERS Y FUNCIONES
-- ConectAr HR Database - Automatización y Auditoría
-- ============================================================================

-- ============================================================================
-- TRIGGER: Actualizar timestamp 'updated_at'
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas que tengan columna updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON leaves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_shifts_updated_at BEFORE UPDATE ON work_shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_shifts_updated_at BEFORE UPDATE ON employee_shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON performance_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_documents_updated_at BEFORE UPDATE ON employee_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_off_requests_updated_at BEFORE UPDATE ON time_off_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_skills_updated_at BEFORE UPDATE ON employee_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON training_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_training_updated_at BEFORE UPDATE ON employee_training
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER: Auditoría automática
-- ============================================================================
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action VARCHAR;
  v_old_values JSONB;
  v_new_values JSONB;
BEGIN
  -- Determinar la acción
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_old_values := NULL;
    v_new_values := row_to_json(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_old_values := row_to_json(OLD);
    v_new_values := row_to_json(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_old_values := row_to_json(OLD);
    v_new_values := NULL;
  END IF;

  -- Insertar en audit_logs (solo si la tabla tiene tenant_id)
  IF TG_TABLE_NAME IN ('employees', 'users', 'payroll', 'leaves', 'attendance', 'documents', 'departments', 'positions', 'roles', 'tenants') THEN
    INSERT INTO audit_logs (
      tenant_id,
      user_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values,
      ip_address,
      user_agent,
      changes_description
    )
    VALUES (
      COALESCE(NEW.tenant_id, OLD.tenant_id),
      get_current_user_id(),
      v_action,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      v_old_values,
      v_new_values,
      COALESCE(current_setting('request.headers')::jsonb->>'x-forwarded-for', 'unknown')::INET,
      current_setting('request.headers')::jsonb->>'user-agent',
      'Cambios automáticos registrados en ' || TG_TABLE_NAME
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar auditoría a tablas principales
CREATE TRIGGER audit_employees AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_payroll AFTER INSERT OR UPDATE OR DELETE ON payroll
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_leaves AFTER INSERT OR UPDATE OR DELETE ON leaves
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_attendance AFTER INSERT OR UPDATE OR DELETE ON attendance
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- ============================================================================
-- TRIGGER: Crear notificaciones para eventos importantes
-- ============================================================================
CREATE OR REPLACE FUNCTION create_notification_on_leave_request()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (
      tenant_id,
      user_id,
      title,
      message,
      notification_type,
      related_resource_type,
      related_resource_id
    )
    SELECT
      NEW.tenant_id,
      ur.user_id,
      'Nueva solicitud de licencia',
      CONCAT('El empleado ', e.first_name, ' ', e.last_name, ' ha solicitado licencia'),
      'leave_request',
      'leaves',
      NEW.id
    FROM employees e
    CROSS JOIN user_roles ur
    CROSS JOIN roles r
    WHERE e.id = NEW.employee_id
    AND ur.role_id = r.id
    AND r.role_type = 'admin'
    AND r.tenant_id = NEW.tenant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_leave_request AFTER INSERT ON leaves
  FOR EACH ROW EXECUTE FUNCTION create_notification_on_leave_request();

-- ============================================================================
-- TRIGGER: Crear notificaciones para aprobación de licencias
-- ============================================================================
CREATE OR REPLACE FUNCTION create_notification_on_leave_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notificar al empleado sobre aprobación
    IF NEW.status = 'approved' THEN
      INSERT INTO notifications (
        tenant_id,
        user_id,
        title,
        message,
        notification_type,
        related_resource_type,
        related_resource_id
      )
      SELECT
        NEW.tenant_id,
        e.user_id,
        'Licencia aprobada',
        'Tu solicitud de licencia ha sido aprobada',
        'leave_request',
        'leaves',
        NEW.id
      FROM employees e
      WHERE e.id = NEW.employee_id
      AND e.user_id IS NOT NULL;

    -- Notificar sobre rechazo
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO notifications (
        tenant_id,
        user_id,
        title,
        message,
        notification_type,
        related_resource_type,
        related_resource_id
      )
      SELECT
        NEW.tenant_id,
        e.user_id,
        'Licencia rechazada',
        'Tu solicitud de licencia ha sido rechazada. Motivo: ' || COALESCE(NEW.rejection_reason, 'No especificado'),
        'leave_request',
        'leaves',
        NEW.id
      FROM employees e
      WHERE e.id = NEW.employee_id
      AND e.user_id IS NOT NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_leave_approval AFTER UPDATE ON leaves
  FOR EACH ROW EXECUTE FUNCTION create_notification_on_leave_approval();

-- ============================================================================
-- TRIGGER: Validar que end_date > start_date en leaves
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_leave_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date <= NEW.start_date THEN
    RAISE EXCEPTION 'La fecha de fin debe ser posterior a la fecha de inicio';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_leave_dates_trigger BEFORE INSERT OR UPDATE ON leaves
  FOR EACH ROW EXECUTE FUNCTION validate_leave_dates();

-- ============================================================================
-- TRIGGER: Validar que employee.contract_end_date >= hire_date
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_employee_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contract_end_date IS NOT NULL AND NEW.contract_end_date < NEW.hire_date THEN
    RAISE EXCEPTION 'La fecha de fin de contrato debe ser posterior a la fecha de contratación';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_employee_dates_trigger BEFORE INSERT OR UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION validate_employee_dates();

-- ============================================================================
-- TRIGGER: Crear notificación cuando se genera nómina
-- ============================================================================
CREATE OR REPLACE FUNCTION create_notification_on_payroll()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (
      tenant_id,
      user_id,
      title,
      message,
      notification_type,
      related_resource_type,
      related_resource_id
    )
    SELECT
      NEW.tenant_id,
      e.user_id,
      'Tu nómina está disponible',
      'Tu recibo de sueldo para el período ' || NEW.payroll_period || ' está disponible',
      'payroll_generated',
      'payroll',
      NEW.id
    FROM employees e
    WHERE e.id = NEW.employee_id
    AND e.user_id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_payroll AFTER INSERT ON payroll
  FOR EACH ROW EXECUTE FUNCTION create_notification_on_payroll();

-- ============================================================================
-- FUNCTION: Calcular horas trabajadas en asistencia
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_working_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_in_time IS NOT NULL AND NEW.check_out_time IS NOT NULL THEN
    NEW.working_hours := EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time)) / 3600.0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_attendance_hours BEFORE INSERT OR UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION calculate_working_hours();

-- ============================================================================
-- FUNCTION: Actualizar estado de empleado cuando se termina
-- ============================================================================
CREATE OR REPLACE FUNCTION update_employee_status_on_termination()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'terminated' AND OLD.status != 'terminated' THEN
    IF NEW.termination_date IS NULL THEN
      NEW.termination_date := CURRENT_DATE;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_employee_termination BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_employee_status_on_termination();

-- ============================================================================
-- FUNCTION: Validar unicidad de employee_code por tenant
-- ============================================================================
-- Ya está definido en schema.sql con UNIQUE(tenant_id, employee_code)

-- ============================================================================
-- FUNCTION: Validar que no haya duplicados en leave_balances
-- ============================================================================
-- Ya está definido en schema.sql con UNIQUE(tenant_id, employee_id, leave_type_id, year)

-- ============================================================================
-- FUNCTION: Obtener empleados por departamento
-- ============================================================================
CREATE OR REPLACE FUNCTION get_employees_by_department(
  p_tenant_id UUID,
  p_department_id UUID
)
RETURNS TABLE (
  id UUID,
  employee_code VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR,
  position_name VARCHAR,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    p.name,
    e.status
  FROM employees e
  JOIN positions p ON e.position_id = p.id
  WHERE e.tenant_id = p_tenant_id
  AND e.department_id = p_department_id
  AND e.deleted_at IS NULL
  ORDER BY e.first_name, e.last_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Obtener saldo de licencias de un empleado
-- ============================================================================
CREATE OR REPLACE FUNCTION get_leave_balance(
  p_employee_id UUID,
  p_leave_type_id UUID,
  p_year INTEGER
)
RETURNS TABLE (
  total_days NUMERIC,
  used_days NUMERIC,
  pending_approval_days NUMERIC,
  approved_days NUMERIC,
  remaining_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lb.total_days,
    lb.used_days,
    lb.pending_approval_days,
    lb.approved_days,
    (lb.total_days - lb.used_days - lb.pending_approval_days)::NUMERIC AS remaining_days
  FROM leave_balances lb
  WHERE lb.employee_id = p_employee_id
  AND lb.leave_type_id = p_leave_type_id
  AND lb.year = p_year;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Obtener asistencia de un empleado en un rango de fechas
-- ============================================================================
CREATE OR REPLACE FUNCTION get_employee_attendance(
  p_employee_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  date DATE,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR,
  working_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.date,
    a.check_in_time,
    a.check_out_time,
    a.status,
    a.working_hours
  FROM attendance a
  WHERE a.employee_id = p_employee_id
  AND a.date BETWEEN p_start_date AND p_end_date
  ORDER BY a.date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FIN DE TRIGGERS Y FUNCIONES
-- ============================================================================
