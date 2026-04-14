# Arquitectura de Base de Datos - ConectAr HR

## Resumen Ejecutivo

ConectAr HR implementa una **arquitectura multi-tenant enterprise-grade** diseñada para soportar la gestión de recursos humanos en múltiples organizaciones de forma segura, escalable y resiliente.

**Stack Tecnológico**:
- **Database**: PostgreSQL 14+ (Supabase)
- **ORM/Query Builder**: Supabase JS Client (realtime sync)
- **Seguridad**: Row Level Security (RLS) + JWT
- **Auditoría**: Triggers automáticos
- **Escalabilidad**: Índices optimizados + conexión pooling

---

## 1. Modelo de Datos Multi-Tenant

### 1.1 Aislamiento Horizontal

```
┌─────────────────────────────────────────────────┐
│              SINGLE DATABASE                      │
├─────────────────────────────────────────────────┤
│                                                   │
│  Tenant A Data    │   Tenant B Data   │ Tenant C │
│  (tenant_id='a')  │   (tenant_id='b') │ (tenant_ │
│                   │                   │   id='c')│
│                   │                   │          │
│  Employees(A)     │   Employees(B)    │Employees │
│  Payroll(A)       │   Payroll(B)      │(C)       │
│  Leaves(A)        │   Leaves(B)       │Leaves(C) │
│                   │                   │          │
└─────────────────────────────────────────────────┘
```

**Ventajas**:
- ✅ Escalabilidad económica
- ✅ Backups centralizados
- ✅ Actualización de schema simplificada
- ✅ Reportes cross-tenant posibles

**Desventajas**:
- ⚠️ Requiere RLS perfecto (seguridad crítica)
- ⚠️ Query tuning más complejo

### 1.2 Relaciones Principales

```sql
tenants (1) ──┬─→ (∞) users
              ├─→ (∞) employees
              ├─→ (∞) departments
              ├─→ (∞) positions
              ├─→ (∞) attendance
              ├─→ (∞) leaves
              ├─→ (∞) payroll
              └─→ (∞) company_settings

employees (1) ──┬─→ (∞) attendance
                ├─→ (∞) leaves
                ├─→ (∞) payroll
                ├─→ (∞) documents
                ├─→ (∞) performance_reviews
                ├─→ (∞) employee_skills
                └─→ (∞) employee_training

users (1) ──┬─→ (∞) user_roles
            ├─→ (∞) notifications
            └─→ (∞) audit_logs

roles (1) ──┬─→ (∞) role_permissions
            └─→ (∞) user_roles
```

---

## 2. Estrategia de Seguridad

### 2.1 Capas de Seguridad

```
┌─────────────────────────────────────────────────┐
│           APLICACIÓN CLIENTE (Next.js)           │
│  - Validación de entrada con Zod                │
│  - Verificación de permisos en UI               │
│  - HTTPS only, cookies secure                   │
└────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│         JWT TOKEN (Signed by Supabase)          │
│  - sub: user_id                                 │
│  - tenant_id: empresa del usuario               │
│  - aud: proyecto Supabase                       │
│  - exp: 1 hora                                  │
│  - refresh_token: 7 días                        │
└────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│       ROW LEVEL SECURITY (PostgreSQL)            │
│  - Función: get_current_tenant_id()             │
│  - Función: get_current_user_id()               │
│  - Políticas: SELECT, INSERT, UPDATE, DELETE    │
└────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│      DATABASE (PostgreSQL con RBLS)              │
│  - Encriptación en tránsito (SSL)               │
│  - Encriptación en reposo (Supabase)            │
│  - Aislamiento de datos por tenant               │
└─────────────────────────────────────────────────┘
```

### 2.2 Matriz de Acceso (RLS)

| Tabla | Super Admin | Admin Tenant | Manager | Employee |
|-------|-------------|-------------|---------|----------|
| users | ✅ RW | ✅ CRU | ❌ | ❌ |
| employees | ✅ RW | ✅ CRU | ✅ RU(dept) | ✅ R(self) |
| attendance | ✅ RW | ✅ CRU | ✅ R(dept) | ✅ RC(self) |
| leaves | ✅ RW | ✅ CRUA | ✅ RA(dept) | ✅ RC(self) |
| payroll | ✅ RW | ✅ CRU | ✅ R(dept) | ✅ R(self) |
| roles | ✅ RW | ✅ CRU | ❌ | ❌ |
| audit_logs | ✅ R | ✅ R | ❌ | ❌ |

**Leyenda**: R=Read, C=Create, U=Update, D=Delete, A=Approve

### 2.3 Ejemplo de Política RLS

