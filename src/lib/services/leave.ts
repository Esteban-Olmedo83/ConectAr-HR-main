/**
 * Servicio de Licencias
 * Gestiona solicitudes de licencia y saldos de vacaciones
 */

import { apiClient } from './api-client';
import {
  Leave,
  LeaveBalance,
  LeaveFilters,
  LeaveCreateInput,
  LeaveUpdateInput,
  LeaveApprovalRequest,
  LeavePolicy,
} from '../types/leave';
import { PaginatedResponse } from '../types/api';

export class LeaveService {
  private static readonly ENDPOINTS = {
    LEAVES: '/leave',
    BALANCE: '/leave/balance',
    POLICIES: '/leave/policies',
  };

  // Solicitudes de licencia
  static async getAll(filters?: LeaveFilters): Promise<PaginatedResponse<Leave>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.status) params.append('status', filters.status);
      if (filters.leaveType) params.append('leaveType', filters.leaveType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters.department) params.append('department', filters.department);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    }

    const endpoint = `${this.ENDPOINTS.LEAVES}?${params.toString()}`;
    return apiClient.get<PaginatedResponse<Leave>>(endpoint);
  }

  static async getById(id: string): Promise<Leave> {
    return apiClient.get<Leave>(`${this.ENDPOINTS.LEAVES}/${id}`);
  }

  static async create(data: LeaveCreateInput): Promise<Leave> {
    return apiClient.post<Leave>(this.ENDPOINTS.LEAVES, data);
  }

  static async update(id: string, data: LeaveUpdateInput): Promise<Leave> {
    return apiClient.put<Leave>(`${this.ENDPOINTS.LEAVES}/${id}`, data);
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.LEAVES}/${id}`);
  }

  static async approve(id: string, approvalRequest: LeaveApprovalRequest): Promise<Leave> {
    return apiClient.post<Leave>(
      `${this.ENDPOINTS.LEAVES}/${id}/approve`,
      approvalRequest
    );
  }

  static async reject(id: string, rejectionReason: string): Promise<Leave> {
    return apiClient.post<Leave>(
      `${this.ENDPOINTS.LEAVES}/${id}/reject`,
      { rejectionReason }
    );
  }

  static async getByEmployee(employeeId: string, filters?: LeaveFilters): Promise<PaginatedResponse<Leave>> {
    const params = new URLSearchParams();
    params.append('employeeId', employeeId);
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.leaveType) params.append('leaveType', filters.leaveType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    }

    const endpoint = `${this.ENDPOINTS.LEAVES}?${params.toString()}`;
    return apiClient.get<PaginatedResponse<Leave>>(endpoint);
  }

  // Saldos de licencia
  static async getBalance(employeeId: string, leaveType?: string): Promise<LeaveBalance[]> {
    const params = new URLSearchParams();
    params.append('employeeId', employeeId);
    if (leaveType) params.append('leaveType', leaveType);

    return apiClient.get<LeaveBalance[]>(
      `${this.ENDPOINTS.BALANCE}?${params.toString()}`
    );
  }

  static async getBalanceByType(employeeId: string, leaveType: string): Promise<LeaveBalance> {
    return apiClient.get<LeaveBalance>(
      `${this.ENDPOINTS.BALANCE}/${employeeId}/${leaveType}`
    );
  }

  static async updateBalance(id: string, data: Partial<LeaveBalance>): Promise<LeaveBalance> {
    return apiClient.put<LeaveBalance>(`${this.ENDPOINTS.BALANCE}/${id}`, data);
  }

  // Políticas de licencia
  static async getPolicies(): Promise<LeavePolicy[]> {
    return apiClient.get<LeavePolicy[]>(this.ENDPOINTS.POLICIES);
  }

  static async getPolicyById(id: string): Promise<LeavePolicy> {
    return apiClient.get<LeavePolicy>(`${this.ENDPOINTS.POLICIES}/${id}`);
  }

  static async createPolicy(data: Omit<LeavePolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeavePolicy> {
    return apiClient.post<LeavePolicy>(this.ENDPOINTS.POLICIES, data);
  }

  static async updatePolicy(
    id: string,
    data: Partial<Omit<LeavePolicy, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>
  ): Promise<LeavePolicy> {
    return apiClient.put<LeavePolicy>(`${this.ENDPOINTS.POLICIES}/${id}`, data);
  }

  static async deletePolicy(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.POLICIES}/${id}`);
  }
}

export const leaveService = LeaveService;
