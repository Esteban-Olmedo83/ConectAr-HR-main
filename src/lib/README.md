# Librería de Servicios y Tipos - ConectAr HR

Esta carpeta contiene toda la lógica de negocio, servicios y tipos TypeScript para la aplicación ConectAr HR.

## Estructura

### `/types` - Definiciones TypeScript

Define interfaces y tipos para toda la aplicación:

- **api.ts** - Tipos para respuestas de API, errores y paginación
- **common.ts** - Enumeraciones y tipos compartidos (roles, estados, etc)
- **user.ts** - Tipos de usuario, sesión y autenticación
- **employee.ts** - Tipos para gestión de empleados
- **attendance.ts** - Tipos para asistencia y control de presencia
- **leave.ts** - Tipos para licencias y vacaciones
- **payroll.ts** - Tipos para nómina y salarios
- **document.ts** - Tipos para documentos de empleados

### `/services` - Capa de Servicios

Servicios que manejan toda la comunicación con el backend:

- **api-client.ts** - Cliente HTTP base con métodos GET, POST, PUT, DELETE
- **auth.ts** - Autenticación: login, logout, sesión
- **employees.ts** - Gestión de empleados, departamentos, horarios
- **attendance.ts** - Registros de asistencia, check-in/out
- **leave.ts** - Solicitudes de licencia, balances, políticas
- **payroll.ts** - Nóminas, recibos, componentes salariales
- **documents.ts** - Documentos de empleados, plantillas, solicitudes
- **permissions.ts** - Control de permisos y roles
- **notifications.ts** - Notificaciones y alertas del sistema

### `/utils` - Funciones Utilitarias

Funciones helper para operaciones comunes:

- **formatting.ts** - Formatear fechas, moneda, números, teléfonos
- **validation.ts** - Validaciones de email, teléfono, contraseña, etc
- **date-utils.ts** - Utilidades para trabajar con fechas
- **error-handler.ts** - Clases personalizadas de errores y manejo

### `/constants` - Constantes

- **form-schemas.ts** - Esquemas de validación Zod para formularios
- **app-constants.ts** - Constantes globales (rutas, timeouts, permisos)

### `/context` - Contextos React

- **auth-context.tsx** - Contexto de autenticación global

### Archivos Principales

- **auth-guard.ts** - Funciones para validar acceso y permisos
- **session.ts** - Gestión de sesiones en el cliente
- **audit-log.ts** - Registro de auditoría de acciones
- **index.ts** - Exportaciones centralizadas
- **supabase.ts** - Cliente de Supabase (si existe)

## Uso

### Autenticación

```typescript
import { authService } from '@/lib';

// Login
await authService.login({ email, password });

// Logout
await authService.logout();

// Obtener sesión actual
const session = authService.getSession();
```

### Servicios de API

```typescript
import { employeeService } from '@/lib';

// Obtener empleados
const employees = await employeeService.getAll({ status: 'active' });

// Crear empleado
const employee = await employeeService.create(data);

// Actualizar
await employeeService.update(id, data);

// Eliminar
await employeeService.delete(id);
```

### Validación con Zod

```typescript
import { LoginSchema, EmployeeFormSchema } from '@/lib';

// Validar datos
const result = LoginSchema.safeParse(formData);
if (!result.success) {
  console.log(result.error.errors);
}
```

### Hooks Personalizados

```typescript
import { useAuth, usePermission, useFetch } from '@/hooks';

// Hook de autenticación
const { user, login, logout } = useAuth();

// Hook de permisos
const { can } = usePermission();
const canDelete = await can.delete('employees');

// Hook para peticiones
const { data, loading, error, refetch } = useFetch('/api/employees');
```

### Utilidades

```typescript
import { formatCurrency, isValidEmail, formatDate } from '@/lib';

// Formatear
formatCurrency(1000); // $1,000.00
formatDate(new Date()); // 01/01/2024

// Validar
isValidEmail('user@example.com'); // true
```

### Control de Acceso

```typescript
import { hasRole, hasPermission, canAccess } from '@/lib';

// Verificar rol
if (hasRole('admin')) {
  // Solo para admins
}

// Verificar permiso
if (hasPermission('employees', 'delete')) {
  // Puede eliminar empleados
}

// Verificar acceso general
if (canAccess('admin', 'employees:delete')) {
  // Tiene acceso
}
```

### Registro de Auditoría

```typescript
import { auditLogger } from '@/lib';

// Registrar acción
await auditLogger.logCreate(userId, 'employee', employeeId, data);
await auditLogger.logUpdate(userId, 'employee', employeeId, changes);
await auditLogger.logDelete(userId, 'employee', employeeId);
```

## Características

✅ **TypeScript Strict** - Tipado completo sin `any`
✅ **Manejo de Errores** - Clases de error personalizadas
✅ **Validación** - Esquemas Zod en español
✅ **Seguridad** - Guards, permisos y auditoría
✅ **Performance** - Cacheo y optimizaciones
✅ **Documentación** - Comentarios en cada archivo
✅ **Production-Ready** - Código listo para producción

## Próximas Adiciones

- [ ] Integración con Supabase (supabase.ts)
- [ ] Cache client-side
- [ ] Rate limiting
- [ ] Retry logic
- [ ] Offline support
- [ ] WebSocket en tiempo real
- [ ] Analytics tracking
