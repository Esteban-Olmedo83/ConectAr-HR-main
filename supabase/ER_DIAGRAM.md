# Diagrama Entidad-Relación (ER) - ConectAr HR

## Diagrama Completo de Relaciones

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        DIAGRAMA ENTIDAD-RELACIÓN                             │
│                     ConectAr HR - Sistema de RRHH                            │
└──────────────────────────────────────────────────────────────────────────────┘

NIVEL 1: MAESTRO DE TENANTS
════════════════════════════════════════════════════════════════════════════════

                              ┌─────────────┐
                              │   tenants   │ (Empresas cliente)
                              ├─────────────┤
                              │ id (PK)     │
                              │ name        │
                              │ slug (UQ)   │
                              │ status      │
                              │ features    │
                              └─────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
         creates 1         created_by 1       manages 1
                │                   │                   │
                ▼                   ▼                   ▼


NIVEL 2: ESTRUCTURA ORGANIZACIONAL
════════════════════════════════════════════════════════════════════════════════

┌──────────────┐  1:N  ┌──────────────┐  1:N  ┌──────────────┐  1:N  ┌─────────┐
│   tenants    │◄──────│ departments   │◄──────│  positions   │◄──────│employees│
└──────────────┘       └──────────────┘       └──────────────┘       └─────────┘
                             │                      │                   │
                         parent_id                  │              manager_id (self)
                         (self-ref)                 │                   │
                             │                      ▼                   │
                             └───────────────────────────────────────────┘
                                    └─ manager_id (FK)


NIVEL 3: USUARIOS Y SEGURIDAD
════════════════════════════════════════════════════════════════════════════════

         ┌──────────────┐           ┌─────────────┐           ┌──────────────┐
         │    users     │───1:N────→│ user_roles  │◄───N:1────│    roles     │
         ├──────────────┤           ├─────────────┤           ├──────────────┤
         │ id (PK)      │           │ user_id(FK) │           │ id (PK)      │
         │ tenant_id    │           │ role_id(FK) │           │ tenant_id    │
         │ email        │           │ assigned_at │           │ name         │
         │ status       │           └─────────────┘           │ role_type    │
         │ is_super_ad..│                                     │ permissions  │
         │              │                                     └──────────────┘
         └──────────────┘                                            │
              ▲                                                  1:N  │
              │                                                       │
         1:N  │                                     ┌────────────────▼─┐
              │                                     │ role_permissions │
              │                                     ├──────────────────┤
              │                                     │ role_id (FK)     │
              │                                     │ permission_id(FK)│
              │                                     └──────────────────┘
              │                                              ▲
         created_by                                      1:N │
         (user_id FK)                                        │
         (en employees)                               ┌──────┴────┐
                                                      │permissions│
                                                      ├───────────┤
                                                      │ id (PK)   │
                                                      │ code (UQ) │
                                                      │ resource  │
                                                      │ action    │
                                                      └───────────┘


NIVEL 4: DATOS DE EMPLEADOS
════════════════════════════════════════════════════════════════════════════════

            ┌─────────────┐
            │  employees  │
            ├─────────────┤
            │ id (PK)     │
            │ tenant_id   │
            │ user_id (FK)◄─────────┐ (relación opcional)
            │ department_id(FK)     │
            │ position_id(FK)       │ ┌──────────┐
            │ manager_id(FK)◄───────│─│  users   │
            │ salary                │ └──────────┘
            │ status                │
            │ hire_date             │
            │ contract_end_date     │
            │ custom_fields(JSON)   │
            └──┬────────────────────┘
               │
        ┌──────┼──────┬─────────┬──────────┬────────────┬────────────┐
        │      │      │         │          │            │            │
     1:N│      │   1:N│     1:N │      1:N │        1:N │        1:N │
        │      │      │         │          │            │            │
        ▼      ▼      ▼         ▼          ▼            ▼            ▼
  ┌────────┐ ┌──────┐ ┌─────┐ ┌───────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
  │attendance│ leaves │ payroll documents performance employee_ training_
  │          │        │         │       reviews      skills    programs
  ├────────┤ ├──────┤ ├─────┤ ├───────┤ ├─────────┤ ├──────────┤ ├──────────┤
  │date(UQ) │ │start │ │period  │type   │employee_ │skill_id  │ name
  │check_in │ │date  │ │start   │file_  │id(FK)   │profici...│ description
  │check_out│ │end_  │ │period  │url    │reviewer_ │verified  │provider
  │status   │ │date  │ │status  │expiry │id(FK)   │years_of_ │duration
  │working_ │ │days_ │ │approved│date   │comments │experience└──────────────┘
  │hours    │ │count │ │by      │status │         │
  │         │ │status│ │period_ │       └─────────┘
  │         │ │reason│ │approved│
  │         │ │      │ │        │       ┌─────────────┐
  │         │ │      │ │        │       │payroll_     │
  │         │ │      │ │        │       │components   │
  │         │ │      │ └────────┘       ├─────────────┤
  │         │ │      │                  │payroll_id(FK)
  │         │ │      │                  │component_.. │
  │         │ │      │                  │amount       │
  │         │ │      │                  │is_deduction │
  │         │ │      │                  └─────────────┘
  └────────┘ │      │
             │      │    ┌──────────────┐
             │      └───→│leave_balances│
             │           ├──────────────┤
             │           │employee_id   │
             │           │leave_type_id │
             │           │year          │
             │           │total_days    │
             │           │used_days     │
             │           │pending_..    │
             │           │approved_days │
             │           │rollover_days │
             │           └──────────────┘
             │
             └───→ ┌─────────────┐
                   │ leave_types │
                   ├─────────────┤
                   │ id (PK)     │
                   │ tenant_id   │
                   │ code (UQ)   │
                   │ name        │
                   │ default_days│
                   │ is_paid     │
                   └─────────────┘


