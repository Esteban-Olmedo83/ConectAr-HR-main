/**
 * Guardia de Autenticación
 * Funciones para validar y proteger rutas
 */

import { authService } from './services/auth';
import { UserRole } from './types/common';

export function isAuthenticated(): boolean {
  return authService.isAuthenticated();
}

export function hasRole(role: UserRole | UserRole[]): boolean {
  const session = authService.getSession();
  if (!session) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(session.role as UserRole);
}

export function hasAnyRole(roles: UserRole[]): boolean {
  return hasRole(roles);
}

export function hasAllRoles(roles: UserRole[]): boolean {
  const session = authService.getSession();
  if (!session) return false;

  return roles.every((role) => session.role === role);
}

export function hasPermission(resource: string, action: string): boolean {
  const session = authService.getSession();
  if (!session) return false;

  const permission = `${resource}:${action}`;
  return session.permissions.includes(permission);
}

export function hasAnyPermission(permissions: string[]): boolean {
  const session = authService.getSession();
  if (!session) return false;

  return permissions.some((perm) => session.permissions.includes(perm));
}

export function hasAllPermissions(permissions: string[]): boolean {
  const session = authService.getSession();
  if (!session) return false;

  return permissions.every((perm) => session.permissions.includes(perm));
}

export function canAccess(requiredRole?: UserRole, requiredPermission?: string): boolean {
  if (!isAuthenticated()) return false;

  if (requiredRole && !hasRole(requiredRole)) return false;

  if (requiredPermission) {
    const [resource, action] = requiredPermission.split(':');
    if (!hasPermission(resource, action)) return false;
  }

  return true;
}

export function requireAuthentication(): void {
  if (!isAuthenticated()) {
    throw new Error('Se requiere autenticación');
  }
}

export function requireRole(role: UserRole): void {
  if (!hasRole(role)) {
    throw new Error(`Se requiere el rol: ${role}`);
  }
}

export function requirePermission(resource: string, action: string): void {
  if (!hasPermission(resource, action)) {
    throw new Error(`Se requiere permiso: ${resource}:${action}`);
  }
}
