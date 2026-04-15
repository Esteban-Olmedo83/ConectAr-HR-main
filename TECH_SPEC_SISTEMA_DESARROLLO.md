# ESPECIFICACIÓN TÉCNICA: Portal "Sistema y Desarrollo"
## Documento para Equipo de Desarrollo

**Fecha**: 14 de Abril, 2026  
**Versión**: 1.0  
**Estado**: Pendiente de Aprobación de Junta Directiva  
**Equipo Responsable**: Backend + Frontend Development

---

## TABLA DE CONTENIDOS

1. [API Specification](#api-specification)
2. [Database Schema](#database-schema)
3. [Component Structure](#component-structure)
4. [Integration Points](#integration-points)
5. [Testing Strategy](#testing-strategy)

---

## API SPECIFICATION

### Base Path
```
/api/system-dev
```

### Authentication
All endpoints require:
- Header: `Authorization: Bearer <JWT_TOKEN>`
- Cookie: `conectar_session` (HttpOnly)
- Role: Must be `'owner'`

### Error Handling
```json
{
  "error": "string",
  "code": "string",
  "statusCode": 400|401|403|404|500,
  "timestamp": "ISO8601",
  "requestId": "string"
}
```

---

## ENDPOINTS: SYSTEM MODULES

### 1. GET /api/system-dev/modules
**Purpose**: List all system modules  
**Access**: Owner only

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "mod_1",
      "name": "Dashboard",
      "slug": "dashboard",
      "description": "Main dashboard",
      "status": "active",
      "parentModules": [],
      "minPermissionLevel": "employee",
      "baseCostCents": 0,
      "clientCount": 1245,
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-04-10T15:20:00Z",
      "createdBy": "eolmedo",
      "updatedBy": "eolmedo"
    }
  ],
  "total": 28,
  "page": 1,
  "pageSize": 50
}
```

**Query Parameters**:
- `status`: "active" | "inactive" | "beta" (optional)
- `page`: number (default: 1)
- `pageSize`: number (default: 50, max: 200)

---

### 2. POST /api/system-dev/modules
**Purpose**: Create new system module  
**Access**: Owner only

**Request Body**:
```json
{
  "name": "Advanced Analytics",
  "slug": "advanced-analytics",
  "description": "Advanced analytics and reporting",
  "status": "active",
  "parentModules": [],
  "minPermissionLevel": "manager",
  "baseCostCents": 5000,
  "metadata": {
    "icon": "analytics",
    "color": "blue"
  }
}
```

**Validation Rules**:
- `name`: Required, 1-100 chars, unique
- `slug`: Required, kebab-case, unique
- `status`: Must be one of ["active", "inactive", "beta"]
- `baseCostCents`: Non-negative integer
- `minPermissionLevel`: One of ["admin", "manager", "employee"]

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "mod_29",
    "name": "Advanced Analytics",
    "slug": "advanced-analytics",
    "status": "active",
    "createdAt": "2026-04-14T23:30:00Z"
  }
}
```

---

### 3. PUT /api/system-dev/modules/:moduleId
**Purpose**: Update existing module  
**Access**: Owner only

**Request Body**:
```json
{
  "name": "Advanced Analytics Pro",
  "description": "Premium analytics features",
  "status": "beta",
  "baseCostCents": 7500
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "mod_29",
    "name": "Advanced Analytics Pro",
    "status": "beta",
    "updatedAt": "2026-04-14T23:35:00Z"
  }
}
```

---

### 4. DELETE /api/system-dev/modules/:moduleId
**Purpose**: Deactivate module (soft delete)  
**Access**: Owner only

**Behavior**:
- Sets status to "inactive"
- Preserves audit trail
- Notifies affected clients
- Does NOT delete historical data

**Response**:
```json
{
  "success": true,
  "message": "Module deactivated successfully",
  "affectedClients": 150
}
```

---

## ENDPOINTS: SUBSCRIPTION PLANS

### 1. GET /api/system-dev/plans
**Purpose**: List all subscription plans

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "plan_basic",
      "name": "Basic",
      "slug": "basic",
      "costCents": 4900,
      "billingPeriod": "monthly",
      "modules": ["dashboard", "my-portal"],
      "createdAt": "2026-01-01T00:00:00Z"
    },
    {
      "id": "plan_pro",
      "name": "Professional",
      "slug": "professional",
      "costCents": 14900,
      "billingPeriod": "monthly",
      "modules": ["dashboard", "employees", "leave", "payroll", "analytics", "my-portal"],
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2. POST /api/system-dev/plans
**Purpose**: Create new subscription plan

**Request Body**:
```json
{
  "name": "Enterprise Plus",
  "slug": "enterprise-plus",
  "costCents": 99900,
  "billingPeriod": "monthly",
  "modules": ["dashboard", "employees", "payroll", "recruitment", "organization-chart", "analytics", "my-portal", "advanced-analytics"],
  "features": {
    "apiAccess": true,
    "dedicatedSupport": true,
    "slaGuaranteed": true,
    "customModules": 3
  }
}
```

---

## ENDPOINTS: CLIENT SUBSCRIPTIONS

### 1. GET /api/system-dev/clients
**Purpose**: List all client subscriptions

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "sub_1",
      "clientId": "client_acme",
      "clientName": "Acme Corp",
      "planId": "plan_pro",
      "planName": "Professional",
      "status": "active",
      "assignedModules": [
        {
          "moduleId": "mod_1",
          "moduleName": "Dashboard",
          "permissions": "read-write"
        }
      ],
      "startedAt": "2025-04-14T00:00:00Z",
      "renewsAt": "2026-05-14T00:00:00Z",
      "monthlyRecurringRevenue": 14900
    }
  ],
  "total": 1245
}
```

---

### 2. PUT /api/system-dev/clients/:subscriptionId/plan
**Purpose**: Change client subscription plan

**Request Body**:
```json
{
  "planId": "plan_enterprise",
  "effectiveDate": "2026-04-14",
  "proration": true
}
```

**Behavior**:
- Validates plan exists
- Calculates proration if mid-cycle
- Updates assigned modules
- Notifies client of change
- Records in audit log

**Response**:
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_1",
    "oldPlan": "plan_pro",
    "newPlan": "plan_enterprise",
    "effectiveDate": "2026-04-14",
    "adjustedAmount": -2500,
    "newMonthlyRecurringRevenue": 49900
  }
}
```

