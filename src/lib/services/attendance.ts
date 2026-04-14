/**
 * Servicio de Asistencia
 * Gestiona registros de asistencia y control de presencia
 */

import { apiClient } from './api-client';
import {
  Attendance,
  AttendanceFilters,
  AttendanceCreateInput,
  AttendanceUpdateInput,
  AttendanceReport,
  DailyAttendanceSummary,
} from '../types/attendance';
import { PaginatedResponse } from '../types/api';

export class AttendanceService {
  private static readonly ENDPOINTS = {
    ATTENDANCE: '/attendance',
    REPORTS: '/attendance/reports',
    DAILY: '/attendance/daily',
  };

  static async getAll(filters?: AttendanceFilters): Promise<PaginatedResponse<Attendance>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters.department) params.append('department', filters.department);
      if (filters.checkInMethod) params.append('checkInMethod', filters.checkInMethod);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    }

    const endpoint = `${this.ENDPOINTS.ATTENDANCE}?${params.toString()}`;
    return apiClient.get<PaginatedResponse<Attendance>>(endpoint);
  }

  static async getById(id: string): Promise<Attendance> {
    return apiClient.get<Attendance>(`${this.ENDPOINTS.ATTENDANCE}/${id}`);
  }

  static async create(data: AttendanceCreateInput): Promise<Attendance> {
    return apiClient.post<Attendance>(this.ENDPOINTS.ATTENDANCE, data);
  }

  static async update(id: string, data: AttendanceUpdateInput): Promise<Attendance> {
    return apiClient.put<Attendance>(`${this.ENDPOINTS.ATTENDANCE}/${id}`, data);
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.ATTENDANCE}/${id}`);
  }

  static async checkIn(data: {
    employeeId: string;
    checkInTime: Date;
    method: string;
    location?: string;
  }): Promise<Attendance> {
    return apiClient.post<Attendance>(`${this.ENDPOINTS.ATTENDANCE}/check-in`, data);
  }

  static async checkOut(data: {
    employeeId: string;
    checkOutTime: Date;
    method: string;
    location?: string;
  }): Promise<Attendance> {
    return apiClient.post<Attendance>(`${this.ENDPOINTS.ATTENDANCE}/check-out`, data);
  }

  static async getReport(
    employeeId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<AttendanceReport> {
    return apiClient.get<AttendanceReport>(`${this.ENDPOINTS.REPORTS}/${employeeId}`, {
      params: {
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
      },
    });
  }

  static async getDailyAttendanceSummary(date: Date): Promise<DailyAttendanceSummary> {
    return apiClient.get<DailyAttendanceSummary>(`${this.ENDPOINTS.DAILY}`, {
      params: { date: date.toISOString().split('T')[0] },
    });
  }

  static async getEmployeeAttendance(employeeId: string, filters?: AttendanceFilters): Promise<PaginatedResponse<Attendance>> {
    const params = new URLSearchParams();
    params.append('employeeId', employeeId);
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    }

    const endpoint = `${this.ENDPOINTS.ATTENDANCE}?${params.toString()}`;
    return apiClient.get<PaginatedResponse<Attendance>>(endpoint);
  }

  static async approveBulk(
    attendanceIds: string[],
    approvedBy: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      `${this.ENDPOINTS.ATTENDANCE}/approve-bulk`,
      { attendanceIds, approvedBy }
    );
  }
}

export const attendanceService = AttendanceService;
