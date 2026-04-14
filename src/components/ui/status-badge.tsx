'use client';

/**
 * StatusBadge — Badge semántico para estados de HR (solicitudes, empleados, etc.)
 *
 * @example
 * <StatusBadge status="Aprobado" />
 * <StatusBadge status="Pendiente" />
 * <StatusBadge status="Rechazado" />
 * <StatusBadge status="Activo" />
 *
 * // Personalizado
 * <StatusBadge label="En Proceso" color="blue" />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

type StatusColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple';

const colorClasses: Record<StatusColor, string> = {
  green:
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  yellow:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  red:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  blue:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  gray:
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700',
  orange:
    'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  purple:
    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
};

const dotColors: Record<StatusColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  gray: 'bg-gray-400',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
};

// Known HR statuses mapped to colors
const knownStatuses: Record<string, StatusColor> = {
  // Request statuses
  Aprobado: 'green',
  Activo: 'green',
  Completado: 'green',
  Contratado: 'green',
  Pendiente: 'yellow',
  'Pendiente de Admin': 'yellow',
  'En Proceso': 'yellow',
  'En Proceso de Selección': 'blue',
  Entrevistas: 'blue',
  'Oferta Enviada': 'purple',
  'Nuevas Vacantes': 'orange',
  Rechazado: 'red',
  Inactivo: 'red',
  Egresado: 'gray',
};

export interface StatusBadgeProps {
  /** Estado conocido del sistema (se asigna color automáticamente) */
  status?: string;
  /** Etiqueta manual (se usa si status no está definido) */
  label?: string;
  /** Color manual (ignora la inferencia automática) */
  color?: StatusColor;
  /** Muestra el punto indicador de estado */
  dot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  color,
  dot = false,
  className,
}: StatusBadgeProps) {
  const displayLabel = label ?? status ?? '';
  const resolvedColor: StatusColor =
    color ?? (status ? knownStatuses[status] : undefined) ?? 'gray';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorClasses[resolvedColor],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', dotColors[resolvedColor])}
          aria-hidden="true"
        />
      )}
      {displayLabel}
    </span>
  );
}