```sql
-- Empleados ven su propia asistencia
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

-- Managers ven asistencia de su departamento
CREATE POLICY "managers_see_attendance_department"
ON attendance FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM employees e1
    WHERE e1.user_id = get_current_user_id()
    AND EXISTS (
      SELECT 1 FROM employees e2
      WHERE e2.id = attendance.employee_id
      AND e2.department_id = e1.department_id
    )
  )
);

-- Admins ven toda la asistencia
CREATE POLICY "admins_see_all_attendance"
ON attendance FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.role_type = 'admin'
  )
);
```

---

## 3. Modelo de Datos Detallado

### 3.1 Tablas Core

#### **tenants** (Maestro de empresas)
```
├─ Campos: id, name, slug, status, subscription_plan, features, max_employees
├─ Índices: tenant_id (cluster key), status
├─ Constraints: UNIQUE(slug), CHECK(status), CHECK(subscription_plan)
└─ RLS: Super admin ve todas; usuarios ven su tenant
```

#### **users** (Usuarios del sistema)
```
├─ Campos: id (FK auth), tenant_id, email, status, is_super_admin, roles
├─ Índices: idx_users_tenant_email (compound), idx_users_status
├─ Constraints: UNIQUE(tenant_id, email), NOT NULL(tenant_id)
└─ RLS: Ven usuarios del mismo tenant; pueden actualizar propio perfil
```

#### **employees** (Registro maestro de empleados)
```
├─ Campos: id, tenant_id, user_id, employee_code, personal_info
│          department_id, position_id, salary, employment_type, status
├─ Índices: idx_employees_tenant_id, idx_employees_status, 
│           idx_employees_department_id, idx_employees_position_id
├─ Constraints: UNIQUE(tenant_id, employee_code), 
│               UNIQUE(tenant_id, id_number),
│               FK(department_id, position_id)
└─ RLS: Admins CRU; employees R(self); managers RU(dept)
```

#### **departments** (Estructura organizacional)
```
├─ Campos: id, tenant_id, name, parent_department_id (jerarquía),
│          manager_id, cost_center, budget_allocated
├─ Índices: idx_departments_tenant_id, idx_departments_parent_id
├─ Constraints: UNIQUE(tenant_id, name), FK(parent_department_id) self-referencing
└─ RLS: Todos ven; solo admins modifican
```

#### **positions** (Catálogo de puestos)
```
├─ Campos: id, tenant_id, name, department_id, salary_range_min/max, level
├─ Índices: idx_positions_tenant_id, idx_positions_department_id
├─ Constraints: UNIQUE(tenant_id, name), NOT NULL(department_id)
└─ RLS: Todos ven; solo admins modifican
```

### 3.2 Tablas de Operación

#### **attendance** (Control de asistencia)
```
├─ Campos: id, tenant_id, employee_id, date, check_in/out_time, status,
│          check_in_method, working_hours, notes
├─ Índices: idx_attendance_employee_date (compound), idx_attendance_status
├─ Constraints: UNIQUE(tenant_id, employee_id, date)
├─ Triggers: calculate_working_hours (before insert/update)
└─ RLS: Employees RC(self); managers R(dept); admins CRUD
```

#### **leaves** (Gestión de licencias)
```
├─ Campos: id, tenant_id, employee_id, leave_type_id, start/end_date,
│          days_count, status, reason, approved_by, approved_at
├─ Índices: idx_leaves_employee_status (compound), idx_leaves_status
├─ Constraints: end_date > start_date
├─ Triggers: create_notification_on_leave_request, create_notification_on_approval
└─ RLS: Employees CR(self, pending only); admins CRUD
```

#### **leave_balances** (Saldos acumulados)
```
├─ Campos: id, tenant_id, employee_id, leave_type_id, year,
│          total_days, used_days, pending_approval_days, rollover_days
├─ Indices: idx_leave_balances_employee_leave_year (compound)
├─ Constraints: UNIQUE(tenant_id, employee_id, leave_type_id, year)
├─ Logic: updated by triggers when leaves are approved/used
└─ RLS: Employees R(self); admins RCU
```

#### **payroll** (Nómina/Recibos)
```
├─ Campos: id, tenant_id, employee_id, payroll_period (YYYY-MM),
│          period_start/end, base/gross/net_salary, status, issued_at,
│          approved_by/at, payment_method, reference_number
├─ Indices: idx_payroll_employee_period (compound), idx_payroll_status
├─ Constraints: UNIQUE(tenant_id, employee_id, payroll_period),
│               period_end >= period_start
├─ Triggers: create_notification_on_payroll (INSERT)
└─ RLS: Employees R(self); admins CRUD; managers R(dept)
```

