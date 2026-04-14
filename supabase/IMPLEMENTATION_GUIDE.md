# Guía de Implementación - ConectAr HR Database

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Estructura del Esquema](#estructura-del-esquema)
3. [Pasos de Implementación](#pasos-de-implementación)
4. [Seguridad y RLS](#seguridad-y-rls)
5. [Operaciones Comunes](#operaciones-comunes)
6. [Troubleshooting](#troubleshooting)

---

## Descripción General

El esquema de ConectAr HR es una solución **multi-tenant** enterprise-grade para gestión de recursos humanos. La arquitectura garantiza:

- **Aislamiento de datos** completo por tenant
- **Seguridad** mediante Row Level Security (RLS)
- **Escalabilidad** con índices optimizados
- **Auditoría** automática de cambios
- **Integridad** de datos con constraints

### Principios de Diseño

```
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE POSTGRES                      │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │           MULTI-TENANT ARCHITECTURE                 │ │
│ │                                                     │ │
│ │  Tenant A Data    │    Tenant B Data    │ Tenant C  │ │
│ │  (Isolated by     │    (Isolated by     │ (Isolated │ │
│ │   tenant_id)      │     tenant_id)      │ by tenid) │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │           ROW LEVEL SECURITY (RLS)                  │ │
│ │  - Función get_current_tenant_id()                  │ │
│ │  - Validación de permiso por fila                   │ │
│ │  - Prevención de acceso no autorizado               │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Estructura del Esquema

### 1. Tablas Principales

#### **tenants** (Empresas cliente)
Almacena información de cada empresa cliente en el sistema multi-tenant.

```sql
-- Campos clave:
- id (UUID PRIMARY KEY)
- name, slug (identificador único)
- status (active, inactive, suspended, trial)
- subscription_plan (free, starter, professional, enterprise)
- features (JSON - módulos habilitados)
- max_employees, max_users (límites)
```

#### **users** (Usuarios del sistema)
Representa usuarios autenticados en la plataforma.

```sql
-- Campos clave:
- id (UUID PRIMARY KEY - Supabase Auth)
- tenant_id (relación con tenant)
- email, phone (contacto)
- status (active, inactive, suspended)
- is_super_admin (acceso global)
- UNIQUE(tenant_id, email) - Un email por tenant
```

#### **employees** (Registro de empleados)
Datos completos de empleados con información personal y laboral.

```sql
-- Campos clave:
- id (UUID PRIMARY KEY)
- tenant_id (relación con tenant)
- user_id (relación opcional con usuarios)
- employee_code (identificador único por tenant)
- id_number, id_type (DNI, pasaporte, CUIT)
- department_id, position_id (estructura organizacional)
- hire_date, contract_end_date (periodo laboral)
- salary, salary_frequency (compensación)
- status (active, inactive, on_leave, suspended, terminated)
- custom_fields (JSON - datos extendidos)
```

#### **departments** (Departamentos)
Estructura jerárquica de departamentos.

```sql
-- Campos clave:
- parent_department_id (permite jerarquía)
- manager_id (jefe del departamento)
- cost_center (para contabilidad)
- budget_allocated (presupuesto)
```

#### **positions** (Puestos de trabajo)
Catálogo de puestos con rango salarial.

```sql
-- Campos clave:
- department_id (relación obligatoria)
- salary_range_min, salary_range_max
- level (junior, senior, lead, manager)
```

#### **roles & permissions** (RBAC)
Sistema de control de acceso basado en roles.

```sql
-- roles: admin, manager, employee, custom
-- permissions: código + recurso + acción
-- role_permissions: relación muchos-a-muchos
-- user_roles: asignación de roles a usuarios
```

#### **attendance** (Asistencia)
Registro detallado de entrada/salida y asistencia.

```sql
-- Campos clave:
- employee_id, date (UNIQUE constraint)
- check_in_time, check_out_time
- check_in_method (manual, biometric, qr, geo)
- status (present, absent, late, early_out, on_leave, half_day)
- working_hours (calculado automáticamente)
```

#### **leaves** (Solicitudes de licencia)
Gestión completa de solicitudes de licencia.

```sql
-- Campos clave:
- employee_id, leave_type_id
- start_date, end_date, days_count
- status (pending, approved, rejected, canceled)
- approved_by, approved_at
- rejection_reason
```

#### **leave_balances** (Saldos de licencia)
Seguimiento de saldos disponibles por empleado y tipo.

```sql
-- Campos clave:
- employee_id, leave_type_id, year (UNIQUE)
- total_days, used_days, pending_approval_days
- approved_days, rollover_days
```

#### **payroll** (Nómina)
Recibos de sueldo y cálculos de nómina.

```sql
-- Campos clave:
- employee_id, payroll_period (YYYY-MM)
- period_start, period_end (fechas)
- base_salary, gross_salary, net_salary
- status (draft, pending, approved, paid, canceled)
- payment_method, reference_number
```

#### **payroll_components** (Componentes de nómina)
Detalles de haberes y descuentos por nómina.

```sql
-- Campos clave:
- payroll_id (relación con nómina)
- component_type (basic_salary, overtime, bonus, tax, etc.)
- amount, is_deduction
- calculation_method (fixed, percentage, formula)
```

#### **documents** (Documentos de empleados)
Almacenamiento de referencias a documentos.

```sql
-- Campos clave:
- employee_id
- document_type (contract, offer_letter, certificate, payroll)
- file_url (referencia a archivo en storage)
- expiry_date (fecha de vencimiento)
- status (active, expired, archived)
```

#### **audit_logs** (Auditoría)
Registro automático de todos los cambios.

```sql
-- Campos clave:
- action (create, update, delete, read, export)
- resource_type, resource_id
- old_values, new_values (JSON)
- user_id, ip_address, user_agent
- created_at (timestamp automático)
```

### 2. Tablas Adicionales

- **announcements**: Comunicados internos
- **notifications**: Sistema de notificaciones
- **company_settings**: Configuración por tenant
- **work_shifts**: Turnos de trabajo
- **employee_shifts**: Asignación de turnos
- **performance_reviews**: Evaluaciones de desempeño
- **skills & employee_skills**: Gestión de competencias
- **training_programs & employee_training**: Programas de capacitación
- **time_off_requests**: Solicitudes genéricas de tiempo libre
- **api_tokens**: Tokens para integraciones
- **integrations**: Integraciones externas configuradas

---

## Pasos de Implementación

### Paso 1: Preparar Supabase

```bash
# Crear un nuevo proyecto en Supabase
1. Ir a https://app.supabase.com
2. Crear nuevo proyecto
3. Esperar a que se inicialice
4. Obtener credenciales:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Paso 2: Ejecutar Scripts SQL (En orden)

```bash
# Abrir Supabase SQL Editor y ejecutar en este orden:

1. supabase/schema.sql
   - Crea todas las tablas
   - Crea índices
   - Crea constraints

2. supabase/rls_policies.sql
   - Habilita Row Level Security
   - Define funciones de seguridad
   - Crea políticas de acceso

3. supabase/triggers.sql
   - Crea funciones de negocio
   - Define triggers de auditoría
   - Define triggers de notificaciones

4. supabase/seed.sql
   - Inserta datos de ejemplo
   - Crea tenants de demostración
   - Inserta usuarios de prueba
```

### Paso 3: Configurar Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-clave-anon-publica"
NEXT_PUBLIC_SUPABASE_SERVICE_KEY="tu-clave-service-role"  # Solo backend
```

### Paso 4: Verificar la Instalación

```bash
# Conectarse a Supabase y verificar:

-- Contar tablas creadas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Debe retornar: 25+

-- Verificar RLS habilitado
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Debe retornar todas las tablas principales

-- Verificar datos de ejemplo
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM employees;
```

### Paso 5: Generar Tipos TypeScript

```bash
# Opción A: Usar Supabase CLI
npx supabase gen types typescript --project-id your_project_id > src/types/database.types.ts

# Opción B: Ya están incluidos en
src/types/database.types.ts
src/types/domain.ts
```

### Paso 6: Integrar con Aplicación Next.js

```typescript
// src/lib/supabase.ts - Ya está configurado
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default supabase;
```

---

## Seguridad y RLS

### Política de Seguridad de Datos

La seguridad se implementa en tres niveles:

#### 1. Nivel de Base de Datos (RLS)

```sql
-- Ejemplo: Empleados solo ven su propio perfil
CREATE POLICY "employees_see_own_profile"
ON employees FOR SELECT
USING (
  get_current_tenant_id() = tenant_id
  AND id = (
    SELECT emp_id FROM employees 
    WHERE user_id = get_current_user_id()
  )
);
```

#### 2. Nivel de JWT Token

El JWT incluye:
- `sub`: user_id
- `tenant_id`: tenant del usuario
- `is_super_admin`: boolean
- `roles`: array de rol_ids

#### 3. Nivel de Aplicación

```typescript
// Hook personalizado para verificar permisos
export function useHasPermission(resourceType: string, action: string) {
  const { user } = useAuth();
  const { data: userRoles } = useSWR(
    user ? `/api/users/${user.id}/roles` : null,
    fetcher
  );
  
  return userRoles?.some(role =>
    role.permissions.some(p =>
      p.resource === resourceType && p.action === action
    )
  ) || false;
}
```

### Funciones de Seguridad Clave

```sql
-- Obtener tenant_id actual del JWT
CREATE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'tenant_id')::UUID;
$$ LANGUAGE sql STABLE;

-- Obtener user_id actual
CREATE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

-- Verificar si es super admin
CREATE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() ->> 'is_super_admin')::BOOLEAN = true;
$$ LANGUAGE sql STABLE;
```

### Matriz de Permisos por Rol

| Recurso | Admin | Manager | Employee |
|---------|-------|---------|----------|
| users | CRUD | - | R |
| employees | CRUD | RU | R(self) |
| attendance | CRUD | R(dept) | R(self), C(self) |
| leaves | CRUD | R, A | R(self), C |
| payroll | CRUD | R(dept) | R(self) |
| departments | CRUD | - | R |
| positions | CRUD | - | R |
| reports | CRUD | R(dept) | - |

---

## Operaciones Comunes

### 1. Crear un Nuevo Empleado

```typescript
import supabase from '@/lib/supabase';
import type { InsertEmployee } from '@/types/domain';

async function createEmployee(employee: InsertEmployee) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Uso
await createEmployee({
  tenant_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  employee_code: 'EMP-004',
  first_name: 'Pedro',
  last_name: 'López',
  id_number: '41123456',
  id_type: 'dni',
  department_id: '50000000-1000-1000-1000-000000000001',
  position_id: '60000000-1000-1000-1000-000000000002',
  hire_date: new Date('2024-01-15'),
  salary: 100000,
  employment_type: 'full_time',
});
```

### 2. Registrar Asistencia (Check-in)

```typescript
async function checkIn(employeeId: string, location?: string) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert({
      employee_id: employeeId,
      date: new Date().toISOString().split('T')[0],
      check_in_time: new Date().toISOString(),
      check_in_method: 'manual',
      check_in_location: location,
      status: 'present',
      tenant_id: getCurrentTenantId(),
    }, {
      onConflict: 'tenant_id,employee_id,date'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

### 3. Solicitar Licencia

```typescript
async function requestLeave(
  employeeId: string,
  leaveTypeId: string,
  startDate: Date,
  endDate: Date,
  reason?: string
) {
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const { data, error } = await supabase
    .from('leaves')
    .insert({
      tenant_id: getCurrentTenantId(),
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      days_count: days,
      reason,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

### 4. Generar Nómina

```typescript
async function generatePayroll(tenantId: string, period: string) {
  // period = 'YYYY-MM'
  const [year, month] = period.split('-').map(Number);
  
  // 1. Obtener todos los empleados activos
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'active');
  
  if (empError) throw empError;
  
  // 2. Crear nóminas
  const payrolls = employees.map(emp => ({
    tenant_id: tenantId,
    employee_id: emp.id,
    payroll_period: period,
    period_start: new Date(year, month - 1, 1),
    period_end: new Date(year, month, 0),
    base_salary: emp.salary,
    gross_salary: emp.salary,
    net_salary: emp.salary * 0.85, // Aproximado
    status: 'draft',
  }));
  
  const { data, error } = await supabase
    .from('payroll')
    .insert(payrolls)
    .select();
  
  if (error) throw error;
  return data;
}
```

### 5. Obtener Reporte de Asistencia

```typescript
async function getAttendanceReport(
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      id,
      date,
      status,
      working_hours,
      employee:employees(id, first_name, last_name, employee_code),
      department:employees(department_id)
    `)
    .eq('tenant_id', tenantId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  // Procesar datos
  const summary = {
    totalRecords: data.length,
    byStatus: {},
    totalWorkingHours: 0,
  };
  
  data.forEach(record => {
    summary.byStatus[record.status] = 
      (summary.byStatus[record.status] || 0) + 1;
    summary.totalWorkingHours += record.working_hours || 0;
  });
  
  return { data, summary };
}
```

---

## Troubleshooting

### Problema: RLS Policy no funciona

**Síntoma**: Error "permission denied" al intentar acceder a datos.

**Solución**:
```sql
-- 1. Verificar que RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'employees';

-- 2. Verificar JWT contiene tenant_id
-- En cliente: 
const { data: { user } } = await supabase.auth.getUser();
console.log(user.user_metadata); // Debe contener tenant_id

-- 3. Verificar función get_current_tenant_id()
SELECT get_current_tenant_id();
```

### Problema: Datos no se sincronizan

**Síntoma**: Los cambios en la DB no se reflejan en la UI.

**Solución**:
```typescript
// 1. Usar realtime subscriptions
const channel = supabase
  .channel('employees-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'employees' },
    (payload) => {
      console.log('Cambio detectado:', payload);
      // Actualizar estado
    }
  )
  .subscribe();

// 2. Limpiar subscripción
return () => supabase.removeChannel(channel);
```

### Problema: Auditoría no registra cambios

**Síntoma**: audit_logs está vacío después de cambios.

**Solución**:
```sql
-- 1. Verificar que triggers existen
SELECT trigger_name, table_name FROM information_schema.triggers 
WHERE table_schema = 'public' AND trigger_name LIKE 'audit%';

-- 2. Verificar función get_current_user_id()
-- Debe retornar user_id del JWT

-- 3. Insertar manualmente si falla
INSERT INTO audit_logs (
  tenant_id, user_id, action, resource_type, resource_id, new_values
) VALUES (
  'tenant-uuid', 'user-uuid', 'create', 'employees', 'emp-uuid', '{}');
```

### Problema: Limit de filas en Supabase

**Síntoma**: Query devuelve máximo 1000 filas.

**Solución**:
```typescript
// Usar paginación
async function getAllEmployees(tenantId: string, pageSize = 100) {
  const allEmployees = [];
  let page = 0;
  
  while (true) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('tenant_id', tenantId)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) throw error;
    if (!data || data.length === 0) break;
    
    allEmployees.push(...data);
    page++;
  }
  
  return allEmployees;
}
```

---

## Mantenimiento

### Backups

```bash
# Supabase automáticamente hace backups diarios
# Para restaurar:
1. Ir a Supabase Dashboard
2. Settings > Database > Backups
3. Seleccionar backup y restaurar
```

### Limpieza de Datos

```sql
-- Eliminar logs de auditoría antiguos (más de 2 años)
DELETE FROM audit_logs 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';

-- Eliminar notificaciones leídas antiguas
DELETE FROM notifications 
WHERE is_read = true AND expires_at < CURRENT_TIMESTAMP;

-- Archivar registros antiguos
UPDATE documents 
SET status = 'archived' 
WHERE expiry_date < CURRENT_DATE AND status = 'expired';
```

### Monitoreo de Performance

```sql
-- Queries más lentas
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Índices no utilizados
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan ASC;
```

---

## Recursos Adicionales

- **Documentación Supabase**: https://supabase.com/docs
- **PostgreSQL RLS**: https://www.postgresql.org/docs/current/rules-privileges.html
- **ConectAr HR API**: `/src/api/` (implementación en Next.js)
- **Tipos TypeScript**: `/src/types/` (database.types.ts y domain.ts)

---

## Soporte

Para problemas o preguntas:
1. Revisar este documento
2. Consultar logs: `SELECT * FROM audit_logs ORDER BY created_at DESC;`
3. Verificar estado de Supabase: https://status.supabase.com

**Última actualización**: 13 de Abril de 2026
**Versión Schema**: 1.0
