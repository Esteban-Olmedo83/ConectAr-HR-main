'use client';

/**
 * LoadingOverlay — Superposición de carga para contenedores o página completa.
 *
 * @example
 * // En un contenedor relativo
 * <div className="relative">
 *   <LoadingOverlay visible={isSubmitting} message="Guardando cambios..." />
 *   <form>...</form>
 * </div>
 *
 * // Pantalla completa
 * <LoadingOverlay visible={isLoading} fullScreen message="Cargando aplicación..." />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
  className?: string;
  /** Opacidad del fondo: 'light' | 'medium' | 'solid' */
  backdrop?: 'light' | 'medium' | 'solid';
}

const backdropClass = {
  light: 'bg-background/40',
  medium: 'bg-background/70',
  solid: 'bg-background/95',
};

export function LoadingOverlay({
  visible,
  message,
  fullScreen = false,
  className,
  backdrop = 'medium',
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message ?? 'Cargando...'}
      className={cn(
        'flex items-center justify-center backdrop-blur-sm transition-opacity duration-200',
        backdropClass[backdrop],
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10 rounded-[inherit]',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-6 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        {message && (
          <p className="text-sm font-medium text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
