'use client';

/**
 * EmptyState — Estado vacío genérico.
 *
 * @example
 * <EmptyState
 *   icon={<Users className="h-10 w-10" />}
 *   title="Sin empleados"
 *   description="Aún no hay empleados registrados en el sistema."
 *   action={<Button onClick={onAdd}>Agregar empleado</Button>}
 * />
 *
 * // Con variante de error
 * <EmptyState
 *   variant="error"
 *   title="Error al cargar"
 *   description="No se pudieron cargar los datos."
 *   action={<Button variant="outline" onClick={retry}>Reintentar</Button>}
 * />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Inbox, AlertCircle, SearchX, FileX2 } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Ícono personalizado. Si se omite se usa el del variant. */
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'empty' | 'error' | 'search' | 'no-results';
  className?: string;
}

const defaultIcons: Record<NonNullable<EmptyStateProps['variant']>, React.ReactNode> = {
  empty: <Inbox className="h-10 w-10" />,
  error: <AlertCircle className="h-10 w-10" />,
  search: <SearchX className="h-10 w-10" />,
  'no-results': <FileX2 className="h-10 w-10" />,
};

const variantColors: Record<NonNullable<EmptyStateProps['variant']>, string> = {
  empty: 'text-muted-foreground',
  error: 'text-destructive',
  search: 'text-muted-foreground',
  'no-results': 'text-muted-foreground',
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = 'empty',
  className,
}: EmptyStateProps) {
  const resolvedIcon = icon ?? defaultIcons[variant];
  const colorClass = variantColors[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-6 text-center',
        className,
      )}
    >
      <div className={cn('opacity-50', colorClass)} aria-hidden="true">
        {resolvedIcon}
      </div>
      <div className="max-w-sm space-y-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
