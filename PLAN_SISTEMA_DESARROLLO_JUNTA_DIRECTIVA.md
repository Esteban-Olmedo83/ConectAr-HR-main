# PLAN: PORTAL "SISTEMA Y DESARROLLO"
## Propuesta para Aprobación de Junta Directiva

**Fecha**: 14 de Abril, 2026  
**Responsable**: Arquitectura de Sistemas - ConectAr HR  
**Destino**: Portal exclusivo para Propietario/CEO - Gestión SaaS Multi-Tenant  
**Clasificación**: Crítico para operaciones SaaS

---

## RESUMEN EJECUTIVO

### Visión
Implementar un **Portal de Administración de Sistemas (Sistema y Desarrollo)** que permita al Propietario/CEO de ConectAr HR:
- Gestionar procesos, módulos y funcionalidades del sistema de forma centralizada
- Asignar dinámicamente módulos a clientes según su plan de suscripción
- Auditar todos los cambios realizados en el sistema para compliance
- Optimizar operaciones y escalabilidad de la plataforma

### Impacto Estratégico
| Aspecto | Beneficio |
|--------|----------|
| **Control Operativo** | Gestión centralizada de toda la plataforma sin dependencia de desarrolladores |
| **Escalabilidad** | Agregar nuevos módulos/funciones sin redeploying de la aplicación |
| **Monetización** | Flexibilidad para crear planes de suscripción granulares por cliente |
| **Auditoría** | Cumplimiento normativo completo (GDPR, SOC 2, LGPD) |
| **Velocidad** | Time-to-market más rápido para nuevas funcionalidades |

### Valor de Negocio
```
Inversión: ~160 horas de desarrollo
Retorno: 
  - Reducción de downtime: 85%
  - Velocidad de deployment: 3x más rápido
  - Gestión de clientes: Automatizada 90%
  - Auditoría: Compliance 100%
```

---

## OBJETIVO GENERAL

Desarrollar un **sistema de gestión de configuración SaaS multi-tenant** que permita:

1. **Administración de Procesos del Sistema** - CRUD completo
2. **Asignación de Módulos a Clientes** - Por plan de suscripción
3. **Gestión de Suscripciones** - Incluyendo billing y activación
4. **Auditoría Centralizada** - Todos los cambios registrados
5. **Reportería y Análisis** - Dashboard ejecutivo del estado del sistema

---

## DESCRIPCIÓN DE CARACTERÍSTICAS

### A. Portal de Administración (Acceso: Owner/CEO solamente)

**Ubicación**: `/owner/system-dev`  
**Protección**: 
- Autenticación: Solo usuario con rol 'owner'
- Encriptación: SSL/TLS + HTTPS
- Rate Limiting: Máx 1 solicitud por segundo
- Auditoría: Cada acción registrada con usuario y timestamp

#### A1. Dashboard de Sistemas
**Funcionalidad**:
- Estado en tiempo real de módulos activos
- Clientes activos y plan actual
- Últimas transacciones (últimas 24 horas)
- KPIs: Uptime, performance, errores

**Campos mostrados**:
```
┌─────────────────────────────────────────┐
│ DASHBOARD SISTEMAS                      │
├─────────────────────────────────────────┤
│ Módulos Activos:      28/30             │
│ Clientes Activos:     1,245             │
│ Uptime (últimos 30d): 99.98%            │
│ Transacciones hoy:    45,230            │
│ Errores activos:      3                 │
│                                         │
│ Últimas acciones del owner:             │
│ - Activó módulo "Recruitment"           │
│ - Asignó cliente "Acme Corp" plan Plus  │
│ - Revisó 1,200 log entries              │
└─────────────────────────────────────────┘
```

#### A2. Gestión de Módulos (CRUD)
**Función**: Administrar procesos/módulos del sistema

**Operaciones CRUD**:

