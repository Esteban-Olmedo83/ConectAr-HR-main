# 🚀 FASE 2 - Plan Detallado de Implementación

**Fecha**: 13 de Abril de 2026  
**Status**: 📋 PLANIFICACIÓN COMPLETA  
**Versión**: 1.0.0.0  
**Estimado Total**: 35-44 horas (4-5 semanas con 2 agentes)

---

## 📊 Resumen Ejecutivo

**Fase 2** implementará todas las **páginas principales** del sistema ConectAr HR, divididas en **4 sprints** con **8 sub-agentes** trabajando en paralelo.

### ✅ Objetivo Fase 2

Completar:
- ✅ Sistema de autenticación robusto (login, signup, reset password)
- ✅ App Layout base con navegación inteligente por rol
- ✅ 5 páginas principales de usuario
- ✅ 2 portales especializados (owner, admin)
- ✅ Validación completa en frontend y backend
- ✅ Mock data exhaustiva

---

## 📅 SPRINTS (Orden de Prioridad)

### 🔴 SPRINT 1: AUTENTICACIÓN (Semana 1 - BLOCKING)

**Descripción**: Completar sistema de autenticación seguro. Bloquea todas las demás páginas.

#### Tarea 1.1: Páginas de Autenticación
- **Responsable**: Sub-Agent 1 (Frontend Dev Senior)
- **Archivos a crear**:
  ```
  /src/app/(auth)/signup/
    ├── page.tsx
    ├── components/signup-form.tsx
    ├── components/password-strength-meter.tsx
    ├── components/terms-agreement.tsx
    └── hooks/use-signup.ts
  
  /src/app/(auth)/reset-password/
    ├── page.tsx
    ├── components/reset-form.tsx
    ├── components/confirmation-card.tsx
    └── hooks/use-password-reset.ts
  
  /src/lib/password-reset.ts
  /src/lib/validators/signup.ts
  ```

- **Requisitos**:
  - Signup: Email, nombre, contraseña (validación fuerte), confirmación, términos
  - Reset: Email validation, token verification, nueva contraseña
  - Password strength meter en tiempo real
  - Validación con Zod (mensajes en ESPAÑOL)
  - Error handling robusto
  - Loading states
  - Toast notifications

- **Estimado**: 3-4 horas
- **Complejidad**: MEDIA-ALTA

#### Tarea 1.2: Auth Infrastructure
- **Responsable**: Sub-Agent 2 (Backend Security)
- **Archivos a modificar**:
  ```
  /src/middleware.ts (mejorar)
  /src/lib/auth.ts (completar)
  /src/lib/session.ts (expansión)
  /src/lib/auth-guard.ts (refinamiento)
  /src/app/api/auth/signup/route.ts (crear)
  /src/app/api/auth/reset-password/route.ts (crear)
  /src/app/api/auth/confirm-reset/route.ts (crear)
  ```

- **Requisitos**:
  - Middleware: Validar sesión, verificar expiraciones, refresh tokens
  - Rate limiting en signup (max 5 intentos por IP/24h)
  - Email verification flow (mock para ahora)
  - Password hashing seguro
  - CSRF protection
  - Session rotation

- **Estimado**: 3-4 horas
- **Complejidad**: ALTA

---

### 🟠 SPRINT 2: APP LAYOUT & DASHBOARD (Semana 1-2)

#### Tarea 2.1: App Layout Base
- **Responsable**: Sub-Agent 3 (Frontend Architecture)
- **Archivos a crear**:
  ```
  /src/app/(app)/layout.tsx (completo)
  /src/components/layout/app-header.tsx
  /src/components/layout/app-sidebar.tsx
  /src/components/layout/nav-menu.tsx
  /src/components/layout/breadcrumb-nav.tsx
  /src/components/layout/notification-bell.tsx
  /src/components/user/user-dropdown-menu.tsx
  /src/hooks/use-app-layout.ts
  /src/hooks/use-navigation.ts
  /src/contexts/app-layout-context.tsx
  ```

