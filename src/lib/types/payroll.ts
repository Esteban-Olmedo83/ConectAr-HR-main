/**
 * Tipos para Nómina
 * Define interfaces para gestión de nómina y salarios
 */

import { PayslipStatus } from './common';

export interface Payroll {
  id: string;
  companyId: string;
  employeeId: string;
  period: string;
  startDate: Date;
  endDate: Date;
  baseSalary: number;
  grossSalary: number;
  netSalary: number;
  status: PayslipStatus;
  paymentDate?: Date;
  paymentMethod?: 'bank_transfer' | 'cash' | 'check';
  referenceNumber?: string;
  generatedAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayslipComponent {
  id: string;
  payrollId: string;
  name: string;
  type: 'earning' | 'deduction';
  amount: number;
  description?: string;
  formula?: string;
  order: number;
}

export interface Payslip extends Payroll {
  components: PayslipComponent[];
  employeeName: string;
  employeeEmail: string;
  departmentName?: string;
}

export interface SalaryComponent {
  id: string;
  companyId: string;
  name: string;
  type: 'earning' | 'deduction';
  isDefault: boolean;
  formula?: string;
  percentage?: number;
  order: number;
  appliedRoles?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryStructure {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  baseSalary: number;
  components: SalaryComponent[];
  applicableRoles?: string[];
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollFilters {
  employeeId?: string;
  status?: PayslipStatus;
  period?: string;
  dateFrom?: Date;
  dateTo?: Date;
  department?: string;
  page?: number;
  pageSize?: number;
}

export interface PayrollSummary {
  companyId: string;
  period: string;
  totalPayroll: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalDeductions: number;
  employeesCount: number;
  averageSalary: number;
  paymentStatus: {
    processed: number;
    pending: number;
    failed: number;
  };
}

export interface TaxConfiguration {
  id: string;
  companyId: string;
  year: number;
  taxRate: number;
  minimumTaxableIncome?: number;
  socialSecurityRate?: number;
  healthInsuranceRate?: number;
  otherDeductions?: Array<{
    name: string;
    rate: number;
  }>;
}

export type PayrollCreateInput = Omit<Payroll, 'id' | 'createdAt' | 'updatedAt' | 'generatedAt'>;
export type PayrollUpdateInput = Partial<Omit<Payroll, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'employeeId' | 'period'>>;
