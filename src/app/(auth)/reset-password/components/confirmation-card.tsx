'use client';

/**
 * @fileOverview ConfirmationCard — ConectAr HR
 *
 * Tarjeta de confirmación reutilizable para mostrar mensajes de éxito,
 * información de pasos o resultados de acciones en el flujo de reset.
 *
 * @example
 * <ConfirmationCard
 *   icon={<Mail />}
 *   title="Email enviado"
 *   description="Revisá tu bandeja de entrada"
 *   email="user@ejemplo.com"
 * />
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ConfirmationCardProps {
  /** Ícono o elemento visual principal */
  icon: ReactNode;
  /** Título principal */
  title: string;
  /** Descripción o mensaje secundario */
  description: string;
  /** Email destacado (opcional) */
  email?: string;
  /** Variante visual */
  variant?: 'info' | 'success' | 'warning';
  /** Clases adicionales */
  className?: string;
}

const variantStyles = {
  info: {
    container: 'bg-[#eef2ff] border-[#c7d4f8]',
    iconWrapper: 'bg-[#dce6ff] text-[#4979f5]',
    title: 'text-[#2d3561]',
    description: 'text-[#4a527a]',
  },
  success: {
    container: 'bg-[#f0fdf4] border-[#bbf7d0]',
    iconWrapper: 'bg-[#dcfce7] text-green-600',
    title: 'text-green-900',
    description: 'text-green-700',
  },
  warning: {
    container: 'bg-[#fffbeb] border-[#fde68a]',
    iconWrapper: 'bg-[#fef9c3] text-yellow-600',
    title: 'text-yellow-900',
    description: 'text-yellow-700',
  },
} as const;

export function ConfirmationCard({
  icon,
  title,
  description,
  email,
  variant = 'info',
  className,
}: ConfirmationCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border p-5 text-center',
        styles.container,
        className
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full',
          styles.iconWrapper
        )}
        aria-hidden="true"
      >
        {icon}
      </div>

      <div className="space-y-1">
        <p className={cn('text-base font-semibold', styles.title)}>{title}</p>
        <p className={cn('text-sm leading-relaxed', styles.description)}>
          {description}
        </p>
        {email && (
          <p className="mt-1 text-sm font-semibold text-[#4979f5]">{email}</p>
        )}
      </div>
    </div>
  );
}
