'use client';

/**
 * StatCard — Tarjeta de métrica KPI para dashboards.
 *
 * @example
 * <StatCard
 *   title="Empleados Activos"
 *   value={124}
 *   delta={+5}
 *   deltaLabel="vs mes anterior"
 *   icon={<Users className="h-5 w-5" />}
 *   variant="primary"
 * />
 *
 * // Con skeleton de carga
 * <StatCard isLoading />
 */

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  /** Variación numérica. Positivo = verde, negativo = rojo */
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  /** Color del ícono de fondo */
  variant?: 'primary' | 'success' | 'warning' | 'destructive' | 'muted';
  isLoading?: boolean;
  className?: string;
  /** Descripción adicional debajo del valor */
  description?: string;
}

const variantIconBg: Record<NonNullable<StatCardProps['variant']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-500/10 text-green-600 dark:text-green-400',
  warning: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  destructive: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground',
};

export function StatCard({
  title,
  value,
  delta,
  deltaLabel,
  icon,
  variant = 'primary',
  isLoading = false,
  className,
  description,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-11 w-11 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;

  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow hover:shadow-md',
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
            </p>
            {(delta !== undefined || description) && (
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                {delta !== undefined && (
                  <>
                    {isPositive && (
                      <span className="flex items-center gap-0.5 font-medium text-green-600 dark:text-green-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        +{delta}
                      </span>
                    )}
                    {isNegative && (
                      <span className="flex items-center gap-0.5 font-medium text-destructive">
                        <TrendingDown className="h-3.5 w-3.5" />
                        {delta}
                      </span>
                    )}
                    {delta === 0 && (
                      <span className="font-medium text-muted-foreground">Sin cambios</span>
                    )}
                  </>
                )}
                {deltaLabel && (
                  <span className="text-muted-foreground">{deltaLabel}</span>
                )}
                {description && !delta && (
                  <span className="text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                variantIconBg[variant],
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