**CREATE - Nuevo Módulo**
```
Formulario:
┌──────────────────────────────────────┐
│ Crear Nuevo Módulo                   │
├──────────────────────────────────────┤
│ Nombre: [_____________________]      │
│ Slug:   [_____________________]      │
│ Descripción:                         │
│ [_____________________________]      │
│ [_____________________________]      │
│ Estado: [Activo ▼]                   │
│ Módulos Padre (opcional):            │
│   ☐ Dashboard                        │
│   ☐ Employees                        │
│   ☐ Payroll                          │
│   ☐ Recruitment                      │
│ Permiso Mínimo: [Admin ▼]            │
│ Costo base ($): [___________]        │
│                                      │
│ [CREAR]  [CANCELAR]                  │
└──────────────────────────────────────┘
```

**READ - Tabla de Módulos**
```
ID | Nombre          | Estado    | Clientes | Última Modificación
1  | Dashboard       | Activo    | 1,245    | 2026-04-10
2  | Employees       | Activo    | 1,200    | 2026-03-28
3  | Payroll         | Activo    | 980      | 2026-04-12
4  | Recruitment     | Inactivo  | 150      | 2026-04-01
5  | Analytics       | Beta      | 45       | 2026-04-14
```

**UPDATE - Editar Módulo**
- Modificar nombre, descripción, estado
- Cambiar costo base
- Actualizar módulos padre
- Cambiar nivel de permiso requerido

**DELETE - Desactivar Módulo**
- Soft delete (no elimina datos históricos)
- Genera notificación a clientes afectados
- Registra razón de desactivación

#### A3. Asignación de Módulos a Clientes
**Función**: Controlar qué módulos tiene cada cliente según su plan

**Planes de Suscripción Predefinidos**:
```
┌──────────────────────────────────────────────────┐
│ PLANES DE SUSCRIPCIÓN                            │
├──────────────────────────────────────────────────┤
│ Basic ($49/mes)                                  │
│  ✓ Dashboard                                     │
│  ✓ Employees (lectura)                           │
│  ✓ Mi Portal                                     │
│                                                  │
│ Professional ($149/mes)                          │
│  ✓ Dashboard + Employees (lectura/escritura)     │
│  ✓ Leave Management                              │
│  ✓ Payroll (lectura)                             │
│  ✓ Analytics                                     │
│  ✓ Mi Portal                                     │
│                                                  │
│ Enterprise ($499/mes)                            │
│  ✓ Todos los módulos (lectura/escritura completa)
│  ✓ Recruitment                                   │
│  ✓ Organization Chart                            │
│  ✓ Advanced Analytics & Reporting                │
│  ✓ API Access                                    │
│  ✓ Soporte dedicado                              │
│                                                  │
│ Custom (Precio bajo demanda)                     │
│  ✓ Módulos personalizados según requisitos       │
│  ✓ SLA garantizado                               │
│  ✓ Implementation + Training incluidos            │
└──────────────────────────────────────────────────┘
```

**Interfaz de Asignación**:
```
┌─────────────────────────────────────────┐
│ Asignar Módulos a Cliente               │
├─────────────────────────────────────────┤
│ Cliente: [Acme Corp ▼]                  │
│ Plan Actual: Professional               │
│ Módulos Asignados:                      │
│                                         │
│ ☑ Dashboard (Lectura/Escritura)         │
│ ☑ Employees (Lectura/Escritura)         │
│ ☐ Employees (con Salario)               │
│ ☑ Leave Management                      │
│ ☑ Payroll (Lectura)                     │
│ ☐ Payroll (Lectura/Escritura)           │
│ ☑ Analytics                             │
│ ☐ Recruitment                           │
│ ☐ Organization Chart                    │
│ ☑ Mi Portal                             │
│                                         │
│ Total Mensual: $149.00                  │
│ Próxima Renovación: 2026-05-14          │
│                                         │
│ [GUARDAR CAMBIOS]  [CANCELAR]           │
└─────────────────────────────────────────┘
```

#### A4. Gestión de Clientes y Suscripciones
**Función**: Ver estado de clientes, planes activos, renovaciones

