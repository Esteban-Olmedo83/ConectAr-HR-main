/**
 * Tipos para Asistencia
 * Define interfaces para registro de asistencia y control de presencia
 */

import { AttendanceStatus, CheckInMethod } from './common';

export interface Attendance {
  id: string;
  companyId: string;
  employeeId: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInMethod?: CheckInMethod;
  checkOutMethod?: CheckInMethod;
  checkInLocation?: string;
  checkOutLocation?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceReport {
  employeeId: string;
  employeeName: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalEarlyDeparture: number;
  totalHalfDay: number;
  totalOnLeave: number;
  attendanceRate: number;
  period: {
    from: Date;
    to: Date;
  };
}

export interface DailyAttendanceSummary {
  companyId: string;
  date: Date;
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  notMarked: number;
}

export interface AttendanceFilters {
  employeeId?: string;
  status?: AttendanceStatus;
  dateFrom?: Date;
  dateTo?: Date;
  department?: string;
  checkInMethod?: CheckInMethod;
  page?: number;
  pageSize?: number;
}

export interface BiometricRecord {
  id: string;
  companyId: string;
  employeeId: string;
  biometricId: string;
  biometricData: string;
  enrolledAt: Date;
  status: 'active' | 'inactive';
  lastUsed?: Date;
}

export type AttendanceCreateInput = Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>;
export type AttendanceUpdateInput = Partial<Omit<Attendance, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'employeeId' | 'date'>>;
