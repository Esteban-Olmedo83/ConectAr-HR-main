/**
 * Servicio de Permisos
 * Gestiona permisos y control de acceso
 */

import { apiClient } from './api-client';
import { UserPermission } from '../types/user';
import { UserRole } from '../types/common';

export interface PermissionCheck {
  resource: string;
  action: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
}

export class PermissionService {
  private static readonly ENDPOINTS = {
    PERMISSIONS: '/permissions',
    ROLES: '/permissions/roles',
    CHECK: '/permissions/check',
  };

  static async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return apiClient.get<UserPermission[]>(
      `${this.ENDPOINTS.PERMISSIONS}`,
      { params: { userId } }
    );
  }

  static async grantPermission(data: Omit<UserPermission, 'id' | 'grantedAt'>): Promise<UserPermission> {
    return apiClient.post<UserPermission>(this.ENDPOINTS.PERMISSIONS, data);
  }

  static async revokePermission(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.PERMISSIONS}/${id}`);
  }

  static async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ allowed: boolean }>(
        this.ENDPOINTS.CHECK,
        { userId, resource, action }
      );
      return response.allowed;
    } catch {
      return false;
    }
  }

  static async checkMultiplePermissions(
    userId: string,
    permissions: PermissionCheck[]
  ): Promise<Record<string, boolean>> {
    const response = await apiClient.post<Record<string, boolean>>(
      `${this.ENDPOINTS.CHECK}/multiple`,
      { userId, permissions }
    );
    return response;
  }

  static async getRolePermissions(role: UserRole): Promise<string[]> {
    const response = await apiClient.get<RolePermissions>(
      `${this.ENDPOINTS.ROLES}/${role}`
    );
    return response.permissions;
  }

  static async getAllRolePermissions(): Promise<RolePermissions[]> {
    return apiClient.get<RolePermissions[]>(this.ENDPOINTS.ROLES);
  }

  static async updateRolePermissions(role: UserRole, permissions: string[]): Promise<RolePermissions> {
    return apiClient.put<RolePermissions>(
      `${this.ENDPOINTS.ROLES}/${role}`,
      { permissions }
    );
  }

  // Métodos helper
  static canCreate(resource: string): PermissionCheck {
    return { resource, action: 'create' };
  }

  static canRead(resource: string): PermissionCheck {
    return { resource, action: 'read' };
  }

  static canUpdate(resource: string): PermissionCheck {
    return { resource, action: 'update' };
  }

  static canDelete(resource: string): PermissionCheck {
    return { resource, action: 'delete' };
  }

  static canExport(resource: string): PermissionCheck {
    return { resource, action: 'export' };
  }
}

export const permissionService = PermissionService;
