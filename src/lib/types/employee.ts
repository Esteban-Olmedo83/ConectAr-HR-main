/**
 * Tipos para Empleado
 * Define interfaces para gestión de empleados
 */

import { EmployeeStatus, EmployeeRole } from './common';

export interface Employee {
  id: string;
  companyId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  personalPhone?: string;
  dateOfBirth?: Date;
  nationalId?: string;
  status: EmployeeStatus;
  role: EmployeeRole;
  department?: string;
  manager?: string;
  position?: string;
  hireDate: Date;
  endDate?: Date;
  salary?: number;
  salaryType?: 'monthly' | 'hourly' | 'daily';
  bankAccount?: string;
  bankName?: string;
  accountHolder?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  workScheduleId?: string;
  avatar?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeFilters {
  status?: EmployeeStatus;
  role?: EmployeeRole;
  department?: string;
  manager?: string;
  hireDate?: {
    from?: Date;
    to?: Date;
  };
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface EmployeeDepartment {
  id: string;
  companyId: string;
  name: string;
  code: string;
  manager?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeWorkSchedule {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  workDays: number[];
  startTime: string;
  endTime: string;
  breakDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeEducation {
  id: string;
  employeeId: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
}

export interface EmployeeExperience {
  id: string;
  employeeId: string;
  company: string;
  position: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  currentlyWorking: boolean;
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  endorsements?: number;
}

export type EmployeeCreateInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
export type EmployeeUpdateInput = Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'userId'>>;
