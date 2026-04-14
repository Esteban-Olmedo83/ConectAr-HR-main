/**
 * Servicio de Notificaciones
 * Gestiona notificaciones y alertas del sistema
 */

import { apiClient } from './api-client';
import { NotificationType } from '../types/common';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  readAt?: Date;
}

export class NotificationService {
  private static readonly ENDPOINTS = {
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/notifications/settings',
  };

  static async getNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    return apiClient.get<Notification[]>(
      this.ENDPOINTS.NOTIFICATIONS,
      { params: { unreadOnly } }
    );
  }

  static async markAsRead(id: string): Promise<Notification> {
    return apiClient.post<Notification>(
      `${this.ENDPOINTS.NOTIFICATIONS}/${id}/read`
    );
  }

  static async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      `${this.ENDPOINTS.NOTIFICATIONS}/mark-all-read`
    );
  }

  static async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`${this.ENDPOINTS.NOTIFICATIONS}/${id}`);
  }

  static async clearAllNotifications(): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      this.ENDPOINTS.NOTIFICATIONS
    );
  }

  static async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ unreadCount: number }>(
      `${this.ENDPOINTS.NOTIFICATIONS}/unread-count`
    );
    return response.unreadCount;
  }

  // Suscripción en tiempo real (WebSocket)
  static subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void,
    onError?: (error: Error) => void
  ): () => void {
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${typeof window !== 'undefined' ? window.location.host : 'localhost'}/api/notifications/ws?userId=${userId}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Notificaciones conectadas');
    };

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification;
        onNotification(notification);
      } catch (error) {
        console.error('Error procesando notificación:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) {
        onError(new Error('Error en conexión WebSocket de notificaciones'));
      }
    };

    ws.onclose = () => {
      console.log('Notificaciones desconectadas');
    };

    return () => {
      ws.close();
    };
  }

  // Configuración de notificaciones
  static async getNotificationSettings(userId: string): Promise<Record<string, boolean>> {
    return apiClient.get<Record<string, boolean>>(
      `${this.ENDPOINTS.SETTINGS}/${userId}`
    );
  }

  static async updateNotificationSettings(
    userId: string,
    settings: Record<string, boolean>
  ): Promise<Record<string, boolean>> {
    return apiClient.put<Record<string, boolean>>(
      `${this.ENDPOINTS.SETTINGS}/${userId}`,
      settings
    );
  }

  // Envío de notificaciones (solo admin)
  static async sendNotification(data: {
    userId?: string;
    userRole?: string;
    title: string;
    message: string;
    type: NotificationType;
  }): Promise<{ success: boolean; sentCount: number }> {
    return apiClient.post<{ success: boolean; sentCount: number }>(
      `${this.ENDPOINTS.NOTIFICATIONS}/send`,
      data
    );
  }
}

export const notificationService = NotificationService;
