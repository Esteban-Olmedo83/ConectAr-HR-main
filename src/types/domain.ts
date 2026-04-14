/**
 * @fileOverview Tipos del dominio de negocio
 * @description Tipos derivados del esquema Supabase, optimizados para la lógica de negocio
 * @author Database Architect
 * @version 1.0
 */

import { Database } from './database.types';

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Employee = Database['public']['Tables']['employees']['Row'];
export type Department = Database['public']['Tables']['departments']['Row'];
export type Position = Database['public']['Tables']['positions']['Row'];
export type Role = Database['public']['Tables']['roles']['Row'];
export type Permission = Database['public']['Tables']['permissions']['Row'];
export type Attendance = Database['public']['Tables']['attendance']['Row'];
export type Leave = Database['public']['Tables']['leaves']['Row'];
export type LeaveType = Database['public']['Tables']['leave_types']['Row'];
export type LeaveBalance = Database['public']['Tables']['leave_balances']['Row'];
export type Payroll = Database['public']['Tables']['payroll']['Row'];
export type PayrollComponent = Database['public']['Tables']['payroll_components']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type CompanySettings = Database['public']['Tables']['company_settings']['Row'];
export type WorkShift = Database['public']['Tables']['work_shifts']['Row'];
export type EmployeeShift = Database['public']['Tables']['employee_shifts']['Row'];
export type PerformanceReview = Database['public']['Tables']['performance_reviews']['Row'];
export type EmployeeDocument = Database['public']['Tables']['employee_documents']['Row'];
export type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row'];
export type Skill = Database['public']['Tables']['skills']['Row'];
export type EmployeeSkill = Database['public']['Tables']['employee_skills']['Row'];
export type TrainingProgram = Database['public']['Tables']['training_programs']['Row'];
export type EmployeeTraining = Database['public']['Tables']['employee_training']['Row'];
export type ApiToken = Database['public']['Tables']['api_tokens']['Row'];
export type Integration = Database['public']['Tables']['integrations']['Row'];

// ============================================================================
// INSERT/UPDATE TYPES
// ============================================================================

export type InsertTenant = Database['public']['Tables']['tenants']['Insert'];
export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type InsertEmployee = Database['public']['Tables']['employees']['Insert'];
export type InsertDepartment = Database['public']['Tables']['departments']['Insert'];
export type InsertPosition = Database['public']['Tables']['positions']['Insert'];
export type InsertAttendance = Database['public']['Tables']['attendance']['Insert'];
export type InsertLeave = Database['public']['Tables']['leaves']['Insert'];
export type InsertPayroll = Database['public']['Tables']['payroll']['Insert'];
export type InsertDocument = Database['public']['Tables']['documents']['Insert'];

// ============================================================================
// ENUMS DE NEGOCIO
// ============================================================================

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACTOR = 'contractor',
  INTERN = 'intern',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EARLY_OUT = 'early_out',
  ON_LEAVE = 'on_leave',
  HALF_DAY = 'half_day',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export enum PayrollStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELED = 'canceled',
}