NIVEL 5: SOPORTE Y OPERACIÓN
════════════════════════════════════════════════════════════════════════════════

        ┌──────────────┐       ┌───────────────┐      ┌──────────────┐
        │ work_shifts  │───1:N─│employee_shifts│◄─────│  employees   │
        ├──────────────┤       ├───────────────┤      └──────────────┘
        │ id (PK)      │       │employee_id(FK)
        │ tenant_id    │       │shift_id(FK)   │
        │ name         │       │effective_from │
        │ start_time   │       │effective_to   │
        │ end_time     │       └───────────────┘
        │ break_duration
        │ working_days │
        └──────────────┘


             ┌──────────────────┐          ┌──────────────┐
             │  notifications   │◄────1:N──│   users      │
             ├──────────────────┤          └──────────────┘
             │ user_id (FK)     │
             │ title            │
             │ message          │
             │ notification_type│
             │ is_read          │
             │ expires_at       │
             └──────────────────┘

             ┌──────────────────┐
             │  announcements   │
             ├──────────────────┤
             │ tenant_id        │
             │ title            │
             │ content          │
             │ published_by(FK) │
             │ status           │
             │ target_roles(JS) │
             │ target_depts(JS) │
             └──────────────────┘

             ┌──────────────────┐
             │  company_        │
             │  settings        │
             ├──────────────────┤
             │ tenant_id (UQ)   │
             │ company_name     │
             │ cuit             │
             │ address          │
             │ work_week_days   │
             │ currency         │
             │ leave_policies   │
             │ payroll_policies │
             └──────────────────┘


NIVEL 6: AUDITORÍA Y COMPLIANCE
════════════════════════════════════════════════════════════════════════════════

             ┌──────────────────┐
             │   audit_logs     │
             ├──────────────────┤
             │ id (PK)          │
             │ tenant_id        │
             │ user_id (FK)     │
             │ action           │
             │ resource_type    │
             │ resource_id      │
             │ old_values (JSON)│
             │ new_values (JSON)│
             │ ip_address       │
             │ user_agent       │
             │ created_at       │
             └──────────────────┘
               (Escucha INSERT/UPDATE/DELETE en todas las tablas principales)


NIVEL 7: INTEGRACIONES
════════════════════════════════════════════════════════════════════════════════

             ┌──────────────┐          ┌──────────────┐
             │  api_tokens  │          │ integrations │
             ├──────────────┤          ├──────────────┤
             │ tenant_id    │          │ tenant_id    │
             │ name         │          │ name         │
             │ token_hash   │          │ type         │
             │ created_by   │          │ credentials  │
             │ expires_at   │          │ webhook_url  │
             │ is_active    │          │ is_active    │
             └──────────────┘          └──────────────┘
