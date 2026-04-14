/**
 * Exportaciones principales de la librería
 */

// Tipos
export * from './types/api';
export * from './types/common';
export * from './types/user';
export * from './types/employee';
export * from './types/attendance';
export * from './types/leave';
export * from './types/payroll';
export * from './types/document';

// Servicios
export { apiClient, APIClient } from './services/api-client';
export { authService } from './services/auth';
export { employeeService } from './services/employees';
export { attendanceService } from './services/attendance';
export { leaveService } from './services/leave';
export { payrollService } from './services/payroll';
export { documentService } from './services/documents';
export { permissionService } from './services/permissions';
export { notificationService } from './services/notifications';

// Utilidades
export * from './utils/formatting';
export * from './utils/validation';
export * from './utils/date-utils';
export * from './utils/error-handler';

// Seguridad y Sesión
export * from './auth-guard';
export { sessionManager } from './session';
export { auditLogger } from './audit-log';

// Esquemas
export * from './constants/form-schemas';
