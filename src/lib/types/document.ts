/**
 * Tipos para Documentos
 * Define interfaces para gestión de documentos de empleados
 */

import { DocumentType, DocumentStatus } from './common';

export interface Document {
  id: string;
  companyId: string;
  employeeId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  issueDate?: Date;
  expiryDate?: Date;
  documentNumber?: string;
  issuingCountry?: string;
  issuingAuthority?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentTemplate {
  id: string;
  companyId: string;
  name: string;
  documentType: DocumentType;
  description?: string;
  requiredFields: string[];
  templateUrl?: string;
  isRequired: boolean;
  applicableRoles?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentRequest {
  id: string;
  companyId: string;
  employeeId: string;
  documentType: DocumentType;
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  requestedAt: Date;
  submittedAt?: Date;
  dueDate?: Date;
  rejectionReason?: string;
  notes?: string;
}

export interface DocumentAudit {
  id: string;
  documentId: string;
  action: 'uploaded' | 'verified' | 'rejected' | 'viewed' | 'downloaded' | 'deleted';
  userId: string;
  userName: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface DocumentFilters {
  employeeId?: string;
  documentType?: DocumentType;
  status?: DocumentStatus;
  expiryWarning?: boolean;
  expiredOnly?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}

export type DocumentCreateInput = Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'uploadedAt'>;
export type DocumentUpdateInput = Partial<Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'employeeId' | 'fileName' | 'fileUrl'>>;
