-- ============================================================================
-- ÚTILES: Consultas Comunes y Reportes
-- ConectAr HR - Ejemplos para desarrollo y análisis
-- ============================================================================

-- ============================================================================
-- SECCIÓN 1: REPORTES DE EMPLEADOS
-- ============================================================================

-- 1.1 Directorio de empleados por departamento
SELECT
  d.name as departamento,
  e.employee_code as codigo,
  e.first_name || ' ' || e.last_name as nombre,
  e.email,
  p.name as puesto,
  e.salary as salario,
  e.status as estado,
  e.hire_date as fecha_ingreso
FROM employees e
JOIN departments d ON e.department_id = d.id
JOIN positions p ON e.position_id = p.id
WHERE e.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND e.deleted_at IS NULL
ORDER BY d.name, e.first_name;

-- 1.2 Empleados próximos a vencer contrato
SELECT
  e.first_name || ' ' ' e.last_name as nombre,
  e.employee_code,
  e.contract_end_date,
  d.name as departamento,
  (e.contract_end_date - CURRENT_DATE) as dias_restantes
FROM employees e
JOIN departments d ON e.department_id = d.id
WHERE e.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND e.contract_end_date IS NOT NULL
AND e.contract_end_date < CURRENT_DATE + INTERVAL '90 days'
AND e.status != 'terminated'
ORDER BY e.contract_end_date ASC;