```

---

## Cardinalidades

### Relaciones 1:N
```
tenants          →  (1) : (N) users
tenants          →  (1) : (N) employees
tenants          →  (1) : (N) departments
tenants          →  (1) : (N) roles
departments      →  (1) : (N) employees (como manager)
departments      →  (1) : (N) positions
positions        →  (1) : (N) employees
employees        →  (1) : (N) attendance
employees        →  (1) : (N) leaves
employees        →  (1) : (N) payroll
employees        →  (1) : (N) documents
employees        →  (1) : (N) performance_reviews
employees        →  (1) : (N) employee_skills
employees        →  (1) : (N) employee_training
leave_types      →  (1) : (N) leaves
leave_types      →  (1) : (N) leave_balances
payroll          →  (1) : (N) payroll_components
work_shifts      →  (1) : (N) employee_shifts
users            →  (1) : (N) user_roles
roles            →  (1) : (N) role_permissions
roles            →  (1) : (N) user_roles
permissions      →  (1) : (N) role_permissions
```

### Relaciones N:N
```
users            ←→  roles             (mediante user_roles)
roles            ←→  permissions       (mediante role_permissions)
employees        ←→  skills            (mediante employee_skills)
employees        ←→  training_programs (mediante employee_training)
```

### Relaciones Autoreferenciadas
```
departments → departments (parent_department_id)
employees   → employees   (manager_id)
```

### Relaciones Opcionales
```
employees    → users  (user_id nullable - no todo empleado es usuario)
documents    → users  (uploaded_by nullable)
employees    → departments (como manager_id nullable)
leaves       → users  (approved_by, rejected_by nullable)
payroll      → users  (approved_by nullable)
performance_reviews → employees (como manager_id - reviewer_id obligatorio)
```

---

## Restricciones de Integridad

### Constraints de Clave Primaria (PK)
- Todas las tablas tienen `id UUID PRIMARY KEY`

### Constraints de Clave Foránea (FK)
```sql
employees.department_id    → departments.id (ON DELETE RESTRICT)
employees.position_id      → positions.id (ON DELETE RESTRICT)
employees.manager_id       → employees.id (ON DELETE SET NULL)
employees.user_id          → users.id (ON DELETE SET NULL)

attendance.employee_id     → employees.id (ON DELETE CASCADE)
leaves.employee_id         → employees.id (ON DELETE CASCADE)
payroll.employee_id        → employees.id (ON DELETE CASCADE)

leaves.leave_type_id       → leave_types.id (ON DELETE RESTRICT)
leave_balances.leave_type_id → leave_types.id (ON DELETE CASCADE)

payroll_components.payroll_id → payroll.id (ON DELETE CASCADE)

documents.employee_id      → employees.id (ON DELETE CASCADE)

user_roles.user_id         → users.id (ON DELETE CASCADE)
user_roles.role_id         → roles.id (ON DELETE CASCADE)

role_permissions.role_id   → roles.id (ON DELETE CASCADE)
role_permissions.permission_id → permissions.id (ON DELETE CASCADE)
```

### Constraints de Unicidad (UNIQUE)
```sql
tenants(slug)
users(tenant_id, email)
employees(tenant_id, employee_code)
employees(tenant_id, id_number)
departments(tenant_id, name)
positions(tenant_id, name)
leave_types(tenant_id, code)
leave_balances(tenant_id, employee_id, leave_type_id, year)
payroll(tenant_id, employee_id, payroll_period)
attendance(tenant_id, employee_id, date)
roles(tenant_id, name)
skills(tenant_id, name)
employee_skills(tenant_id, employee_id, skill_id)
employee_training(tenant_id, employee_id, training_program_id)
work_shifts(tenant_id, name)
company_settings(tenant_id)
integrations(tenant_id, integration_type)
api_tokens(tenant_id, name)
```

### Constraints de Validación (CHECK)
```sql
tenants: status IN ('active', 'inactive', 'suspended', 'trial')
tenants: subscription_plan IN ('free', 'starter', 'professional', 'enterprise')
tenants: subscription_status IN ('active', 'inactive', 'canceled', 'past_due')

users: status IN ('active', 'inactive', 'suspended')

employees: status IN ('active', 'inactive', 'on_leave', 'suspended', 'terminated')
employees: employment_type IN ('full_time', 'part_time', 'contractor', 'intern')

positions: status IN ('active', 'inactive')

roles: role_type IN ('admin', 'manager', 'employee', 'custom')

attendance: status IN ('present', 'absent', 'late', 'early_out', 'on_leave', 'half_day')

leaves: status IN ('pending', 'approved', 'rejected', 'canceled')

