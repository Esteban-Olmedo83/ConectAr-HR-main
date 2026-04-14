/**
 * Tipos para Licencias
 * Define interfaces para solicitudes de licencia y gestión de saldos
 */

import { LeaveType, LeaveStatus } from './common';

export interface Leave {
  id: string;
  companyId: string;
  employeeId: string;
  leaveType: LeaveType;
  status: LeaveStatus;
  startDate: Date;
  endDate: Date;
  daysRequested: number;
  reason?: string;
  attachmentUrl?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  id: string;
  companyId: string;
  employeeId: string;
  leaveType: LeaveType;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  carryOverDays?: number;
  lastUpdated: Date;
}

export interface LeaveRequest extends Leave {
  employeeName: string;
  employeeEmail: string;
  approverName?: string;
  departmentName?: string;
}

export interface LeaveApprovalRequest {
  leaveId: string;
  status: LeaveStatus;
  rejectionReason?: string;
  comments?: string;
}

export interface LeavePolicy {
  id: string;
  companyId: string;
  leaveType: LeaveType;
  annualEntitlement: number;
  carryOverAllowed: boolean;
  maxCarryOver?: number;
  minDaysNotice?: number;
  requiresApproval: boolean;
  applicableRoles?: string[];
  effectiveFrom: Date;
  effectiveTo?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveFilters {
  employeeId?: string;
  status?: LeaveStatus;
  leaveType?: LeaveType;
  dateFrom?: Date;
  dateTo?: Date;
  department?: string;
  approvalStatus?: LeaveStatus;
  page?: number;
  pageSize?: number;
}

export type LeaveCreateInput = Omit<Leave, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
export type LeaveUpdateInput = Partial<Omit<Leave, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'employeeId'>>;
