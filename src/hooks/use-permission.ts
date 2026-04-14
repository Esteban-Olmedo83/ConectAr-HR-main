/**
 * Hook de Permisos
 * Proporciona funciones para verificar permisos del usuario
 */

'use client';

import { useCallback } from 'react';
import { useAuth } from './use-auth';
import { permissionService, PermissionCheck } from '../lib/services/permissions';

export function usePermission() {
  const { user } = useAuth();

  const hasPermission = useCallback(
    async (resource: string, action: string): Promise<boolean> => {
      if (!user) return false;
      return permissionService.checkPermission(user.id, resource, action);
    },
    [user]
  );

  const hasMultiplePermissions = useCallback(
    async (permissions: PermissionCheck[]): Promise<Record<string, boolean>> => {
      if (!user) {
        return permissions.reduce(
          (acc, perm) => ({
            ...acc,
            [`${perm.resource}:${perm.action}`]: false,
          }),
          {}
        );
      }
      return permissionService.checkMultiplePermissions(user.id, permissions);
    },
    [user]
  );

  const can = {
    create: (resource: string) => hasPermission(resource, 'create'),
    read: (resource: string) => hasPermission(resource, 'read'),
    update: (resource: string) => hasPermission(resource, 'update'),
    delete: (resource: string) => hasPermission(resource, 'delete'),
    export: (resource: string) => hasPermission(resource, 'export'),
  };

  return {
    hasPermission,
    hasMultiplePermissions,
    can,
  };
}