payroll: status IN ('draft', 'pending', 'approved', 'paid', 'canceled')

announcements: priority IN ('low', 'normal', 'high', 'urgent')
announcements: status IN ('draft', 'published', 'archived')

documents: status IN ('active', 'expired', 'archived')

employee_skills: proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')

employee_training: status IN ('registered', 'completed', 'canceled')

performance_reviews: status IN ('draft', 'pending', 'completed', 'archived')
```

---

## Datos Sensitivos y Soft Deletes

### Soft Delete (deleted_at)
```
Tablas con soft delete:
- tenants
- users
- employees
- departments
- positions
- roles
- leave_types
- documents
- announcements
- integrations

Queries que respetan soft delete deben incluir:
WHERE deleted_at IS NULL
```

### Datos Sensibles
```
- credentials (integrations) - Encriptados en aplicación
- salary/wage (employees, payroll) - Acceso restringido por RLS
- personal_data (employees) - Restringido a Admin + Empleado (self)
- audit_logs - Solo Admin puede leer
- passwords - Manejados por Supabase Auth (no en DB)
```

---

## Vista de Índices

```
PRIMARY INDEXES (Clustering):
  tenants(id)
  users(id, tenant_id)
  employees(id, tenant_id)

COMPOUND INDEXES (Critical):
  attendance(tenant_id, employee_id, date)
  payroll(tenant_id, employee_id, payroll_period)
  leaves(tenant_id, employee_id, status)
  leave_balances(tenant_id, employee_id, leave_type_id, year)
  notifications(user_id, is_read)

FILTERING INDEXES:
  employees(tenant_id, status)
  employees(department_id)
  employees(position_id)
  roles(tenant_id)
  attendance(status)
  leaves(status)
  documents(expiry_date)

ORDERING INDEXES:
  announcements(published_at)
  audit_logs(created_at)
  attendance(date)
```

---

## Flujos de Datos Críticos

### Flujo 1: Crear Empleado
```
users (new user)
  ↓
employees (new employee)
  ↓
leave_balances (create initial balance for all leave types)
  ↓ [AUDIT] audit_logs (registra creación)
  ↓ [NOTIFY] notifications (aviso a admin)
```

### Flujo 2: Solicitar Licencia
```
leaves (INSERT status='pending')
  ↓ [TRIGGER] create_notification_on_leave_request
    → notifications (aviso a admin)
  ↓
[Admin approves]
  ↓
leaves (UPDATE status='approved')
  ↓ [TRIGGER] create_notification_on_leave_approval
    → notifications (aviso a empleado)
  ↓ [TRIGGER] update_leave_balance
    → leave_balances (decrementa saldo)
  ↓ [AUDIT] audit_logs (registra aprobación)
```

### Flujo 3: Registrar Asistencia
```
attendance (INSERT/UPSERT)
  ↓ [TRIGGER] calculate_working_hours
    → working_hours = check_out_time - check_in_time
  ↓ [AUDIT] audit_logs (registra entrada/salida)
```

### Flujo 4: Generar Nómina
```
payroll (INSERT for all active employees)
  ↓ [TRIGGER] create_notification_on_payroll
    → notifications (aviso a empleado)
  ↓ [AUDIT] audit_logs (registra nómina)
  ↓
payroll_components (INSERT haberes y descuentos)
```

---

## Escalabilidad del Modelo

### Capacidad Actual (Sin Modificaciones)
- Tenants: Ilimitados
- Empleados/Tenant: 100,000+
- Registros de Asistencia/Año: 2,000,000+
- Nóminas/Mes: 100,000+
- Usuarios: Ilimitados
- Auditoría: 24 meses de retención

### Optimizaciones Futuras
1. **Particionamiento por fecha** (attendance, audit_logs)
2. **Lectura en réplica** (reporting queries)
3. **Vistas materializadas** (reportes frecuentes)
4. **Caché distribuido** (Datos maestros)
5. **Queue de tareas** (Generación async de nómina)

---

## Conclusión

Este modelo ER proporciona una **base sólida, escalable y segura** para ConectAr HR que permite:

✅ Aislamiento de datos multi-tenant
✅ Control de acceso granular
✅ Auditoría automática
✅ Integridad referencial
✅ Escalabilidad horizontal
✅ Mantenibilidad a largo plazo

El diagrama muestra todas las relaciones, cardinalidades y dependencias necesarias para una plataforma RRHH enterprise.