- **Requisitos**:
  - Sidebar responsive (colapsable en mobile)
  - Header con logo + notificaciones + avatar user
  - Navegación dinámica según rol:
    - **Employee**: Dashboard, Employees, My Portal, Settings
    - **Manager**: Employees, Attendance, Leave, Dashboard, Settings
    - **Admin**: All + Company Settings, Permissions
    - **Owner**: Owner Dashboard, Owner Settings, Company Settings
  - Breadcrumb actualizado dinámicamente
  - Logout button en dropdown de usuario
  - Dark mode support
  - Mobile responsiveness

- **Estimado**: 4-5 horas
- **Complejidad**: ALTA

#### Tarea 2.2: Employee Dashboard
- **Responsable**: Sub-Agent 4 (Frontend Components)
- **Archivos a crear**:
  ```
  /src/app/(app)/dashboard/page.tsx
  /src/app/(app)/dashboard/components/welcome-card.tsx
  /src/app/(app)/dashboard/components/quick-stats.tsx
  /src/app/(app)/dashboard/components/pending-tasks.tsx
  /src/app/(app)/dashboard/components/announcements-widget.tsx
  /src/app/(app)/dashboard/components/attendance-chart.tsx
  /src/app/(app)/dashboard/hooks/use-dashboard-data.ts
  /src/lib/mock-data/dashboard.ts
  ```

- **Requisitos**:
  - Welcome card personalizado por usuario
  - 4 stat cards: Asistencia hoy, Licencias disponibles, Tareas pendientes, Anuncios
  - Gráfico de asistencia últimos 30 días (recharts)
  - Widget de anuncios recientes (máximo 3)
  - Botones de acción rápida
  - Skeleton loaders mientras carga
  - Actualización de datos mock por sesión

- **Estimado**: 3-4 horas
- **Complejidad**: MEDIA

---

### 🟡 SPRINT 3: CORE FEATURES (Semana 2-3)

#### Tarea 3.1: Employee List
- **Responsable**: Sub-Agent 5 (Full-stack Features)
- **Archivos a crear**:
  ```
  /src/app/(app)/employees/page.tsx
  /src/components/employees/employee-table.tsx
  /src/components/employees/employee-filters.tsx
  /src/components/employees/employee-actions.tsx
  /src/components/employees/employee-detail-modal.tsx
  /src/hooks/use-employee-list.ts
  /src/hooks/use-employee-filters.ts
  /src/hooks/use-employee-actions.ts
  /src/lib/mock-data/employees.ts (expandir)
  /src/app/api/employees/route.ts (crear)
  ```

- **Requisitos**:
  - DataTable con columnas: Nombre, Email, Departamento, Posición, Estado
  - Filtros: Búsqueda (nombre/email), Departamento, Estado
  - Paginación (10 items por página)
  - Acciones por fila: Ver detalles, Editar (si manager), Eliminar (si admin)
  - Detail modal: Información completa del empleado
  - Loading states y skeleton loaders
  - Validación de permisos por rol
  - Sorting por columnas

- **Estimado**: 4-5 horas
- **Complejidad**: MEDIA-ALTA

#### Tarea 3.2: My Portal (Employee Profile)
- **Responsable**: Sub-Agent 6 (User Features)
- **Archivos a crear**:
  ```
  /src/app/(app)/my-portal/page.tsx
  /src/components/employees/profile-header.tsx
  /src/components/employees/personal-data.tsx
  /src/components/employees/contact-info.tsx
  /src/components/employees/documents-section.tsx
  /src/components/employees/change-history.tsx
  /src/forms/edit-profile-form.tsx
  /src/hooks/use-employee-profile.ts
  /src/lib/mock-data/profile-history.ts
  ```

- **Requisitos**:
  - Perfil header con avatar, nombre, departamento
  - Sección de datos personales (read-only)
  - Sección de contacto (editable)
  - Sección de documentos (descargable)
  - Historial de cambios (read-only)
  - Edit form con validación
  - Modal de confirmación antes de guardar
  - Toast de éxito
  - Validación de ACL (solo ver datos propios)

- **Estimado**: 3-4 horas
- **Complejidad**: MEDIA

---

### 🟢 SPRINT 4: SETTINGS & OWNER PORTAL (Semana 3)