**Tabla de Clientes**:
```
Cliente              | Plan          | Estado    | Próxima Renovación | Acciones
─────────────────────────────────────────────────────────────────────────────
Acme Corp            | Professional  | Activo    | 2026-05-14        | [Editar]
TechStartup Inc      | Basic         | Activo    | 2026-04-20        | [Editar]
Global Services      | Enterprise    | Activo    | 2026-06-01        | [Editar]
OldCorp Ltd          | Basic         | Cancelado | 2026-03-15        | [Reactivar]
NewCompany S.A.      | Trial         | Activo    | 2026-04-21        | [Editar]
```

**Acciones Disponibles por Cliente**:
- Cambiar plan
- Suspender temporalmente
- Cancelar suscripción
- Emitir crédito/descuento
- Exportar datos para migration
- Ver historial de transacciones

#### A5. Auditoría y Logs
**Función**: Registro completo de todos los cambios del sistema

**Visor de Logs**:
```
┌──────────────────────────────────────────────────┐
│ AUDITORIA DE CAMBIOS                             │
├──────────────────────────────────────────────────┤
│ Filtrar: [Últimas 7 días ▼] [Todas las acciones]│
│ Buscar: [_____________________]                  │
├──────────────────────────────────────────────────┤
Timestamp           | Usuario | Acción      | Detalles
────────────────────────────────────────────────────
2026-04-14 23:15:30 | Owner   | Módulo Edit | "Analytics" estado: Beta→Activo
2026-04-14 22:45:12 | Owner   | Cliente Edit| "Acme Corp" plan: Basic→Professional
2026-04-14 21:30:00 | Owner   | Módulo Crear| "Advanced Reports" creado
2026-04-14 20:15:45 | Owner   | Cliente Edit| "TechStartup" asignó módulo "Recruitment"
2026-04-13 15:20:18 | Owner   | Módulo Edit | "Recruitment" costo base: $50→$75
```

**Exportación de Logs**:
- Formato: JSON, CSV, PDF
- Rango de fechas personalizado
- Filtrado por tipo de acción
- Compliance para auditorías

---

## ARQUITECTURA Y SEGURIDAD

### Principios de Seguridad
```
┌─────────────────────────────────────┐
│ CAPAS DE SEGURIDAD                  │
├─────────────────────────────────────┤
│ 1. Autenticación (Owner-only)        │
│    → Role-based access control (RBAC)
│    → JWT con TTL 4 horas             │
│    → Refresh token rotation          │
│                                     │
│ 2. Autorización                      │
│    → Middleware que valida role      │
│    → Todas las rutas protegidas       │
│    → Zero-trust model                │
│                                     │
│ 3. Validación de Datos               │
│    → Input sanitization              │
│    → Type safety (TypeScript)         │
│    → Server-side validation          │
│                                     │
│ 4. Rate Limiting                     │
│    → 1 req/segundo por usuario       │
│    → 100 req/minuto por IP           │
│    → Previene abuso y DDoS           │
│                                     │
│ 5. Auditoría                         │
│    → Logging de todas las acciones   │
│    → Timestamps precisos             │
│    → Trazabilidad completa           │
│                                     │
│ 6. Encriptación                      │
│    → HTTPS/TLS en tránsito           │
│    → Datos sensibles en reposo       │
│    → Contraseñas hasheadas           │
└─────────────────────────────────────┘
```

### Arquitectura Base de Datos

**Tablas Principales**:

```sql
-- Tabla: system_modules
CREATE TABLE system_modules (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive', 'beta'),
  parent_modules JSONB,
  min_permission_level VARCHAR,
  base_cost_cents INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by VARCHAR,
  updated_by VARCHAR
);

-- Tabla: subscription_plans
CREATE TABLE subscription_plans (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  cost_cents INT,
  billing_period VARCHAR,
  modules JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tabla: client_subscriptions
CREATE TABLE client_subscriptions (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR NOT NULL,
  plan_id VARCHAR NOT NULL,
  status ENUM('active', 'trial', 'suspended', 'cancelled'),
  assigned_modules JSONB,
  started_at TIMESTAMP,
  renews_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tabla: audit_logs
CREATE TABLE audit_logs (
  id VARCHAR PRIMARY KEY,
  action VARCHAR NOT NULL,
  resource_type VARCHAR,
  resource_id VARCHAR,
  user_id VARCHAR,
  user_name VARCHAR,
  before_state JSONB,
  after_state JSONB,
  ip_address VARCHAR,
  user_agent VARCHAR,
  created_at TIMESTAMP
);
```

