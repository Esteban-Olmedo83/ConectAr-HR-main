/**
 * Hook de Notificaciones
 * Proporciona acceso al sistema de notificaciones
 */

'use client';

import { useCallback } from 'react';
import { NotificationType } from '../lib/types/common';

export interface Toast {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export function useNotification() {
  const showToast = useCallback((message: string, type: NotificationType = 'info', duration: number = 3000) => {
    // Implementar con sistema de notificaciones (toast)
    console.log(`[${type.toUpperCase()}]: ${message}`);
  }, []);

  const success = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const error = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const warning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const info = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  return {
    showToast,
    success,
    error,
    warning,
    info,
  };
}
