/**
 * Servicio de Empleados
 * Gestiona CRUD y operaciones de empleados
 */

import { apiClient } from './api-client';
import {
  Employee,
  EmployeeFilters,
  EmployeeCreateInput,
  EmployeeUpdateInput,
  EmployeeDepartment,
  EmployeeWorkSchedule,
} from '../types/employee';
import { PaginatedResponse } from '../types/api';

export class EmployeeService {
  private static readonly ENDPOINTS = {
    EMPLOYEES: '/employees',
    DEPARTMENTS: '/employees/departments',
    SCHEDULES: '/employees/schedules',
  };

  // Empleados
  static async getAll(filters?: EmployeeFilters): Promise<PaginatedResponse<Employee>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      if (filters.department) params.append('department', filters.department);
      if (filters.manager) params.append('manager', filters.manager);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    }

    const endpoint = `${this.ENDPOINTS.EMPLOYEES}?${params.toString()}`;
    return apiClient.get<PaginatedResponse<Employee>>(endpoint);
  }

  static async getById(id: string): Promise<Employee> {
    return apiClient.get<Employee>(`${this.ENDPOINTS.EMPLOYEES}/${id}`);
  }

  static async create(data: EmployeeCreateInput): Promise<Employee> {
    return apiClient.post<Employee>(this.ENDPOINTS.EMPLOYEES, data);
  }

  static async update(id: string, data: EmployeeUpdateInput): Promise<Employee> {
    return apiClient.put<Employee>(`${this.ENDPOINTS.EMPLOYEES}/${id}`, data);
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.EMPLOYEES}/${id}`);
  }

  static async search(query: string, limit: number = 10): Promise<Employee[]> {
    return apiClient.get<Employee[]>(
      `${this.ENDPOINTS.EMPLOYEES}/search`,
      { params: { q: query, limit } }
    );
  }

  static async getByDepartment(departmentId: string): Promise<Employee[]> {
    return apiClient.get<Employee[]>(
      `${this.ENDPOINTS.EMPLOYEES}`,
      { params: { department: departmentId } }
    );
  }

  static async getByManager(managerId: string): Promise<Employee[]> {
    return apiClient.get<Employee[]>(
      `${this.ENDPOINTS.EMPLOYEES}`,
      { params: { manager: managerId } }
    );
  }

  // Departamentos
  static async getDepartments(): Promise<EmployeeDepartment[]> {
    return apiClient.get<EmployeeDepartment[]>(this.ENDPOINTS.DEPARTMENTS);
  }

  static async getDepartmentById(id: string): Promise<EmployeeDepartment> {
    return apiClient.get<EmployeeDepartment>(`${this.ENDPOINTS.DEPARTMENTS}/${id}`);
  }

  static async createDepartment(data: Omit<EmployeeDepartment, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeDepartment> {
    return apiClient.post<EmployeeDepartment>(this.ENDPOINTS.DEPARTMENTS, data);
  }

  static async updateDepartment(
    id: string,
    data: Partial<Omit<EmployeeDepartment, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>
  ): Promise<EmployeeDepartment> {
    return apiClient.put<EmployeeDepartment>(`${this.ENDPOINTS.DEPARTMENTS}/${id}`, data);
  }

  static async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.DEPARTMENTS}/${id}`);
  }

  // Horarios de trabajo
  static async getWorkSchedules(): Promise<EmployeeWorkSchedule[]> {
    return apiClient.get<EmployeeWorkSchedule[]>(this.ENDPOINTS.SCHEDULES);
  }

  static async getWorkScheduleById(id: string): Promise<EmployeeWorkSchedule> {
    return apiClient.get<EmployeeWorkSchedule>(`${this.ENDPOINTS.SCHEDULES}/${id}`);
  }

  static async createWorkSchedule(
    data: Omit<EmployeeWorkSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EmployeeWorkSchedule> {
    return apiClient.post<EmployeeWorkSchedule>(this.ENDPOINTS.SCHEDULES, data);
  }

  static async updateWorkSchedule(
    id: string,
    data: Partial<Omit<EmployeeWorkSchedule, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>
  ): Promise<EmployeeWorkSchedule> {
    return apiClient.put<EmployeeWorkSchedule>(`${this.ENDPOINTS.SCHEDULES}/${id}`, data);
  }

  static async deleteWorkSchedule(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.SCHEDULES}/${id}`);
  }
}

export const employeeService = EmployeeService;
