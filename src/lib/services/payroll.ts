/**
 * Servicio de Nómina
 * Gestiona nóminas, componentes salariales y recibos de pago
 */

import { apiClient } from './api-client';
import {
  Payroll,
  Payslip,
  PayslipComponent,
  PayrollFilters,
  PayrollCreateInput,
  PayrollUpdateInput,
  SalaryComponent,
  SalaryStructure,
  PayrollSummary,
  TaxConfiguration,
} from '../types/payroll';
import { PaginatedResponse } from '../types/api';

export class PayrollService {
  private static readonly ENDPOINTS = {
    PAYROLL: '/payroll',
    COMPONENTS: '/payroll/components',
    STRUCTURES: '/payroll/structures',
    PAYSLIPS: '/payroll/payslips',
    SUMMARY: '/payroll/summary',
    TAX: '/payroll/tax-config',
  };

  // Nómina
  static async getAll(filters?: PayrollFilters): Promise<PaginatedResponse<Payroll>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.status) params.append('status', filters.status);
      if (filters.period) params.append('period', filters.period);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters.department) params.append('department', filters.department);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    }

    const endpoint = `${this.ENDPOINTS.PAYROLL}?${params.toString()}`;
    return apiClient.get<PaginatedResponse<Payroll>>(endpoint);
  }

  static async getById(id: string): Promise<Payroll> {
    return apiClient.get<Payroll>(`${this.ENDPOINTS.PAYROLL}/${id}`);
  }

  static async create(data: PayrollCreateInput): Promise<Payroll> {
    return apiClient.post<Payroll>(this.ENDPOINTS.PAYROLL, data);
  }

  static async update(id: string, data: PayrollUpdateInput): Promise<Payroll> {
    return apiClient.put<Payroll>(`${this.ENDPOINTS.PAYROLL}/${id}`, data);
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.PAYROLL}/${id}`);
  }

  static async generatePayroll(period: string): Promise<{ success: boolean; count: number }> {
    return apiClient.post<{ success: boolean; count: number }>(
      `${this.ENDPOINTS.PAYROLL}/generate`,
      { period }
    );
  }

  static async processPayment(id: string, paymentData: unknown): Promise<Payroll> {
    return apiClient.post<Payroll>(
      `${this.ENDPOINTS.PAYROLL}/${id}/process-payment`,
      paymentData
    );
  }

  // Recibos de pago
  static async getPayslip(id: string): Promise<Payslip> {
    return apiClient.get<Payslip>(`${this.ENDPOINTS.PAYSLIPS}/${id}`);
  }

  static async getEmployeePayslips(
    employeeId: string,
    filters?: PayrollFilters
  ): Promise<PaginatedResponse<Payslip>> {
    const params = new URLSearchParams();
    params.append('employeeId', employeeId);
    
    if (filters) {
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    }

    const endpoint = `${this.ENDPOINTS.PAYSLIPS}?${params.toString()}`;
    return apiClient.get<PaginatedResponse<Payslip>>(endpoint);
  }

  static async sendPayslip(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      `${this.ENDPOINTS.PAYSLIPS}/${id}/send`
    );
  }

  static async downloadPayslip(id: string): Promise<Blob> {
    return apiClient.get<Blob>(`${this.ENDPOINTS.PAYSLIPS}/${id}/download`, {
      headers: { Accept: 'application/pdf' },
    });
  }

  // Componentes salariales
  static async getComponents(): Promise<SalaryComponent[]> {
    return apiClient.get<SalaryComponent[]>(this.ENDPOINTS.COMPONENTS);
  }

  static async getComponentById(id: string): Promise<SalaryComponent> {
    return apiClient.get<SalaryComponent>(`${this.ENDPOINTS.COMPONENTS}/${id}`);
  }

  static async createComponent(data: Omit<SalaryComponent, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalaryComponent> {
    return apiClient.post<SalaryComponent>(this.ENDPOINTS.COMPONENTS, data);
  }

  static async updateComponent(
    id: string,
    data: Partial<Omit<SalaryComponent, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>
  ): Promise<SalaryComponent> {
    return apiClient.put<SalaryComponent>(`${this.ENDPOINTS.COMPONENTS}/${id}`, data);
  }

  static async deleteComponent(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.COMPONENTS}/${id}`);
  }

  // Estructuras salariales
  static async getStructures(): Promise<SalaryStructure[]> {
    return apiClient.get<SalaryStructure[]>(this.ENDPOINTS.STRUCTURES);
  }

  static async getStructureById(id: string): Promise<SalaryStructure> {
    return apiClient.get<SalaryStructure>(`${this.ENDPOINTS.STRUCTURES}/${id}`);
  }

  static async createStructure(data: Omit<SalaryStructure, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalaryStructure> {
    return apiClient.post<SalaryStructure>(this.ENDPOINTS.STRUCTURES, data);
  }

  static async updateStructure(
    id: string,
    data: Partial<Omit<SalaryStructure, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>
  ): Promise<SalaryStructure> {
    return apiClient.put<SalaryStructure>(`${this.ENDPOINTS.STRUCTURES}/${id}`, data);
  }

  static async deleteStructure(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.STRUCTURES}/${id}`);
  }

  // Resumen de nómina
  static async getSummary(period: string): Promise<PayrollSummary> {
    return apiClient.get<PayrollSummary>(
      `${this.ENDPOINTS.SUMMARY}?period=${period}`
    );
  }

  // Configuración de impuestos
  static async getTaxConfiguration(year: number): Promise<TaxConfiguration> {
    return apiClient.get<TaxConfiguration>(
      `${this.ENDPOINTS.TAX}?year=${year}`
    );
  }

  static async updateTaxConfiguration(id: string, data: Partial<TaxConfiguration>): Promise<TaxConfiguration> {
    return apiClient.put<TaxConfiguration>(`${this.ENDPOINTS.TAX}/${id}`, data);
  }
}

export const payrollService = PayrollService;
