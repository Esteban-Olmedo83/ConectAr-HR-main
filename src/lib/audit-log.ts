/**
 * Registro de Auditoría
 * Gestiona el registro de acciones de usuarios
 */

import { apiClient } from './services/api-client';
import { AuditActionType } from './types/common';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: AuditActionType;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  timestamp?: Date;
}

export class AuditLogger {
  private static readonly ENDPOINT = '/audit-logs';

  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      const auditEntry = {
        ...entry,
        ipAddress: await this.getIpAddress(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date(),
      };

      await apiClient.post(this.ENDPOINT, auditEntry);
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }

  static async logCreate(userId: string, resourceType: string, resourceId: string, data: unknown): Promise<void> {
    await this.log({
      userId,
      action: 'create',
      resourceType,
      resourceId,
      changes: data as Record<string, unknown>,
      status: 'success',
    });
  }

  static async logUpdate(
    userId: string,
    resourceType: string,
    resourceId: string,
    changes: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      userId,
      action: 'update',
      resourceType,
      resourceId,
      changes,
      status: 'success',
    });
  }

  static async logDelete(userId: string, resourceType: string, resourceId: string): Promise<void> {
    await this.log({
      userId,
      action: 'delete',
      resourceType,
      resourceId,
      status: 'success',
    });
  }

  static async logView(userId: string, resourceType: string, resourceId: string): Promise<void> {
    await this.log({
      userId,
      action: 'view',
      resourceType,
      resourceId,
      status: 'success',
    });
  }

  static async logExport(userId: string, resourceType: string, format: string): Promise<void> {
    await this.log({
      userId,
      action: 'export',
      resourceType,
      changes: { format },
      status: 'success',
    });
  }

  static async logLogin(userId: string): Promise<void> {
    await this.log({
      userId,
      action: 'login',
      resourceType: 'auth',
      status: 'success',
    });
  }

  static async logLogout(userId: string): Promise<void> {
    await this.log({
      userId,
      action: 'logout',
      resourceType: 'auth',
      status: 'success',
    });
  }

  static async logError(
    userId: string,
    action: AuditActionType,
    resourceType: string,
    error: string
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resourceType,
      status: 'failure',
      errorMessage: error,
    });
  }

  private static async getIpAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json() as { ip: string };
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  static async getLogs(
    filters?: {
      userId?: string;
      action?: AuditActionType;
      resourceType?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<AuditLogEntry[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
    }

    return apiClient.get(`${this.ENDPOINT}?${params.toString()}`);
  }
}

export const auditLogger = AuditLogger;