---

### 3. PUT /api/system-dev/clients/:subscriptionId/modules
**Purpose**: Assign/unassign modules to client

**Request Body**:
```json
{
  "moduleAssignments": [
    {
      "moduleId": "mod_recruitment",
      "permissions": "read-write",
      "assigned": true
    },
    {
      "moduleId": "mod_organization_chart",
      "permissions": "read",
      "assigned": false
    }
  ]
}
```

**Validation**:
- All modules must exist
- Modules must be compatible with plan
- Client cannot have modules not in their plan unless custom

**Response**:
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_1",
    "moduleCount": 8,
    "updatedAt": "2026-04-14T23:40:00Z"
  }
}
```

---

### 4. PUT /api/system-dev/clients/:subscriptionId/status
**Purpose**: Suspend/reactivate/cancel subscription

**Request Body**:
```json
{
  "status": "suspended",
  "reason": "Non-payment",
  "effectiveDate": "2026-04-14"
}
```

**Allowed Status Transitions**:
```
active → {suspended, cancelled}
trial → {active, cancelled}
suspended → {active, cancelled}
cancelled → [no transitions]
```

---

## ENDPOINTS: AUDIT LOGS

### 1. GET /api/system-dev/audit-logs
**Purpose**: Retrieve audit trail

**Query Parameters**:
- `startDate`: ISO8601 date
- `endDate`: ISO8601 date
- `actionType`: "create" | "update" | "delete" | "assign"
- `userId`: Filter by user
- `limit`: Max results (default: 100, max: 1000)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "audit_1001",
      "timestamp": "2026-04-14T23:15:30Z",
      "action": "module_updated",
      "userId": "owner-1",
      "userName": "Esteban Olmedo",
      "resourceType": "system_module",
      "resourceId": "mod_5",
      "resourceName": "Analytics",
      "beforeState": {
        "status": "beta",
        "baseCostCents": 5000
      },
      "afterState": {
        "status": "active",
        "baseCostCents": 5000
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "changeDescription": "Module activated (status: beta → active)"
    }
  ],
  "total": 450,
  "page": 1
}
```

---

### 2. GET /api/system-dev/audit-logs/export
**Purpose**: Export audit logs

**Query Parameters**:
- `format`: "json" | "csv" | "pdf" (required)
- `startDate`: ISO8601
- `endDate`: ISO8601

**Response** (application/octet-stream):
- File download with audit data

---

## DATABASE SCHEMA

### Tables

#### system_modules
```sql
CREATE TABLE system_modules (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status ENUM('active', 'inactive', 'beta') DEFAULT 'active',
  parent_modules JSONB DEFAULT '[]',
  min_permission_level VARCHAR(20),
  base_cost_cents INT NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50),
  deleted_at TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  FOREIGN KEY (created_by) REFERENCES usuarios(id),
  FOREIGN KEY (updated_by) REFERENCES usuarios(id)
);
```

#### subscription_plans
```sql
CREATE TABLE subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  cost_cents INT NOT NULL,
  billing_period VARCHAR(20) DEFAULT 'monthly',
  modules JSONB NOT NULL DEFAULT '[]',
  features JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_cost_cents (cost_cents)
);
```