#### **payroll_components** (Detalles: haberes y descuentos)
```
├─ Campos: id, payroll_id, component_type (salary, overtime, tax, etc),
│          component_name, amount, is_deduction, calculation_method
├─ Constraints: FK(payroll_id) ON DELETE CASCADE
└─ No RLS (hereda de payroll)
```

### 3.3 Tablas de Soporte

#### **documents** (Documentos empleados)
```
├─ Campos: id, tenant_id, employee_id, document_type, file_url, 
│          file_size, expiry_date, status (active, expired, archived)
├─ Constraints: FK(employee_id) ON DELETE CASCADE
├─ Índices: idx_documents_expiry_date (para detectar vencimientos)
└─ RLS: Employees R(self); admins CRUD
```

#### **audit_logs** (Auditoría completa)
```
├─ Campos: id, tenant_id, user_id, action, resource_type, resource_id,
│          old_values, new_values, ip_address, user_agent, created_at
├─ Triggers: audit_log_changes (on all CRUD operations)
├─ Indices: idx_audit_logs_tenant_created_at (para queries rápidas)
├─ Retention: 24 meses (política de limpieza)
└─ RLS: Solo admins leen; sistema inserta
```

#### **notifications** (Sistema de notificaciones)
```
├─ Campos: id, tenant_id, user_id, title, message, notification_type,
│          related_resource_type/id, is_read, read_at, expires_at
├─ Indices: idx_notifications_user_read (compound)
├─ Triggers: create_notification_on_leave_request, on_leave_approval, on_payroll
├─ Retention: 30 días (auto-expira)
└─ RLS: Usuarios R(self); pueden marcar como leída
```

---

## 4. Patrones de Acceso y Consultas Críticas

### 4.1 Consultas Frecuentes

```sql
-- 1. Obtener nómina de empleado actual (con componentes)
SELECT p.*, array_agg(
  jsonb_build_object(
    'component_name', pc.component_name,
    'amount', pc.amount,
    'is_deduction', pc.is_deduction
  )
) as components
FROM payroll p
LEFT JOIN payroll_components pc ON p.id = pc.payroll_id
WHERE p.employee_id = $1 AND p.payroll_period = $2
GROUP BY p.id;
-- Índice: payroll(tenant_id, employee_id, payroll_period)

-- 2. Asistencia del mes
SELECT 
  DATE_TRUNC('day', date) as day,
  status,
  COUNT(*) as count,
  SUM(working_hours) as total_hours
FROM attendance
WHERE employee_id = $1 
  AND date >= DATE_TRUNC('month', CURRENT_DATE)
  AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY DATE_TRUNC('day', date), status;
-- Índice: attendance(employee_id, date)

-- 3. Empleados por departamento con datos agregados
SELECT 
  d.id, d.name,
  COUNT(e.id) as employee_count,
  AVG(e.salary) as avg_salary,
  MAX(e.salary) as max_salary
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id 
  AND e.tenant_id = d.tenant_id
  AND e.status = 'active'
WHERE d.tenant_id = $1
GROUP BY d.id, d.name;
-- Índice: employees(tenant_id, department_id, status)

-- 4. Saldo de licencias
SELECT 
  lb.leave_type_id,
  lt.name,
  lb.total_days,
  lb.used_days,
  lb.pending_approval_days,
  (lb.total_days - lb.used_days - lb.pending_approval_days) as available
FROM leave_balances lb
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE lb.employee_id = $1 AND lb.year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY lt.name;
-- Índice: leave_balances(employee_id, year)
```

### 4.2 Patrones de Escritura

```sql
-- 1. Crear empleado (con su usuario asociado)
BEGIN;
  INSERT INTO users (id, tenant_id, email, first_name, last_name)
  VALUES (uuid_generate_v4(), $1, $2, $3, $4);
  
  INSERT INTO employees (
    tenant_id, user_id, employee_code, first_name, last_name,
    id_number, id_type, department_id, position_id, hire_date,
    employment_type, salary, status
  ) VALUES (...);
  
  -- Crear registros iniciales de saldo de licencias
  INSERT INTO leave_balances (
    tenant_id, employee_id, leave_type_id, year,
    total_days, used_days
  )
  SELECT $1, (SELECT id FROM employees WHERE email = $2),
    id, EXTRACT(YEAR FROM CURRENT_DATE), default_days_per_year, 0
  FROM leave_types WHERE tenant_id = $1;
COMMIT;
-- Trigger: update_updated_at automático
-- Trigger: audit_log_changes automático

-- 2. Procesar solicitud de licencia aprobada
BEGIN;
  UPDATE leaves SET status = 'approved', approved_at = NOW(), approved_by = $1
  WHERE id = $2;
  
  -- Actualizar saldo
  UPDATE leave_balances
  SET used_days = used_days + (
    SELECT days_count FROM leaves WHERE id = $2
  )
  WHERE employee_id = (SELECT employee_id FROM leaves WHERE id = $2)
  AND leave_type_id = (SELECT leave_type_id FROM leaves WHERE id = $2)
  AND year = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Trigger crea notificación automáticamente
COMMIT;
```