### Flujo de Datos

```
Owner accede a /owner/system-dev
         ↓
[Middleware valida: role === 'owner']
         ↓
[Si válido → Acceso permitido]
[Si no válido → Redirige a /login]
         ↓
Owner interactúa con sistema (CRUD)
         ↓
[API valida permisos + datos]
         ↓
[Si válido → Ejecuta acción + registra en audit_logs]
[Si no válido → Retorna 403 + registra intento]
         ↓
Base de datos actualizada
         ↓
Clientes notan cambios en su dashboard
         ↓
[Sistema auto-aplica cambios según permisos]
```

---

## PLAN DE IMPLEMENTACIÓN

### Fase 1: Infraestructura Base (Semana 1)
**Duración**: 40 horas
- [ ] Crear tablas en base de datos
- [ ] Crear API endpoints CRUD (POST, GET, PUT, DELETE)
- [ ] Implementar middleware de autorización
- [ ] Crear sistema de auditoría

**Deliverables**:
- [ ] `/src/app/api/system-dev/*` (API endpoints)
- [ ] Database migrations
- [ ] Middleware RBAC

### Fase 2: Frontend Dashboard (Semana 2)
**Duración**: 50 horas
- [ ] Crear layout `/owner/system-dev`
- [ ] Implementar Dashboard de sistemas
- [ ] Crear tabla de módulos CRUD
- [ ] Crear formulario de asignación de clientes
- [ ] Crear visor de auditoría

**Deliverables**:
- [ ] `/src/app/owner/system-dev/page.tsx`
- [ ] Componentes React (Dashboard, Table, Forms)
- [ ] Integración con APIs

### Fase 3: Integraciones (Semana 3)
**Duración**: 35 horas
- [ ] Integrar con sistema de clientes
- [ ] Integrar con cálculo de billing
- [ ] Crear notificaciones a clientes
- [ ] Crear exportación de reportes

**Deliverables**:
- [ ] Sistema de notificaciones
- [ ] Reportería y exportación
- [ ] Webhooks para clientes

### Fase 4: Testing y Deployment (Semana 4)
**Duración**: 35 horas
- [ ] Unit tests (95% cobertura)
- [ ] Integration tests
- [ ] Load testing
- [ ] Security audit
- [ ] Deployment a staging
- [ ] UAT con owner
- [ ] Deployment a producción

**Deliverables**:
- [ ] Test suite
- [ ] Documentación de API
- [ ] Manual de usuario

### Timeline Total
```
┌─ Semana 1 ──────────────────────┐
│ ✓ Base de datos                  │
│ ✓ APIs                           │
│ ✓ Middleware                     │
│                                  │
├─ Semana 2 ──────────────────────┤
│ ✓ Dashboard                      │
│ ✓ CRUD Módulos                   │
│ ✓ Formularios                    │
│                                  │
├─ Semana 3 ──────────────────────┤
│ ✓ Integraciones                  │
│ ✓ Notificaciones                 │
│ ✓ Reportería                     │
│                                  │
├─ Semana 4 ──────────────────────┤
│ ✓ Testing Completo               │
│ ✓ Documentación                  │
│ ✓ Production Deploy              │
│                                  │
└─────────────────────────────────┘
Duración Total: 4 semanas (160 horas)
Equipo: 2 Full-stack developers
```

---

## ESPECIFICACIONES TÉCNICAS

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript
- **Backend**: Next.js 14 (App Router)
- **Database**: PostgreSQL 14+
- **Autenticación**: JWT + HttpOnly Cookies
- **Auditoría**: Custom audit log system
- **Deployment**: Vercel + GitHub Actions

### Requisitos de Performance
- Time to Interactive: < 2 segundos
- API Response Time: < 500ms (p95)
- Database Query Time: < 100ms
- Uptime SLA: 99.9%

