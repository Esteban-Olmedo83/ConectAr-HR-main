/**
 * Tipos comunes y enumeraciones
 * Define enumeraciones y constantes compartidas en toda la aplicación
 */

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  OWNER = 'owner',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
}

export enum EmployeeRole {
  MANAGER = 'manager',
  TEAM_LEAD = 'team_lead',
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  HR = 'hr',
  FINANCE = 'finance',
  OPERATIONS = 'operations',
  SALES = 'sales',
  OTHER = 'other',
}

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  UNPAID = 'unpaid',
  OTHER = 'other',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EARLY_DEPARTURE = 'early_departure',
  HALF_DAY = 'half_day',
  ON_LEAVE = 'on_leave',
}

export enum CheckInMethod {
  MOBILE_APP = 'mobile_app',
  WEB = 'web',
  BIOMETRIC = 'biometric',
  NFC = 'nfc',
  MANUAL = 'manual',
}

export enum DocumentType {
  ID = 'id',
  PASSPORT = 'passport',
  VISA = 'visa',
  CONTRACT = 'contract',
  CERTIFICATE = 'certificate',
  LICENSE = 'license',
  PAYSLIP = 'payslip',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  REJECTED = 'rejected',
}

export enum PayslipStatus {
  DRAFT = 'draft',
  GENERATED = 'generated',
  SENT = 'sent',
  VIEWED = 'viewed',
  DISPUTED = 'disputed',
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum AuditActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PERMISSION_CHANGE = 'permission_change',
}

export const USER_ROLES = Object.values(UserRole);
export const EMPLOYEE_STATUSES = Object.values(EmployeeStatus);
export const EMPLOYEE_ROLES = Object.values(EmployeeRole);
export const LEAVE_TYPES = Object.values(LeaveType);
export const LEAVE_STATUSES = Object.values(LeaveStatus);
export const ATTENDANCE_STATUSES = Object.values(AttendanceStatus);
export const CHECK_IN_METHODS = Object.values(CheckInMethod);
export const DOCUMENT_TYPES = Object.values(DocumentType);
export const DOCUMENT_STATUSES = Object.values(DocumentStatus);
export const PAYSLIP_STATUSES = Object.values(PayslipStatus);
