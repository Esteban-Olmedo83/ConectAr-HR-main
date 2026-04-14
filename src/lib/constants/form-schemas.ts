/**
 * Esquemas de validación con Zod
 * Define validaciones para formularios en ESPAÑOL
 */

import { z } from 'zod';
import { USER_ROLES, EMPLOYEE_ROLES, EMPLOYEE_STATUSES, LEAVE_TYPES } from '../types/common';

// Autenticación
export const LoginSchema = z.object({
  email: z
    .string()
    .email('Por favor, ingresa un email válido')
    .min(1, 'El email es requerido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .min(1, 'La contraseña es requerida'),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Por favor, ingresa un email válido')
    .min(1, 'El email es requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .min(1, 'El nombre es requerido'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .min(1, 'El apellido es requerido'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const ChangePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Empleado
export const EmployeeFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .min(1, 'El nombre es requerido'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .min(1, 'El apellido es requerido'),
  email: z
    .string()
    .email('Por favor, ingresa un email válido')
    .min(1, 'El email es requerido'),
  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(/^[\d\s\-\+\(\)]+$/, 'El teléfono no es válido'),
  role: z.enum(EMPLOYEE_ROLES as [string, ...string[]]),
  department: z.string().min(1, 'El departamento es requerido'),
  position: z.string().optional(),
  hireDate: z
    .date()
    .min(new Date('1990-01-01'), 'La fecha debe ser posterior a 1990'),
  salary: z
    .number()
    .positive('El salario debe ser mayor a 0')
    .optional(),
  nationalId: z.string().optional(),
  dateOfBirth: z.date().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyContactPhone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'El teléfono no es válido')
    .optional()
    .or(z.literal('')),
});

export const EmployeeUpdateSchema = EmployeeFormSchema.partial();

// Licencia
export const LeaveRequestSchema = z.object({
  leaveType: z.enum(LEAVE_TYPES as [string, ...string[]]),
  startDate: z.date(),
  endDate: z.date(),
  daysRequested: z
    .number()
    .positive('Los días deben ser mayor a 0'),
  reason: z
    .string()
    .max(500, 'La razón no debe exceder 500 caracteres')
    .optional(),
  attachmentUrl: z.string().url('URL no válida').optional().or(z.literal('')),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

// Asistencia
export const AttendanceSchema = z.object({
  employeeId: z.string().min(1, 'El empleado es requerido'),
  date: z.date(),
  status: z.enum(['present', 'absent', 'late', 'half_day', 'on_leave']),
  checkInTime: z.date().optional(),
  checkOutTime: z.date().optional(),
  notes: z.string().max(500, 'Las notas no deben exceder 500 caracteres').optional(),
});

// Nómina
export const PayrollSchema = z.object({
  employeeId: z.string().min(1, 'El empleado es requerido'),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'El período debe ser YYYY-MM'),
  baseSalary: z
    .number()
    .positive('El salario base debe ser mayor a 0'),
  deductions: z
    .array(
      z.object({
        name: z.string().min(1, 'El nombre es requerido'),
        amount: z.number().nonnegative('El monto no puede ser negativo'),
      })
    )
    .optional(),
});

// Documentos
export const DocumentSchema = z.object({
  documentType: z.string().min(1, 'El tipo de documento es requerido'),
  fileName: z.string().min(1, 'El nombre del archivo es requerido'),
  issueDate: z.date().optional(),
  expiryDate: z.date().optional(),
  documentNumber: z.string().optional(),
  notes: z.string().max(500, 'Las notas no deben exceder 500 caracteres').optional(),
}).refine((data) => {
  if (data.issueDate && data.expiryDate) {
    return data.expiryDate > data.issueDate;
  }
  return true;
}, {
  message: 'La fecha de expiración debe ser posterior a la fecha de emisión',
  path: ['expiryDate'],
});

// Tipos exportados para uso
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;
export type EmployeeFormData = z.infer<typeof EmployeeFormSchema>;
export type EmployeeUpdateFormData = z.infer<typeof EmployeeUpdateSchema>;
export type LeaveRequestFormData = z.infer<typeof LeaveRequestSchema>;
export type AttendanceFormData = z.infer<typeof AttendanceSchema>;
export type PayrollFormData = z.infer<typeof PayrollSchema>;
export type DocumentFormData = z.infer<typeof DocumentSchema>;