-- 1.3 Análisis de turnover (empleados despedidos vs activos)
SELECT
  DATE_TRUNC('month', e.termination_date)::date as mes,
  COUNT(CASE WHEN e.status = 'terminated' THEN 1 END) as despidos,
  COUNT(CASE WHEN e.status = 'active' THEN 1 END) as activos,
  ROUND(
    COUNT(CASE WHEN e.status = 'terminated' THEN 1 END)::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as tasa_rotacion
FROM employees e
WHERE e.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND e.termination_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', e.termination_date)
ORDER BY mes DESC;

-- 1.4 Distribución salarial por departamento y puesto
SELECT
  d.name as departamento,
  p.name as puesto,
  COUNT(e.id) as cantidad,
  ROUND(AVG(e.salary)::numeric, 2) as salario_promedio,
  MIN(e.salary) as salario_minimo,
  MAX(e.salary) as salario_maximo,
  ROUND(STDDEV(e.salary)::numeric, 2) as desviacion_estandar
FROM employees e
JOIN departments d ON e.department_id = d.id
JOIN positions p ON e.position_id = p.id
WHERE e.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND e.status = 'active'
GROUP BY d.id, d.name, p.id, p.name
ORDER BY d.name, AVG(e.salary) DESC;

-- ============================================================================
-- SECCIÓN 2: REPORTES DE ASISTENCIA
-- ============================================================================

-- 2.1 Asistencia del mes actual
SELECT
  e.first_name || ' ' || e.last_name as empleado,
  e.employee_code,
  COUNT(*) as dias_registrados,
  SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentes,
  SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as ausentes,
  SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as retrasados,
  SUM(CASE WHEN a.status = 'half_day' THEN 1 ELSE 0 END) as medio_dia,
  ROUND(SUM(COALESCE(a.working_hours, 0))::numeric, 2) as horas_trabajadas
FROM attendance a
JOIN employees e ON a.employee_id = e.id
WHERE a.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY e.id, e.first_name, e.last_name, e.employee_code
ORDER BY presentes DESC, retrasados DESC;

-- 2.2 Empleados con retardos frecuentes (últimos 30 días)
SELECT
  e.first_name || ' ' || e.last_name as empleado,
  e.employee_code,
  COUNT(CASE WHEN a.status = 'late' THEN 1 END) as dias_retrasado,
  ROUND(AVG(CASE WHEN a.status = 'late' THEN a.late_minutes ELSE 0 END)::numeric, 2) as minutos_promedio_retardo,
  d.name as departamento
FROM attendance a
JOIN employees e ON a.employee_id = e.id
JOIN departments d ON e.department_id = d.id
WHERE a.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND a.date >= CURRENT_DATE - INTERVAL '30 days'
AND a.status = 'late'
GROUP BY e.id, e.first_name, e.last_name, e.employee_code, d.id, d.name
HAVING COUNT(CASE WHEN a.status = 'late' THEN 1 END) >= 3
ORDER BY dias_retrasado DESC;

-- 2.3 Promedio de horas trabajadas por día y departamento
SELECT
  d.name as departamento,
  DATE_TRUNC('week', a.date)::date as semana,
  ROUND(AVG(COALESCE(a.working_hours, 0))::numeric, 2) as horas_promedio,
  COUNT(DISTINCT a.employee_id) as empleados_registrados,
  COUNT(CASE WHEN a.status = 'present' THEN 1 END) as dias_presente
FROM attendance a
JOIN employees e ON a.employee_id = e.id
JOIN departments d ON e.department_id = d.id
WHERE a.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND a.date >= CURRENT_DATE - INTERVAL '60 days'
GROUP BY d.id, d.name, DATE_TRUNC('week', a.date)
ORDER BY d.name, DATE_TRUNC('week', a.date) DESC;

-- ============================================================================
-- SECCIÓN 3: REPORTES DE LICENCIAS
-- ============================================================================

-- 3.1 Saldo de licencias por empleado (año actual)
SELECT
  e.first_name || ' ' || e.last_name as empleado,
  e.employee_code,
  lt.name as tipo_licencia,
  lb.total_days as dias_asignados,
  lb.used_days as dias_utilizados,
  lb.pending_approval_days as dias_pendiente_aprobacion,
  (lb.total_days - lb.used_days - lb.pending_approval_days) as dias_disponibles,
  ROUND(
    ((lb.total_days - lb.used_days - lb.pending_approval_days) / lb.total_days * 100)::numeric, 2
  ) as porcentaje_disponible
FROM leave_balances lb
JOIN employees e ON lb.employee_id = e.id
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE lb.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND lb.year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY e.first_name, lt.name;

-- 3.2 Solicitudes de licencia pendientes de aprobación
SELECT
  l.id,
  e.first_name || ' ' || e.last_name as empleado,
  e.employee_code,
  lt.name as tipo_licencia,
  l.start_date as fecha_inicio,
  l.end_date as fecha_fin,
  l.days_count as dias_solicitados,
  l.reason as motivo,
  l.requested_at as fecha_solicitud,
  d.name as departamento
FROM leaves l
JOIN employees e ON l.employee_id = e.id
JOIN leave_types lt ON l.leave_type_id = lt.id
JOIN departments d ON e.department_id = d.id
WHERE l.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND l.status = 'pending'
ORDER BY l.requested_at ASC;

-- 3.3 Licencias por mes (aprobadas)
SELECT
  DATE_TRUNC('month', l.start_date)::date as mes,
  lt.name as tipo_licencia,
  COUNT(DISTINCT l.employee_id) as cantidad_empleados,
  SUM(l.days_count) as dias_totales,
  ROUND(AVG(l.days_count)::numeric, 2) as dias_promedio
FROM leaves l
JOIN leave_types lt ON l.leave_type_id = lt.id
WHERE l.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND l.status = 'approved'
AND l.start_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', l.start_date), lt.id, lt.name
ORDER BY mes DESC, lt.name;

-- 3.4 Próximas licencias aprobadas
SELECT
  e.first_name || ' ' || e.last_name as empleado,
  e.employee_code,
  lt.name as tipo_licencia,
  l.start_date as inicio,
  l.end_date as fin,
  l.days_count as dias,
  (l.start_date - CURRENT_DATE) as dias_hasta_inicio
FROM leaves l
JOIN employees e ON l.employee_id = e.id
JOIN leave_types lt ON l.leave_type_id = lt.id
WHERE l.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND l.status = 'approved'
AND l.start_date >= CURRENT_DATE
AND l.start_date <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY l.start_date ASC;

-- ============================================================================
-- SECCIÓN 4: REPORTES DE NÓMINA
-- ============================================================================

-- 4.1 Resumen de nómina por período
SELECT
  p.payroll_period as periodo,
  COUNT(DISTINCT p.employee_id) as cantidad_empleados,
  SUM(p.base_salary)::numeric(15,2) as salario_base_total,
  SUM(p.gross_salary)::numeric(15,2) as salario_bruto_total,
  SUM(p.net_salary)::numeric(15,2) as salario_neto_total,
  ROUND(AVG(p.base_salary)::numeric, 2) as salario_promedio,
  COUNT(CASE WHEN p.status = 'draft' THEN 1 END) as borradores,
  COUNT(CASE WHEN p.status = 'approved' THEN 1 END) as aprobadas,
  COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as pagadas
FROM payroll p
WHERE p.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
GROUP BY p.payroll_period
ORDER BY p.payroll_period DESC
LIMIT 12;

-- 4.2 Nómina de un empleado (últimos 6 meses)
SELECT
  p.payroll_period as periodo,
  p.period_start as fecha_inicio,
  p.period_end as fecha_fin,
  p.base_salary::numeric(15,2) as salario_base,
  p.gross_salary::numeric(15,2) as bruto,
  p.net_salary::numeric(15,2) as neto,
  (p.gross_salary - p.net_salary)::numeric(15,2) as descuentos,
  p.status as estado,
  p.paid_at as fecha_pago
FROM payroll p
WHERE p.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND p.employee_id = '70000000-1000-1000-1000-000000000001'::UUID
ORDER BY p.payroll_period DESC
LIMIT 6;

-- 4.3 Detalles de componentes de nómina
SELECT
  p.payroll_period as periodo,
  e.first_name || ' ' || e.last_name as empleado,
  pc.component_name as componente,
  pc.component_type as tipo,
  pc.amount::numeric(15,2) as monto,
  CASE WHEN pc.is_deduction THEN 'Descuento' ELSE 'Haber' END as categoria
FROM payroll p
JOIN employees e ON p.employee_id = e.id
JOIN payroll_components pc ON p.id = pc.payroll_id
WHERE p.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND p.payroll_period = '2026-04'
ORDER BY e.first_name, pc.component_type, pc.component_name;

-- 4.4 Análisis de costos de personal por departamento (mes actual)
SELECT
  d.name as departamento,
  COUNT(DISTINCT p.employee_id) as cantidad_empleados,
  SUM(p.gross_salary)::numeric(15,2) as costo_bruto,
  SUM(p.net_salary)::numeric(15,2) as costo_neto,
  ROUND(AVG(p.gross_salary)::numeric, 2) as costo_promedio_por_empleado,
  ROUND(SUM(p.gross_salary - p.net_salary)::numeric, 2) as total_descuentos
FROM payroll p
JOIN employees e ON p.employee_id = e.id
JOIN departments d ON e.department_id = d.id
WHERE p.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND p.payroll_period = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
GROUP BY d.id, d.name
ORDER BY SUM(p.gross_salary) DESC;

-- ============================================================================
-- SECCIÓN 5: REPORTES DE AUDITORÍA
-- ============================================================================

-- 5.1 Cambios recientes en empleados
SELECT
  al.created_at as fecha,
  u.email as realizado_por,
  al.action as accion,
  al.resource_type as tipo_recurso,
  al.changes_description as descripcion,
  al.old_values::text as valores_anteriores,
  al.new_values::text as valores_nuevos
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND al.resource_type = 'employees'
AND al.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY al.created_at DESC;

-- 5.2 Usuarios más activos (últimos 30 días)
SELECT
  u.email,
  u.first_name || ' ' || u.last_name as nombre,
  COUNT(*) as cambios_realizados,
  COUNT(DISTINCT al.resource_type) as tipos_recursos,
  MAX(al.created_at) as ultimo_cambio
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND al.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.email, u.first_name, u.last_name
ORDER BY COUNT(*) DESC
LIMIT 20;

-- 5.3 Acciones de eliminación (últimos 90 días)
SELECT
  al.created_at as fecha,
  u.email as realizado_por,
  al.resource_type as tipo_recurso,
  al.resource_id as id_recurso,
  al.old_values::text as datos_eliminados
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND al.action = 'delete'
AND al.created_at >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY al.created_at DESC;

-- ============================================================================
-- SECCIÓN 6: REPORTES DE DOCUMENTOS
-- ============================================================================

-- 6.1 Documentos próximos a vencer
SELECT
  e.first_name || ' ' || e.last_name as empleado,
  e.employee_code,
  d.document_type as tipo_documento,
  d.expiry_date as fecha_vencimiento,
  (d.expiry_date - CURRENT_DATE) as dias_restantes,
  d.status as estado
FROM documents d
JOIN employees e ON d.employee_id = e.id
WHERE d.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND d.expiry_date IS NOT NULL
AND d.status = 'active'
AND d.expiry_date < CURRENT_DATE + INTERVAL '90 days'
ORDER BY d.expiry_date ASC;

-- 6.2 Documentos vencidos
SELECT
  e.first_name || ' ' || e.last_name as empleado,
  e.employee_code,
  d.document_type as tipo_documento,
  d.expiry_date as fecha_vencimiento,
  (CURRENT_DATE - d.expiry_date) as dias_vencido,
  d.status as estado
FROM documents d
JOIN employees e ON d.employee_id = e.id
WHERE d.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND d.expiry_date IS NOT NULL
AND d.expiry_date < CURRENT_DATE
AND d.status != 'archived'
ORDER BY d.expiry_date DESC;

-- ============================================================================
-- SECCIÓN 7: REPORTES DE USUARIOS Y ACCESOS
-- ============================================================================

-- 7.1 Usuarios activos por rol
SELECT
  r.name as rol,
  COUNT(DISTINCT u.id) as cantidad_usuarios,
  COUNT(CASE WHEN u.status = 'active' THEN 1 END) as usuarios_activos,
  COUNT(CASE WHEN u.status = 'inactive' THEN 1 END) as usuarios_inactivos,
  MAX(u.last_login_at) as ultimo_login
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
WHERE u.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
GROUP BY r.id, r.name
ORDER BY COUNT(DISTINCT u.id) DESC;

-- 7.2 Usuarios sin actividad (últimos 30 días)
SELECT
  u.email,
  u.first_name || ' ' || u.last_name as nombre,
  u.status,
  u.last_login_at as ultimo_acceso,
  (CURRENT_TIMESTAMP - u.last_login_at) as dias_sin_acceso,
  ARRAY_AGG(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID
AND (u.last_login_at < CURRENT_TIMESTAMP - INTERVAL '30 days' OR u.last_login_at IS NULL)
GROUP BY u.id, u.email, u.first_name, u.last_name, u.status, u.last_login_at
ORDER BY u.last_login_at ASC NULLS FIRST;

-- ============================================================================
-- SECCIÓN 8: UTILIDADES Y MANTENIMIENTO
-- ============================================================================

-- 8.1 Limpiar notificaciones expiradas
DELETE FROM notifications
WHERE expires_at < CURRENT_TIMESTAMP
AND is_read = true;

-- 8.2 Limpiar logs de auditoría antiguos (> 24 meses)
DELETE FROM audit_logs
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '24 months';

-- 8.3 Actualizar estado de documentos vencidos
UPDATE documents
SET status = 'expired'
WHERE status = 'active'
AND expiry_date IS NOT NULL
AND expiry_date < CURRENT_DATE;

-- 8.4 Estadísticas de la base de datos
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamaño_total,
  n_live_tup as filas_activas,
  n_dead_tup as filas_muertas,
  ROUND((n_dead_tup::float / NULLIF(n_live_tup, 0) * 100)::numeric, 2) as porcentaje_dead_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 8.5 Vacío completo de base de datos (limpieza)
VACUUM ANALYZE;

-- ============================================================================
-- FIN DE CONSULTAS ÚTILES
-- ============================================================================