#### client_subscriptions
```sql
CREATE TABLE client_subscriptions (
  id VARCHAR(50) PRIMARY KEY,
  client_id VARCHAR(50) NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status ENUM('trial', 'active', 'suspended', 'cancelled') DEFAULT 'trial',
  assigned_modules JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMP NOT NULL,
  renews_at TIMESTAMP NOT NULL,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  UNIQUE KEY unique_client_active (client_id, status),
  FOREIGN KEY (client_id) REFERENCES clientes(id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
  INDEX idx_status (status),
  INDEX idx_renews_at (renews_at),
  INDEX idx_client_id (client_id)
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(50),
  resource_name VARCHAR(200),
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(100),
  before_state JSONB,
  after_state JSONB,
  change_description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES usuarios(id),
  INDEX idx_action (action),
  INDEX idx_resource_type (resource_type),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_composite (resource_type, resource_id, created_at)
);
```

---

## COMPONENT STRUCTURE

### Directory Layout
```
src/
├── app/
│   ├── api/
│   │   └── system-dev/
│   │       ├── modules/
│   │       │   ├── route.ts        [GET, POST]
│   │       │   └── [moduleId]/
│   │       │       └── route.ts    [GET, PUT, DELETE]
│   │       ├── plans/
│   │       │   └── route.ts        [GET, POST, PUT]
│   │       ├── clients/
│   │       │   ├── route.ts        [GET]
│   │       │   └── [subscriptionId]/
│   │       │       ├── plan/route.ts
│   │       │       ├── modules/route.ts
│   │       │       └── status/route.ts
│   │       ├── audit-logs/
│   │       │   ├── route.ts        [GET]
│   │       │   └── export/route.ts
│   │       └── _middleware.ts      [Authorization check]
│   └── owner/
│       └── system-dev/
│           ├── page.tsx            [Main dashboard]
│           ├── layout.tsx
│           └── components/
│               ├── ModulesTable.tsx
│               ├── ModuleForm.tsx
│               ├── ClientsList.tsx
│               ├── PlanSelector.tsx
│               ├── AuditViewer.tsx
│               └── SystemDashboard.tsx
│
├── lib/
│   ├── system-dev/
│   │   ├── modules.ts     [Module CRUD logic]
│   │   ├── plans.ts       [Plan CRUD logic]
│   │   ├── subscriptions.ts [Subscription logic]
│   │   └── audit.ts       [Audit logging]
│   └── types/
│       └── system-dev.ts  [TypeScript interfaces]
│
└── hooks/
    └── useSystemDev.ts    [Custom hook for admin panel]
```

---

## INTEGRATION POINTS

### 1. Authentication
- Check role === 'owner' in middleware
- Validate JWT token expiration
- Log failed auth attempts

### 2. Client Management
- Get client info from `clientes` table
- Apply module changes to client's dashboard
- Update client's available features dynamically

### 3. Billing System
- Calculate MRR (Monthly Recurring Revenue) on plan changes
- Apply prorations for mid-cycle changes
- Create billing adjustments for credit/discounts

### 4. Notifications
- Send email to client when plan changes
- Send email when modules are added/removed
- Webhook notifications for external systems

### 5. Analytics
- Track module adoption rate by client
- Monitor plan distribution
- Calculate customer lifetime value (CLV)

---

## TESTING STRATEGY

### Unit Tests (40% coverage)
```
✓ Module CRUD operations
✓ Plan validation
✓ Subscription logic
✓ Permission checks
✓ Audit logging
```

### Integration Tests (35% coverage)
```
✓ API endpoint chains
✓ Database transactions
✓ Module assignment cascade
✓ Client notification workflow
```

### End-to-End Tests (20% coverage)
```
✓ Complete module creation → assignment → client sees
✓ Plan change with proration
✓ Client suspension/reactivation
✓ Audit trail completeness
```

### Load Tests (5% coverage)
```
✓ 100 concurrent users
✓ 1000 RPS API load
✓ Database connection pool
✓ Report generation under load
```

### Security Tests
```
✓ Non-owner cannot access /owner/system-dev
✓ Non-owner cannot call API endpoints
✓ Rate limiting works (1 req/sec)
✓ SQL injection prevention
✓ XSS protection in UI
✓ CSRF token validation
```

---

## PERFORMANCE TARGETS

| Metric | Target | Method |
|--------|--------|--------|
| Page Load | < 2s | Lighthouse audit |
| API Response | < 500ms p95 | New Relic APM |
| DB Query | < 100ms | EXPLAIN ANALYZE |
| Module List | < 200ms | Load 28 modules |
| Client List | < 300ms | Load 1000+ clients |
| Audit Export | < 2s | 10k log entries |

---

## DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] All tests passing (95%+ coverage)
- [ ] Code review completed
- [ ] Security audit completed
- [ ] Performance tests passing
- [ ] Database migrations tested
- [ ] Rollback plan documented

### Deployment
- [ ] Feature flag enabled
- [ ] Monitoring alerts configured
- [ ] Logging configured
- [ ] Database backups taken
- [ ] Gradual rollout (10% → 50% → 100%)

### Post-deployment
- [ ] Smoke tests passed
- [ ] Monitoring shows green
- [ ] No error spikes
- [ ] Owner UAT completed
- [ ] Full rollout to production

---

**Document Version**: 1.0  
**Last Updated**: 14 de Abril, 2026  
**Status**: Pending Board Approval  
**Next Review**: Post-Phase 1 Completion
