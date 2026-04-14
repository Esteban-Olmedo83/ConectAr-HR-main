'use client';

/**
 * InfoRow — Fila de detalle label → valor para páginas de perfil/legajo.
 *
 * @example
 * <InfoRow label="DNI" value="28.456.789" />
 * <InfoRow label="Fecha de ingreso" value="01/03/2020" icon={<Calendar className="h-4 w-4" />} />
 * <InfoRow label="Estado" value={<StatusBadge status="Activo" />} />
 * <InfoRow label="Email" value="—" isLoading />
 */

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface InfoRowProps {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  /** Renderiza valor en negrita */
  bold?: boolean;
}

export function InfoRow({
  label,
  value,
  icon,
  isLoading = false,
  className,
  bold = false,
}: InfoRowProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-border/50 py-2.5 last:border-0',
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
        {icon && <span aria-hidden="true">{icon}</span>}
        {label}
      </div>
      <div
        className={cn(
          'min-w-0 text-right text-sm text-foreground',
          bold && 'font-semibold',
        )}
      >
        {isLoading ? (
          <Skeleton className="ml-auto h-4 w-24" />
        ) : (
          value ?? <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

/**
 * InfoCard — Contenedor de InfoRows con título opcional.
 *
 * @example
 * <InfoCard title="Datos personales">
 *   <InfoRow label="Nombre" value="Ana García" />
 *   <InfoRow label="DNI" value="30.123.456" />
 * </InfoCard>
 */
export interface InfoCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function InfoCard({ title, children, className, action }: InfoCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && (
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