#### Tarea 4.1: Settings Page
- **Responsable**: Sub-Agent 7 (Settings/Preferences)
- **Archivos a crear**:
  ```
  /src/app/(app)/settings/page.tsx
  /src/components/settings/settings-sidebar.tsx
  /src/components/settings/notifications-settings.tsx
  /src/components/settings/security-settings.tsx
  /src/components/settings/appearance-settings.tsx
  /src/components/settings/sessions-manager.tsx
  /src/hooks/use-settings.ts
  ```

- **Requisitos**:
  - Sidebar con tabs: Notificaciones, Seguridad, Apariencia
  - Notificaciones: Toggles por tipo (leave, announcement, task)
  - Seguridad: Cambiar contraseña, sesiones activas, logout all sessions
  - Apariencia: Tema (light/dark), Idioma
  - Save y validación
  - Toast de confirmación
  - localStorage para preferencias

- **Estimado**: 3-4 horas
- **Complejidad**: MEDIA

#### Tarea 4.2: Owner Portal
- **Responsable**: Sub-Agent 8 (Admin Features)
- **Archivos a crear**:
  ```
  /src/app/owner/dashboard/page.tsx
  /src/app/owner/dashboard/components/metrics-overview.tsx
  /src/app/owner/dashboard/components/tenant-stats.tsx
  /src/app/owner/dashboard/components/usage-charts.tsx
  /src/app/owner/dashboard/components/alerts-panel.tsx
  /src/app/owner/dashboard/hooks/use-owner-dashboard.ts
  
  /src/app/owner/settings/page.tsx
  /src/app/owner/settings/components/account-settings.tsx
  /src/app/owner/settings/components/billing-settings.tsx
  /src/app/owner/settings/components/integration-settings.tsx
  /src/app/owner/settings/components/audit-log-viewer.tsx
  /src/app/owner/settings/hooks/use-owner-settings.ts
  
  /src/lib/mock-data/owner-metrics.ts
  ```

- **Requisitos Dashboard**:
  - Métricas: Total tenants, Active users, Monthly MRR, System health
  - Gráficos: Usage trends, Revenue trend, User growth
  - Alerts: System issues, Billing alerts, Security events
  - Stat cards animados

- **Requisitos Settings**:
  - Account settings (editable)
  - Billing information (read-only mock)
  - Integration settings (webhooks, API keys mock)
  - Audit log viewer (tabla de acciones administrativas)

- **Estimado**: 3-4 horas
- **Complejidad**: MEDIA

---

## 🎯 Orden de Implementación

```
SEMANA 1:
├── Sprint 1.1: Reset Password + Signup (Día 1-2)
├── Sprint 1.2: Auth Middleware (Día 2-3)
├── Sprint 2.1: App Layout (Día 3-4)
└── Sprint 2.2: Dashboard (Día 4-5)

SEMANA 2:
├── Sprint 3.1: Employee List (Día 6-7)
├── Sprint 3.2: My Portal (Día 7-8)
└── Sprint 4.1: Settings (Día 8-9)

SEMANA 3:
├── Sprint 4.2: Owner Portal (Día 10)
├── Testing e2e (Día 10-11)
├── Bug fixes (Día 11-12)
└── Documentation (Día 12)
```

---

## 📊 Asignación de Sub-Agentes

| Agente | Sprint | Páginas | Estimado |
|--------|--------|---------|----------|
| Sub-Agent 1 (Frontend) | 1.1 | Signup, Reset Password | 3-4h |
| Sub-Agent 2 (Backend Security) | 1.2 | Auth Infrastructure | 3-4h |
| Sub-Agent 3 (Frontend Arch) | 2.1 | App Layout | 4-5h |
| Sub-Agent 4 (Components) | 2.2 | Dashboard | 3-4h |
| Sub-Agent 5 (Full-stack) | 3.1 | Employee List | 4-5h |
| Sub-Agent 6 (User Features) | 3.2 | My Portal | 3-4h |
| Sub-Agent 7 (Settings) | 4.1 | Settings | 3-4h |
| Sub-Agent 8 (Admin) | 4.2 | Owner Portal | 3-4h |

---

## 🔐 Validaciones Requeridas

### Password Validation
```typescript
✅ Mínimo 8 caracteres
✅ Contiene mayúscula
✅ Contiene minúscula
✅ Contiene número
✅ Contiene carácter especial (@, #, $, %, etc.)
```

### Email Validation
```typescript
✅ Formato válido (RFC 5322)
✅ Único (no existe otro user con mismo email)
✅ Dominio válido
```