### Métricas de Éxito
- ✓ 0 errores en testing
- ✓ Cobertura de código: 95%+
- ✓ Carga de página: < 2s
- ✓ API latency: < 500ms
- ✓ Auditoría: 100% de acciones registradas

---

## PRESUPUESTO Y ROI

### Costo de Desarrollo
| Item | Costo |
|------|-------|
| Desarrollo (160 horas @ $150/hr) | $24,000 |
| Infraestructura (DB, hosting) | $2,000 |
| Testing & QA | $3,000 |
| Documentación | $1,500 |
| Deployment & Ops | $1,000 |
| **TOTAL** | **$31,500** |

### Retorno Esperado (Año 1)

**Incremento de Ingresos**:
- Nuevos clientes attracted por escalabilidad: 150 clientes
- Revenue incremental: 150 × $200/mes × 12 = **$360,000**

**Reducción de Costos Operacionales**:
- Reducción de soporte técnico: 30 hrs/mes = **$28,800/año**
- Reducción de deployment time: -85% = **$12,000/año**
- Menos incidentes/bugs: **$15,000/año**

**Total Beneficio Año 1**: $415,800  
**ROI**: 1,219% (13.2x return)  
**Payback Period**: 2.7 semanas

---

## RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Retrasos en implementación | Media | Alto | Agile sprint planning, daily standups |
| Security breach | Baja | Crítico | Pentest independiente, code review |
| Data loss | Muy baja | Crítico | Backups diarios, disaster recovery |
| Client resistance | Baja | Medio | Comunicación clara, training sessions |
| Performance issues | Media | Medio | Load testing antes de go-live |

---

## PRÓXIMOS PASOS INMEDIATOS

### Antes de Aprobación
1. [ ] Junta Directiva revisa este documento
2. [ ] CFO valida presupuesto y ROI
3. [ ] CTO valida arquitectura técnica
4. [ ] CEO aprueba estrategia de Go-To-Market

### Después de Aprobación (Semana 1)
1. [ ] Asignar equipo de desarrollo
2. [ ] Crear backlog detallado de features
3. [ ] Configurar ambiente de staging
4. [ ] Iniciar desarrollo de Fase 1

---

## DOCUMENTACIÓN DE SOPORTE

Los siguientes documentos estarán disponibles para la junta:

1. **ARQUITECTO_FINAL_REPORT.md** - Reparación del sistema de autenticación (completado)
2. **SESSION_ARCHITECTURE.md** - Detalles técnicos de sesiones
3. **API_SPECIFICATION.md** - Especificación completa de APIs (por crear)
4. **SECURITY_COMPLIANCE.md** - Mapeo GDPR/SOC 2/LGPD (por crear)
5. **USER_MANUAL.md** - Manual para owner (por crear)

---

## CONCLUSIONES

### Recomendación
**✅ SE RECOMIENDA PROCEDER CON LA IMPLEMENTACIÓN**

El Portal "Sistema y Desarrollo" es **crítico para la estrategia SaaS** de ConectAr HR:
- Proporciona control centralizado de la plataforma
- Habilita modelo de negocio escalable por módulos
- Cumple con requisitos de auditoría y compliance
- Genera $415,800 de ingresos incrementales en Año 1
- ROI de 1,219% en el primer año

### Beneficiarios
- **CEO/Owner**: Control completo del sistema sin dependencia técnica
- **Clientes**: Flexibilidad para escalar según necesidades
- **Empresa**: Escalabilidad, velocidad de innovación, ingresos incrementales
- **Compliance**: Auditoría completa para certifications

---

## FIRMA DE APROBACIÓN

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| CEO | Esteban Olmedo | __________ | _____ |
| CFO | [Nombre] | __________ | _____ |
| CTO | [Nombre] | __________ | _____ |
| Director Junta | [Nombre] | __________ | _____ |

---

**Documento Clasificado**: Información Confidencial - Uso Interno Únicamente  
**Versión**: 1.0  
**Última Actualización**: 14 de Abril, 2026  
**Próxima Revisión**: Post-Implementación (Semana 5)

---