---

## 5. Índices y Estrategia de Optimización

### 5.1 Índices Primarios (Críticos)

```sql
-- Compound indexes para queries frecuentes
CREATE INDEX idx_attendance_employee_date ON attendance(tenant_id, employee_id, date);
CREATE INDEX idx_payroll_employee_period ON payroll(tenant_id, employee_id, payroll_period);
CREATE INDEX idx_leaves_employee_status ON leaves(tenant_id, employee_id, status);
CREATE INDEX idx_employees_tenant_status ON employees(tenant_id, status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Índices para filtrado frecuente
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);

-- Índices para ordenamiento
CREATE INDEX idx_announcements_published_at ON announcements(published_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### 5.2 Estrategia de Caché

```typescript
// En aplicación Next.js
import { cache } from 'react';

// Cache de 60 segundos para datos de empleado
export const getEmployeeWithCache = cache(async (id: string) => {
  const data = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();
  
  return data;
});

// Cache de departamentos (cambios raros)
const departmentCache = new Map();
const DEPT_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function getDepartmentsWithCache(tenantId: string) {
  const cached = departmentCache.get(tenantId);
  if (cached && Date.now() - cached.timestamp < DEPT_CACHE_TTL) {
    return cached.data;
  }
  
  const data = await supabase
    .from('departments')
    .select('*')
    .eq('tenant_id', tenantId);
  
  departmentCache.set(tenantId, { data, timestamp: Date.now() });
  return data;
}
```

---

## 6. Escalabilidad y Limits

### 6.1 Capacidad Esperada

| Métrica | Limit | Notas |
|---------|-------|-------|
| Tenants | Ilimitado | 1 DB para todos |
| Empleados/Tenant | 100,000+ | Con índices optimizados |
| Registros Asistencia/Año | 2,000,000+ | Escalable con particionamiento |
| Nóminas/Mes | 100,000+ | Depende de empleados |
| Consultas/Segundo | 10,000+ | Con connection pooling |

### 6.2 Optimizaciones Futuras

```sql
-- Particionamiento de tablas grandes
CREATE TABLE attendance_2026_q1 PARTITION OF attendance
  FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

-- Vistas materializadas para reportes
CREATE MATERIALIZED VIEW monthly_payroll_summary AS
SELECT 
  DATE_TRUNC('month', p.period_start)::date as month,
  d.name as department,
  COUNT(DISTINCT p.employee_id) as employee_count,
  SUM(p.net_salary) as total_net,
  AVG(p.net_salary) as avg_salary
FROM payroll p
JOIN employees e ON p.employee_id = e.id
JOIN departments d ON e.department_id = d.id
GROUP BY DATE_TRUNC('month', p.period_start), d.name;

-- Actualizar MV cada noche
REFRESH MATERIALIZED VIEW monthly_payroll_summary;
```

---

## 7. Monitoreo y Observabilidad

### 7.1 Métricas Clave

```sql
-- Performance de queries
SELECT 
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Uso de conexiones
SELECT 
  datname, usename,
  count(*) as connections
FROM pg_stat_activity
GROUP BY datname, usename;

-- Tamaño de tablas
SELECT 
  schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 7.2 Alertas Recomendadas

- [ ] Tasa de errores > 1% por 5 minutos
- [ ] Latencia p95 > 500ms
- [ ] Espacio en disco > 80%
- [ ] Queries lentas > 1 segundo
- [ ] Failed backups

---

## 8. Roadmap y Consideraciones Futuras

### Corto Plazo (1-3 meses)
- [ ] Implementar full-text search en documentos
- [ ] Agregar more leave type presets (paternity, bereavement)
- [ ] Performance tuning de queries críticas

### Mediano Plazo (3-6 meses)
- [ ] Multi-currency support
- [ ] Workflow rules customizable
- [ ] Advanced reporting engine
- [ ] Integration con sistemas de payroll externos

### Largo Plazo (6+ meses)
- [ ] Particionamiento de tablas grandes
- [ ] Read replicas para reportería
- [ ] GraphQL API layer
- [ ] Data warehouse para analytics

---

## Contacto y Soporte

**Arquitecto de Base de Datos**: Database Architecture Team
**Última actualización**: 13 de Abril de 2026
**Versión**: 1.0
**Estado**: Production Ready
