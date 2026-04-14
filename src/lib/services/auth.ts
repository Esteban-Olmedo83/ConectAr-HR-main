/**
 * Servicio de Autenticación
 * Gestiona login, logout, sesiones y validación de autenticación
 */

import { apiClient } from './api-client';
import { AuthPayload, AuthResponse, User, Session } from '../types/user';
import { ApiResponse } from '../types/api';

export class AuthService {
  private static readonly AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    CURRENT_USER: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  };

  static async login(payload: AuthPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(this.AUTH_ENDPOINTS.LOGIN, payload);
  }

  static async logout(): Promise<void> {
    await apiClient.post<void>(this.AUTH_ENDPOINTS.LOGOUT);
    this.clearSession();
  }

  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(this.AUTH_ENDPOINTS.REGISTER, data);
  }

  static async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(this.AUTH_ENDPOINTS.CURRENT_USER);
  }

  static async getCurrentSession(): Promise<Session | null> {
    try {
      const response = await apiClient.getResponse<Session>(
        'GET',
        this.AUTH_ENDPOINTS.CURRENT_USER
      );
      return response.success ? response.data || null : null;
    } catch {
      return null;
    }
  }

  static async refreshToken(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(this.AUTH_ENDPOINTS.REFRESH);
  }

  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(this.AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
  }

  static async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(this.AUTH_ENDPOINTS.RESET_PASSWORD, { email });
  }

  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post(this.AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  }

  static setSession(authResponse: AuthResponse): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_token', authResponse.accessToken);
      if (authResponse.refreshToken) {
        sessionStorage.setItem('refresh_token', authResponse.refreshToken);
      }
      sessionStorage.setItem('user', JSON.stringify(authResponse.user));
      sessionStorage.setItem('session', JSON.stringify(authResponse.session));
    }
  }

  static getSession(): Session | null {
    if (typeof window === 'undefined') return null;

    try {
      const sessionData = sessionStorage.getItem('session');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  }

  static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('auth_token');
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('session');
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAuthToken() && !!this.getSession();
  }

  static isTokenExpired(): boolean {
    const session = this.getSession();
    if (!session) return true;

    const expiresAt = new Date(session.expiresAt);
    return expiresAt < new Date();
  }
}

export const authService = AuthService;