### Employee Filters
```typescript
✅ Búsqueda: nombre, email, cédula
✅ Departamento: select valores únicos
✅ Estado: ACTIVE, INACTIVE, ON_LEAVE
```

---

## 📱 Responsive Design

- ✅ Desktop: 1920px - 1024px
- ✅ Tablet: 1024px - 768px
- ✅ Mobile: 768px - 375px

**Especificidades**:
- Sidebar colapsable en < 1024px
- Navigation drawer en < 768px
- Stack vertical de cards en mobile
- Font sizes adaptados

---

## 🎨 Componentes a Utilizar (Existentes)

```typescript
// De UI Kit creado en Fase 1:
✅ Button, Input, Form, Dialog
✅ DropdownMenu, Sidebar, Sheet
✅ Table (expandir a DataTable)
✅ Card, Separator, Badge
✅ Avatar, Tabs, Select
✅ Toast, AlertDialog
✅ Popover, ScrollArea
✅ StatusBadge (para estados empleado)
✅ FormField, FormSection
✅ EmptyState, ErrorBoundary
✅ LoadingOverlay, Skeleton
```

---

## 🧪 Testing Strategy

### Unit Tests
```bash
- Password validators
- Email validators
- Role validators
- Formatting functions
```

### Integration Tests
```bash
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/reset-password
- GET /api/employees?filters=...
- PUT /api/employees/{id}
```

### E2E Tests
```bash
- Complete signup → login → dashboard flow
- Forgot password → reset → login
- Edit profile → save → verification
- Filter employees → view details
- Role-based access (owner vs employee)
```

---

## 📦 Mock Data Necesario

### Expandir `/src/lib/mock-data.ts`

```typescript
// Current: 5 empleados básicos
// New needs:
- 30+ empleados con todos los campos
- 5+ departamentos
- 10+ posiciones
- Dashboard metrics (attendance, leaves)
- Announcements (10+)
- Notifications (15+)
- Owner metrics (revenue, tenants, users)
- Change history samples
- Document samples
```

---

## ✅ Checklist de Completitud

### Sprint 1
- [ ] Signup page con validación completa
- [ ] Reset password flow funcional
- [ ] Auth API routes implementadas
- [ ] Middleware validando sesiones
- [ ] Rate limiting en signup
- [ ] Testing de flujos auth

### Sprint 2
- [ ] App Layout funcional y responsive
- [ ] Navegación dinámica por rol
- [ ] Dashboard con widgets
- [ ] Charts cargando correctamente
- [ ] Mock data actualizado

### Sprint 3
- [ ] Employee list con filtros
- [ ] DataTable con paginación
- [ ] My Portal editable
- [ ] Historial de cambios
- [ ] Modal de detalles

### Sprint 4
- [ ] Settings page completa
- [ ] Owner portal con métricas
- [ ] Audit logs visible
- [ ] Permisos validados
- [ ] Testing e2e pasando

---

## 🚀 Siguiente Paso

**Orden de inicio**:
1. ✅ Leer este plan
2. ⏳ Preparar Sub-Agent 1 para Sprint 1.1
3. ⏳ Preparar Sub-Agent 2 para Sprint 1.2 (en paralelo)
4. ⏳ Preparar Sub-Agent 3 para Sprint 2.1 (cuando 1.1 esté 80%)

**Comando para iniciar**:
```bash
npm run dev        # Servidor ya está corriendo en puerto 3000
npm run lint       # Verificar código
npm run type-check # Verificar tipos
```

---

## 📞 Soporte Durante Implementación

**Si necesitas**:
- Aclaraciones sobre requisitos: Revisa el flujo de usuario correspondiente
- Componentes base: Están en `/src/components/ui/`
- Mock data: Expandir `/src/lib/mock-data.ts`
- Validaciones: Usan Zod en `/src/lib/constants/form-schemas.ts`
- Servicios: Ya existen en `/src/lib/services/`

---

**Versión**: Fase 2 Plan v1.0  
**Fecha**: 13 de Abril de 2026  
**Responsables**: Ingeniero de Sistema + 8 Sub-Agentes  
**Status**: 📋 LISTO PARA IMPLEMENTACIÓN
