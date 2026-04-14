/**
 * Servicio de Documentos
 * Gestiona documentos de empleados y validación
 */

import { apiClient } from './api-client';
import {
  Document,
  DocumentFilters,
  DocumentCreateInput,
  DocumentUpdateInput,
  DocumentTemplate,
  DocumentRequest,
} from '../types/document';
import { PaginatedResponse } from '../types/api';

export class DocumentService {
  private static readonly ENDPOINTS = {
    DOCUMENTS: '/documents',
    TEMPLATES: '/documents/templates',
    REQUESTS: '/documents/requests',
  };

  // Documentos
  static async getAll(filters?: DocumentFilters): Promise<PaginatedResponse<Document>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.documentType) params.append('documentType', filters.documentType);
      if (filters.status) params.append('status', filters.status);
      if (filters.expiryWarning) params.append('expiryWarning', String(filters.expiryWarning));
      if (filters.expiredOnly) params.append('expiredOnly', String(filters.expiredOnly));
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    }

    const endpoint = `${this.ENDPOINTS.DOCUMENTS}?${params.toString()}`;
    return apiClient.get<PaginatedResponse<Document>>(endpoint);
  }

  static async getById(id: string): Promise<Document> {
    return apiClient.get<Document>(`${this.ENDPOINTS.DOCUMENTS}/${id}`);
  }

  static async create(data: DocumentCreateInput, file?: File): Promise<Document> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob);
      }
    });
    if (file) {
      formData.append('file', file);
    }

    return apiClient.post<Document>(this.ENDPOINTS.DOCUMENTS, formData);
  }

  static async update(id: string, data: DocumentUpdateInput): Promise<Document> {
    return apiClient.put<Document>(`${this.ENDPOINTS.DOCUMENTS}/${id}`, data);
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.DOCUMENTS}/${id}`);
  }

  static async getByEmployee(employeeId: string): Promise<Document[]> {
    return apiClient.get<Document[]>(
      `${this.ENDPOINTS.DOCUMENTS}`,
      { params: { employeeId } }
    );
  }

  static async verify(id: string, verifiedBy: string): Promise<Document> {
    return apiClient.post<Document>(
      `${this.ENDPOINTS.DOCUMENTS}/${id}/verify`,
      { verifiedBy }
    );
  }

  static async reject(id: string, reason: string): Promise<Document> {
    return apiClient.post<Document>(
      `${this.ENDPOINTS.DOCUMENTS}/${id}/reject`,
      { reason }
    );
  }

  static async downloadDocument(id: string): Promise<Blob> {
    return apiClient.get<Blob>(
      `${this.ENDPOINTS.DOCUMENTS}/${id}/download`,
      { headers: { Accept: '*/*' } }
    );
  }

  // Plantillas de documentos
  static async getTemplates(): Promise<DocumentTemplate[]> {
    return apiClient.get<DocumentTemplate[]>(this.ENDPOINTS.TEMPLATES);
  }

  static async getTemplateById(id: string): Promise<DocumentTemplate> {
    return apiClient.get<DocumentTemplate>(`${this.ENDPOINTS.TEMPLATES}/${id}`);
  }

  static async createTemplate(data: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentTemplate> {
    return apiClient.post<DocumentTemplate>(this.ENDPOINTS.TEMPLATES, data);
  }

  static async updateTemplate(
    id: string,
    data: Partial<Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>
  ): Promise<DocumentTemplate> {
    return apiClient.put<DocumentTemplate>(`${this.ENDPOINTS.TEMPLATES}/${id}`, data);
  }

  static async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.TEMPLATES}/${id}`);
  }

  // Solicitudes de documentos
  static async getDocumentRequests(): Promise<DocumentRequest[]> {
    return apiClient.get<DocumentRequest[]>(this.ENDPOINTS.REQUESTS);
  }

  static async getDocumentRequestById(id: string): Promise<DocumentRequest> {
    return apiClient.get<DocumentRequest>(`${this.ENDPOINTS.REQUESTS}/${id}`);
  }

  static async createDocumentRequest(data: Omit<DocumentRequest, 'id' | 'requestedAt'>): Promise<DocumentRequest> {
    return apiClient.post<DocumentRequest>(this.ENDPOINTS.REQUESTS, data);
  }

  static async updateDocumentRequest(
    id: string,
    data: Partial<Omit<DocumentRequest, 'id' | 'requestedAt' | 'companyId' | 'employeeId'>>
  ): Promise<DocumentRequest> {
    return apiClient.put<DocumentRequest>(`${this.ENDPOINTS.REQUESTS}/${id}`, data);
  }

  static async getEmployeeDocumentRequests(employeeId: string): Promise<DocumentRequest[]> {
    return apiClient.get<DocumentRequest[]>(
      `${this.ENDPOINTS.REQUESTS}`,
      { params: { employeeId } }
    );
  }
}

export const documentService = DocumentService;
