/**
 * Tipos para Usuario y Sesión
 * Define interfaces para usuarios, sesiones y autenticación
 */

import { UserRole } from './common';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  userId: string;
  userName: string;
  role: UserRole;
  isManager: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  permissions?: string[];
  expiresAt?: Date;
  issuedAt?: Date;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
  accessToken: string;
  refreshToken?: string;
}

export interface UserProfile extends User {
  companyId: string;
  departmentId?: string;
  jobTitle?: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UserPermission {
  id: string;
  userId: string;
  resourceType: string;
  action: string;
  granted: boolean;
  grantedBy?: string;
  grantedAt: Date;
}

export interface PasswordReset {
  token: string;
  userId: string;
  expiresAt: Date;
  used: boolean;
}

export type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>;
export type UserUpdateInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'email'>>;
