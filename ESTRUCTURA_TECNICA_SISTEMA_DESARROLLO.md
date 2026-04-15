# ESTRUCTURA TÉCNICA: Sistema y Desarrollo
## Documento de Arquitectura Técnica

**Fecha**: 14 de Abril, 2026  
**Para**: Revisión antes de implementación  
**Status**: Pendiente de aprobación

---

## 1. ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                     OWNER BROWSER                           │
│              /owner/system-dev [AppShell]                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Sistema y Desarrollo Dashboard                       │  │
│  │                                                      │  │
│  │ ├─ Tabla CRUD (Funciones existentes)                │  │
│  │ ├─ Modal Crear Función                             │  │
│  │ ├─ Modal Editar Función                            │  │
│  │ ├─ Modal Preview/Test                              │  │
│  │ └─ Modal Publish Hotfix                            │  │
│  │                                                      │  │
│  │ ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │  │
│  │ │Code Editor   │  │Form Builder  │  │Sandbox    │  │  │
│  │ │(Monaco)      │  │(Visual)      │  │(Testing)  │  │  │
│  │ └──────────────┘  └──────────────┘  └───────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓ HTTP ↓                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS API SERVER                       │
│              /api/system-dev/* [Routes]                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Middleware: Verifica role === 'owner'              │  │
│  │ Rate Limiting: 1 req/segundo                       │  │
│  │ Auditoría: Registra TODA acción                    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │/functions    │  │/testing      │  │/hotfixes       │  │
│  │CRUD de       │  │Ejecutar      │  │Publicar como   │  │
│  │funciones     │  │funciones en  │  │hotfix +        │  │
│  │              │  │sandbox       │  │changelog       │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
│                          ↓ SQL ↓                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL DATABASE                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │system_       │  │function_     │  │hotfixes        │  │
│  │functions     │  │versions      │  │                │  │
│  │              │  │              │  │                │  │
│  │id (PK)       │  │id (PK)       │  │id (PK)         │  │
│  │name          │  │function_id   │  │function_id     │  │
│  │slug          │  │version_num   │  │version_id      │  │
│  │status        │  │code/config   │  │published_at    │  │
│  │type          │  │created_at    │  │changelog       │  │
│  │description   │  │author        │  │created_by      │  │
│  │created_at    │  │              │  │                │  │
│  │updated_at    │  │              │  │                │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
│                                                             │
│  ┌────────────────────┐      ┌──────────────┐            │
│  │audit_logs          │      │function_     │            │
│  │                    │      │execution_log │            │
│  │id (PK)             │      │              │            │
│  │action              │      │id (PK)       │            │
│  │resource_id         │      │function_id   │            │
│  │before_state        │      │version_id    │            │
│  │after_state         │      │input         │            │
│  │user_id             │      │output        │            │
│  │timestamp           │      │status        │            │
│  │ip_address          │      │timestamp     │            │
│  └────────────────────┘      └──────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ESTRUCTURA DE BASE DE DATOS

### Tabla: `system_functions`
```sql
CREATE TABLE system_functions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  status ENUM('development', 'testing', 'published', 'deprecated') DEFAULT 'development',
  type ENUM('code', 'form-builder', 'api-integration', 'webhook'),
  icon VARCHAR(50),
  category VARCHAR(100),
  created_by VARCHAR(50) NOT NULL,
  updated_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES usuarios(id),
  FOREIGN KEY (updated_by) REFERENCES usuarios(id),
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);
```

### Tabla: `function_versions`
```sql
CREATE TABLE function_versions (
  id VARCHAR(50) PRIMARY KEY,
  function_id VARCHAR(50) NOT NULL,
  version_number INT NOT NULL,
  
  -- Para type='code': código JavaScript/TypeScript
  code_content TEXT,
  
  -- Para type='form-builder': configuración JSON del formulario
  form_config JSONB,
  
  -- Para type='api-integration': configuración de API
  api_config JSONB,
  
  -- Para type='webhook': configuración de webhook
  webhook_config JSONB,
  
  -- Metadata
  environment ENUM('development', 'testing', 'production') DEFAULT 'development',
  test_results JSONB,
  test_passed BOOLEAN,
  
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changelog TEXT,
  
  FOREIGN KEY (function_id) REFERENCES system_functions(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES usuarios(id),
  UNIQUE KEY unique_version (function_id, version_number),
  INDEX idx_function_id (function_id),
  INDEX idx_environment (environment)
);
```

### Tabla: `hotfixes`
```sql
CREATE TABLE hotfixes (
  id VARCHAR(50) PRIMARY KEY,
  function_id VARCHAR(50) NOT NULL,
  version_id VARCHAR(50) NOT NULL,
  
  title VARCHAR(200) NOT NULL,
  description TEXT,
  changelog TEXT,
  
  status ENUM('draft', 'published', 'rolled_back') DEFAULT 'draft',
  published_at TIMESTAMP,
  published_by VARCHAR(50),
  
  rollback_at TIMESTAMP,
  rollback_by VARCHAR(50),
  rollback_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (function_id) REFERENCES system_functions(id),
  FOREIGN KEY (version_id) REFERENCES function_versions(id),
  FOREIGN KEY (published_by) REFERENCES usuarios(id),
  FOREIGN KEY (rollback_by) REFERENCES usuarios(id),
  INDEX idx_status (status),
  INDEX idx_function_id (function_id),
  INDEX idx_published_at (published_at)
);
```

### Tabla: `function_execution_logs`
```sql
CREATE TABLE function_execution_logs (
  id VARCHAR(50) PRIMARY KEY,
  function_id VARCHAR(50) NOT NULL,
  version_id VARCHAR(50) NOT NULL,
  
  execution_type ENUM('development', 'testing', 'production') DEFAULT 'testing',
  
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  
  status ENUM('success', 'error', 'timeout') DEFAULT 'success',
  execution_time_ms INT,
  
  executed_by VARCHAR(50),
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (function_id) REFERENCES system_functions(id),
  FOREIGN KEY (version_id) REFERENCES function_versions(id),
  FOREIGN KEY (executed_by) REFERENCES usuarios(id),
  INDEX idx_function_id (function_id),
  INDEX idx_execution_type (execution_type),
  INDEX idx_status (status),
  INDEX idx_executed_at (executed_at)
);
```

### Tabla: `audit_logs`
```sql
CREATE TABLE audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(50),
  
  before_state JSONB,
  after_state JSONB,
  
  user_id VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES usuarios(id),
  INDEX idx_action (action),
  INDEX idx_resource_type (resource_type),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

---

## 3. RUTAS / ENDPOINTS API

### Base Path
```
/api/system-dev
```

### Autenticación
```
- Header: Authorization: Bearer <JWT>
- Cookie: conectar_session
- Validación: role === 'owner' (en middleware)
- Rate limit: 1 req/segundo
```

---

### A. FUNCIONES CRUD

#### GET /api/system-dev/functions
**Listar todas las funciones**

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "func_1",
      "name": "Enviar email a empleado",
      "slug": "send-email-employee",
      "description": "Envía email personalizado",
      "status": "published",
      "type": "code",
      "category": "communications",
      "currentVersion": 3,
      "lastModified": "2026-04-14T10:30:00Z",
      "modifiedBy": "eolmedo"
    }
  ]
}
```

---

#### POST /api/system-dev/functions
**Crear nueva función**

Request:
```json
{
  "name": "Generar reporte de nómina",
  "slug": "generate-payroll-report",
  "description": "Genera reporte mensual de nómina",
  "type": "code",
  "category": "payroll",
  "codeContent": "async function generateReport() { ... }"
}
```

Response: 201 Created
```json
{
  "success": true,
  "data": {
    "id": "func_new_1",
    "name": "Generar reporte de nómina",
    "status": "development",
    "version": 1,
    "createdAt": "2026-04-14T23:45:00Z"
  }
}
```

---

#### PUT /api/system-dev/functions/:functionId
**Actualizar función existente**

Request:
```json
{
  "name": "Generar reporte de nómina (mejorado)",
  "description": "Genera reporte con detalles adicionales",
  "codeContent": "async function generateReport() { ... código actualizado ... }"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "func_1",
    "name": "Generar reporte de nómina (mejorado)",
    "currentVersion": 2,
    "updatedAt": "2026-04-14T23:50:00Z"
  }
}
```

---

#### DELETE /api/system-dev/functions/:functionId
**Eliminar función (soft delete)**

Response:
```json
{
  "success": true,
  "message": "Función marcada como eliminada"
}
```

---

### B. VERSIONES

#### GET /api/system-dev/functions/:functionId/versions
**Ver todas las versiones de una función**

Response:
```json
{
  "success": true,
  "data": [
    {
      "versionId": "v_1",
      "version": 1,
      "environment": "development",
      "createdAt": "2026-04-10T10:00:00Z",
      "createdBy": "eolmedo",
      "testPassed": false
    },
    {
      "versionId": "v_2",
      "version": 2,
      "environment": "testing",
      "createdAt": "2026-04-12T14:30:00Z",
      "createdBy": "eolmedo",
      "testPassed": true,
      "testResults": { ... }
    }
  ]
}
```

---

#### GET /api/system-dev/functions/:functionId/versions/:versionId
**Ver contenido específico de una versión**

Response:
```json
{
  "success": true,
  "data": {
    "id": "v_2",
    "functionId": "func_1",
    "version": 2,
    "type": "code",
    "codeContent": "async function sendEmail() { ... }",
    "environment": "testing",
    "testPassed": true,
    "testResults": {
      "executionTime": 245,
      "output": { "success": true, "emailSent": true }
    }
  }
}
```

---

### C. TESTING / SANDBOX

#### POST /api/system-dev/testing/execute
**Ejecutar función en sandbox para testing**

Request:
```json
{
  "functionId": "func_1",
  "versionId": "v_2",
  "inputData": {
    "recipientEmail": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "executionId": "exec_1",
    "status": "success",
    "output": {
      "success": true,
      "emailSent": true,
      "messageId": "msg_123"
    },
    "executionTime": 245,
    "executedAt": "2026-04-14T23:55:00Z"
  }
}
```

---

#### POST /api/system-dev/functions/:functionId/versions/:versionId/validate-test
**Marcar versión como "testing passed"**

Request:
```json
{
  "testResults": {
    "status": "passed",
    "testsRun": 5,
    "testsPassed": 5,
    "failures": []
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Versión marcada como lista para publicar"
}
```

---

### D. HOTFIX / PUBLICACIÓN

#### POST /api/system-dev/hotfixes/publish
**Publicar función como hotfix**

Request:
```json
{
  "functionId": "func_1",
  "versionId": "v_2",
  "title": "Hotfix: Mejora en envío de emails",
  "description": "Aumenta confiabilidad en entrega de emails",
  "changelog": "- Agregado retry logic\n- Mejorado error handling\n- Optimizado tiempo de respuesta",
  "affectClients": true
}
```

Response: 201 Created
```json
{
  "success": true,
  "data": {
    "hotfixId": "hf_1",
    "functionId": "func_1",
    "title": "Hotfix: Mejora en envío de emails",
    "status": "published",
    "publishedAt": "2026-04-15T00:00:00Z",
    "publishedBy": "eolmedo"
  }
}
```

---

#### POST /api/system-dev/hotfixes/:hotfixId/rollback
**Revertir un hotfix**

Request:
```json
{
  "reason": "Causó problemas con integración de Sendgrid"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "hotfixId": "hf_1",
    "status": "rolled_back",
    "rolledBackAt": "2026-04-15T00:30:00Z",
    "rolledBackBy": "eolmedo",
    "reason": "Causó problemas con integración de Sendgrid"
  }
}
```

---

#### GET /api/system-dev/hotfixes
**Ver historial de hotfixes**

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "hf_1",
      "function": "Enviar email",
      "title": "Hotfix: Mejora en envío de emails",
      "status": "published",
      "publishedAt": "2026-04-15T00:00:00Z",
      "changelog": "- Agregado retry logic..."
    }
  ]
}
```

---

### E. AUDITORÍA

#### GET /api/system-dev/audit-logs
**Ver log de cambios**

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "audit_1",
      "timestamp": "2026-04-14T23:50:00Z",
      "action": "function_updated",
      "resource": "func_1",
      "resourceName": "Enviar email",
      "user": "eolmedo",
      "beforeState": { "version": 1 },
      "afterState": { "version": 2 },
      "description": "Actualizado código de función"
    }
  ]
}
```

---

## 4. COMPONENTES REACT

### Directory Structure
```
/src/app/owner/system-dev/
├── page.tsx                          # Main page
├── layout.tsx                        # Layout wrapper
├── components/
│   ├── FunctionsList.tsx             # Tabla CRUD
│   ├── CreateFunctionModal.tsx       # Modal crear
│   ├── EditFunctionModal.tsx         # Modal editar
│   ├── CodeEditor.tsx                # Editor Monaco
│   ├── FormBuilder.tsx               # Visual form builder
│   ├── TestingEnvironment.tsx        # Sandbox testing
│   ├── ExecutionResults.tsx          # Resultados de test
│   ├── HotfixPublishModal.tsx        # Modal publicar hotfix
│   ├── HotfixHistory.tsx             # Historial de hotfixes
│   ├── AuditLog.tsx                  # Log de cambios
│   └── VersionHistory.tsx            # Historial de versiones
└── hooks/
    └── useSystemDev.ts               # Hook para API calls
```

### Componente Principal: `page.tsx`
```tsx
export default function SystemDevPage() {
  // Tabs: Functions | Testing | Hotfixes | Audit
  
  return (
    <div className="system-dev-container">
      <header>Sistema y Desarrollo</header>
      
      <Tabs>
        <Tab name="Funciones">
          <FunctionsList 
            onCreateClick={showCreateModal}
            onEditClick={showEditModal}
            onDeleteClick={deleteFunction}
          />
          <CreateFunctionModal />
          <EditFunctionModal />
        </Tab>
        
        <Tab name="Testing">
          <TestingEnvironment 
            selectedFunction={selectedFunction}
            onExecute={executeInSandbox}
          />
          <ExecutionResults />
        </Tab>
        
        <Tab name="Hotfixes">
          <HotfixPublishModal />
          <HotfixHistory />
        </Tab>
        
        <Tab name="Auditoría">
          <AuditLog />
        </Tab>
      </Tabs>
    </div>
  );
}
```

---

## 5. FLUJO DE DATOS

### Flujo 1: Crear Nueva Función

```
Owner hace click en "Crear Función"
         ↓
Modal abre (elegir tipo: code o form-builder)
         ↓
Type === 'code' → Abre CodeEditor (Monaco)
Type === 'form-builder' → Abre FormBuilder (visual)
         ↓
Owner escribe/configura función
         ↓
Hace click "Guardar Función"
         ↓
Frontend valida inputs (name, slug, etc)
         ↓
POST /api/system-dev/functions
         ↓
Backend:
  ├─ Valida que owner puede hacer esto
  ├─ Crea registro en system_functions (status='development')
  ├─ Crea versión 1 en function_versions
  ├─ Guarda código/config
  ├─ Crea audit log entry
  └─ Retorna id de función
         ↓
Frontend:
  ├─ Cierra modal
  ├─ Refreshea tabla
  └─ Muestra "Función creada exitosamente"
```

### Flujo 2: Testear Función (Testing Environment)

```
Owner selecciona función de la tabla
         ↓
Click en "Test/Preview"
         ↓
Abre TestingEnvironment tab
         ↓
Muestra última versión
         ↓
Owner ingresa test inputs (formulario)
         ↓
Click "Ejecutar Test"
         ↓
POST /api/system-dev/testing/execute
         ↓
Backend:
  ├─ Valida función existe y está en 'development' o 'testing'
  ├─ Extrae código de function_versions
  ├─ Ejecuta en sandbox (vm2 o similar)
  ├─ Captura output, errors, execution time
  ├─ Crea log en function_execution_logs
  └─ Retorna resultados
         ↓
Frontend:
  ├─ Muestra output JSON
  ├─ Muestra execution time
  ├─ Muestra status (success/error)
  └─ Botón "Marcar como testing passed"
         ↓
Owner click "Marcar como testing passed"
         ↓
POST /api/system-dev/functions/:id/versions/:versionId/validate-test
         ↓
Backend actualiza versión (test_passed=true)
```

### Flujo 3: Publicar como Hotfix

```
Owner selecciona función en status 'testing'
         ↓
Click "Publicar como Hotfix"
         ↓
Modal abre pidiendo:
  ├─ Título del hotfix
  ├─ Descripción
  ├─ Changelog
  └─ ¿Notificar a clientes?
         ↓
Owner completa y hace click "Publicar"
         ↓
POST /api/system-dev/hotfixes/publish
         ↓
Backend:
  ├─ Valida versión está en 'testing' y test_passed=true
  ├─ Crea registro en hotfixes (status='published')
  ├─ Actualiza system_functions (status='published')
  ├─ Crea audit log entry
  ├─ SI affectClients=true → Notifica a clientes
  └─ Retorna hotfix_id
         ↓
Frontend:
  ├─ Cierra modal
  ├─ Actualiza tabla (ahora muestra status 'published')
  ├─ Muestra Toast "Hotfix publicado exitosamente"
  └─ Abre tab "Hotfixes" mostrando el nuevo en la lista
         ↓
Sistema en vivo ahora usa nueva versión
```

### Flujo 4: Rollback

```
Owner ve hotfix publicado en historial
         ↓
Nota un problema y click "Deshacer / Rollback"
         ↓
Modal pide razón del rollback
         ↓
Owner escribe razón y confirma
         ↓
POST /api/system-dev/hotfixes/:hotfixId/rollback
         ↓
Backend:
  ├─ Obtiene versión anterior
  ├─ Reactiva versión anterior
  ├─ Actualiza hotfixes (status='rolled_back')
  ├─ Crea audit log
  └─ Retorna confirmación
         ↓
Frontend:
  ├─ Muestra confirmación
  ├─ Actualiza historial mostrando rollback
  └─ Sistema vuelve a versión anterior automáticamente
```

---

## 6. TIPOS TYPESCRIPT

```typescript
// types/system-dev.ts

export type FunctionType = 'code' | 'form-builder' | 'api-integration' | 'webhook';
export type FunctionStatus = 'development' | 'testing' | 'published' | 'deprecated';
export type Environment = 'development' | 'testing' | 'production';
export type ExecutionStatus = 'success' | 'error' | 'timeout';

export interface SystemFunction {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: FunctionType;
  status: FunctionStatus;
  category?: string;
  icon?: string;
  currentVersion: number;
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
}

export interface FunctionVersion {
  id: string;
  functionId: string;
  versionNumber: number;
  codeContent?: string;
  formConfig?: Record<string, any>;
  apiConfig?: Record<string, any>;
  environment: Environment;
  testPassed: boolean;
  testResults?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  changelog?: string;
}

export interface Hotfix {
  id: string;
  functionId: string;
  versionId: string;
  title: string;
  description?: string;
  changelog?: string;
  status: 'draft' | 'published' | 'rolled_back';
  publishedAt?: Date;
  publishedBy?: string;
  rolledBackAt?: Date;
  rolledBackBy?: string;
  rolledBackReason?: string;
}

export interface FunctionExecutionLog {
  id: string;
  functionId: string;
  versionId: string;
  executionType: Environment;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  errorMessage?: string;
  status: ExecutionStatus;
  executionTimeMs: number;
  executedBy: string;
  executedAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  userId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

---

## 7. INTEGRACIONES CON SISTEMA EXISTENTE

### 1. Con Middleware de Autenticación
```typescript
// En /api/system-dev/_middleware.ts
export function middleware(request: NextRequest) {
  const session = request.cookies.get('conectar_session');
  const sessionData = parseSession(session);
  
  // Validar: solo 'owner' puede acceder
  if (sessionData?.role !== 'owner') {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}
```

### 2. Con Sistema de Auditoría Existente
```typescript
// En /api/system-dev/functions (crear)
import { logEvent } from '@/lib/audit-log';

logEvent(
  'FUNCTION_CREATED',
  `Owner creó nueva función: ${functionName}`,
  userId,
  userName
);
```

### 3. Con Notificaciones a Clientes
```typescript
// En /api/system-dev/hotfixes/publish
if (affectClients) {
  const clients = await getClientsWithFunction(functionId);
  for (const client of clients) {
    await sendNotificationEmail(client.email, {
      subject: 'Mejora en ConectAr HR',
      body: `Hemos publicado: ${changelog}`
    });
  }
}
```

---

## 8. SEGURIDAD

### Validaciones en Backend
```
✓ Role === 'owner' (middleware)
✓ Rate limiting: 1 req/segundo
✓ Input validation: name, slug, type, code length
✓ Code injection prevention: usar vm2 para ejecutar código
✓ CSRF: validar token
✓ Auditoría: registrar TODA acción
```

### Validaciones en Frontend
```
✓ Form validation (Zod)
✓ XSS prevention: sanitizar inputs
✓ CSRF: incluir token en requests
✓ Error handling: no exponer detalles sensibles
```

---

## 9. PERFORMANCE

### Targets
- Cargar lista de funciones: < 500ms
- Ejecutar función en sandbox: < 2 segundos
- Publicar hotfix: < 1 segundo
- Página completa load: < 2 segundos

### Optimizaciones
- Lazy load tabs
- Virtualizar tabla si hay 100+ funciones
- Caché de funciones (refetch cada 5 min)
- Code splitting para Monaco editor

---

## 10. CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Database + API
- [ ] Crear migrations (4 tablas nuevas)
- [ ] Crear API endpoints CRUD (5 routes)
- [ ] Crear API testing endpoint
- [ ] Crear API hotfix/rollback
- [ ] Crear API audit-logs
- [ ] Validación + error handling
- [ ] Auditoría en cada endpoint

### Fase 2: Frontend CRUD
- [ ] Crear FunctionsList component
- [ ] Crear CreateFunctionModal
- [ ] Crear EditFunctionModal
- [ ] Conectar a API
- [ ] Validación de formularios
- [ ] Error handling en UI

### Fase 3: Editors
- [ ] Integrar Monaco Editor (code)
- [ ] Crear FormBuilder (visual)
- [ ] Syntax highlighting
- [ ] Auto-save

### Fase 4: Testing
- [ ] Crear TestingEnvironment component
- [ ] Integrar sandbox execution
- [ ] Mostrar resultados
- [ ] Marcar como "testing passed"

### Fase 5: Hotfix
- [ ] Crear HotfixPublishModal
- [ ] Crear HotfixHistory
- [ ] Implementar rollback
- [ ] Changelog automático

### Fase 6: Testing + Deploy
- [ ] Unit tests (95% coverage)
- [ ] Integration tests
- [ ] Security audit
- [ ] Performance testing
- [ ] Deploy a staging
- [ ] Deploy a production

---

**¿Apruebas esta estructura o necesitas cambios?**