export enum RoleType {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  CUSTOM = 'custom',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum CheckInMethod {
  MANUAL = 'manual',
  BIOMETRIC = 'biometric',
  QR = 'qr',
  GEO = 'geo',
}

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

// ============================================================================
// TIPOS COMPUESTOS DE NEGOCIO
// ============================================================================

/**
 * Información de empleado con relaciones cargadas
 */
export interface EmployeeWithRelations extends Employee {
  department?: Department;
  position?: Position;
  manager?: Employee;
  user?: User;
  skills?: EmployeeSkill[];
  currentShift?: EmployeeShift;
}

/**
 * Información de nómina con componentes
 */
export interface PayrollWithComponents extends Payroll {
  components?: PayrollComponent[];
  employee?: Employee;
  approver?: User;
}

/**
 * Información de solicitud de licencia con detalles
 */
export interface LeaveWithDetails extends Leave {
  employee?: Employee;
  leaveType?: LeaveType;
  approver?: User;
  rejecter?: User;
}

/**
 * Información de usuario con roles y permisos
 */
export interface UserWithRoles extends User {
  roles?: Role[];
  permissions?: Permission[];
}

/**
 * Información de departamento con empleados
 */
export interface DepartmentWithEmployees extends Department {
  employees?: Employee[];
  manager?: Employee;
  subDepartments?: Department[];
}

/**
 * Información de asistencia con contexto
 */
export interface AttendanceWithContext extends Attendance {
  employee?: Employee;
  shift?: WorkShift;
}

/**
 * Información consolidada de usuario actual (JWT)
 */
export interface CurrentUser extends User {
  tenant?: Tenant;
  roles?: Role[];
  permissions?: Permission[];
  employee?: Employee;
}

// ============================================================================
// TIPOS PARA OPERACIONES
// ============================================================================

/**
 * Formato de respuesta de lista paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Formato de respuesta de operación
 */
export interface OperationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Campos para filtrado de listas
 */
export interface ListFilters {
  page?: number;
  perPage?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

/**
 * Campos de auditoría automática
 */
export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
}

// ============================================================================
// TIPOS PARA CÁLCULOS Y REPORTES
// ============================================================================

/**
 * Resumen de asistencia de un empleado
 */
export interface AttendanceSummary {
  employeeId: string;
  month: number;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  totalWorkingHours: number;
  averageWorkingHours: number;
}

/**
 * Resumen de licencias de un empleado
 */
export interface LeaveSummary {
  employeeId: string;
  year: number;
  totalAllocated: number;
  totalUsed: number;
  totalPending: number;
  totalBalance: number;
  byLeaveType: Record<string, LeaveTypeBalance>;
}

export interface LeaveTypeBalance {
  leaveTypeName: string;
  allocated: number;
  used: number;
  pending: number;
  balance: number;
}

/**
 * Resumen de nómina
 */
export interface PayrollSummary {
  period: string;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalDeductions: number;
  employeeCount: number;
  status: PayrollStatus;
}

/**
 * Estadísticas de salud del sistema
 */
export interface SystemHealth {
  totalEmployees: number;
  activeEmployees: number;
  departmentCount: number;
  averageSalary: number;
  currentMonthPayrollStatus: PayrollStatus;
  upcomingLeaves: number;
  pendingApprovals: number;
}

// ============================================================================
// TIPOS DE VALIDACIÓN
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// TIPOS PARA CACHÉ Y SINCRONIZACIÓN
// ============================================================================

export interface SyncMetadata {
  lastSyncedAt: string;
  syncHash: string;
  version: number;
}

export interface CachedResource<T> {
  data: T;
  metadata: SyncMetadata;
  expiresAt: string;
}

// ============================================================================
// TIPOS PARA NOTIFICACIONES
// ============================================================================

export enum NotificationType {
  LEAVE_REQUEST = 'leave_request',
  LEAVE_APPROVED = 'leave_approved',
  LEAVE_REJECTED = 'leave_rejected',
  PAYROLL_GENERATED = 'payroll_generated',
  ANNOUNCEMENT = 'announcement',
  TASK = 'task',
  SYSTEM = 'system',
  TRAINING_ASSIGNED = 'training_assigned',
  TRAINING_COMPLETED = 'training_completed',
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  relatedResourceType?: string;
  relatedResourceId?: string;
  actionUrl?: string;
}

// ============================================================================
// TIPOS PARA REPORTERÍA
// ============================================================================

export interface ReportParams {
  startDate: string;
  endDate: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts?: boolean;
  groupBy?: 'department' | 'employee' | 'month';
}

export interface AttendanceReport {
  period: string;
  generatedAt: string;
  totalRecords: number;
  data: AttendanceSummary[];
  statistics: {
    averageAttendance: number;
    averageLateness: number;
    totalWorkingHours: number;
  };
}

export interface PayrollReport {
  period: string;
  generatedAt: string;
  summary: PayrollSummary;
  byDepartment: Record<string, PayrollSummary>;
  data: PayrollWithComponents[];
}

// ============================================================================
// CONSTANTES DE NEGOCIO
// ============================================================================

export const STANDARD_WORKING_HOURS_PER_DAY = 8;
export const STANDARD_WORKING_DAYS_PER_WEEK = 5;
export const STANDARD_WORKING_DAYS_PER_MONTH = 22;
export const STANDARD_ANNUAL_LEAVE_DAYS = 20;

export const NOTIFICATION_RETENTION_DAYS = 30;
export const AUDIT_LOG_RETENTION_MONTHS = 24;

// ============================================================================
// HELPERS Y UTILIDADES
// ============================================================================

/**
 * Obtener el nombre completo de un empleado
 */
export function getEmployeeFullName(employee: Employee): string {
  return `${employee.first_name} ${employee.last_name}`.trim();
}

/**
 * Obtener el nombre completo de un usuario
 */
export function getUserFullName(user: User): string {
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
}

/**
 * Convertir estado de licencia a label amigable
 */
export function getLeaveStatusLabel(status: LeaveStatus): string {
  const labels: Record<LeaveStatus, string> = {
    [LeaveStatus.PENDING]: 'Pendiente',
    [LeaveStatus.APPROVED]: 'Aprobada',
    [LeaveStatus.REJECTED]: 'Rechazada',
    [LeaveStatus.CANCELED]: 'Cancelada',
  };
  return labels[status] || status;
}

/**
 * Convertir estado de nómina a label amigable
 */
export function getPayrollStatusLabel(status: PayrollStatus): string {
  const labels: Record<PayrollStatus, string> = {
    [PayrollStatus.DRAFT]: 'Borrador',
    [PayrollStatus.PENDING]: 'Pendiente',
    [PayrollStatus.APPROVED]: 'Aprobada',
    [PayrollStatus.PAID]: 'Pagada',
    [PayrollStatus.CANCELED]: 'Cancelada',
  };
  return labels[status] || status;
}

/**
 * Convertir estado de empleado a label amigable
 */
export function getEmployeeStatusLabel(status: EmployeeStatus): string {
  const labels: Record<EmployeeStatus, string> = {
    [EmployeeStatus.ACTIVE]: 'Activo',
    [EmployeeStatus.INACTIVE]: 'Inactivo',
    [EmployeeStatus.ON_LEAVE]: 'De licencia',
    [EmployeeStatus.SUSPENDED]: 'Suspendido',
    [EmployeeStatus.TERMINATED]: 'Despedido',
  };
  return labels[status] || status;
}

/**
 * Convertir estado de asistencia a label amigable
 */
export function getAttendanceStatusLabel(status: AttendanceStatus): string {
  const labels: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENT]: 'Presente',
    [AttendanceStatus.ABSENT]: 'Ausente',
    [AttendanceStatus.LATE]: 'Retrasado',
    [AttendanceStatus.EARLY_OUT]: 'Salida anticipada',
    [AttendanceStatus.ON_LEAVE]: 'De licencia',
    [AttendanceStatus.HALF_DAY]: 'Medio día',
  };
  return labels[status] || status;
}
