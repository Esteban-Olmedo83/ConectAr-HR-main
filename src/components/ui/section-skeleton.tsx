'use client';

/**
 * SectionSkeleton — Skeletons semánticos de sección para las vistas principales.
 *
 * @example
 * // Tabla
 * <TableSkeleton rows={5} columns={4} />
 *
 * // Perfil de empleado
 * <ProfileSkeleton />
 *
 * // Grid de tarjetas KPI
 * <StatCardsSkeleton count={4} />
 *
 * // Lista de items
 * <ListSkeleton items={6} />
 */

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ── TableSkeleton ──────────────────────────────────────────────────────────────
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-lg border', className)}
      aria-label="Cargando tabla..."
      role="status"
    >
      {showHeader && (
        <div className="flex gap-4 border-b bg-muted/40 px-4 py-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowI) => (
        <div
          key={rowI}
          className="flex items-center gap-4 border-b px-4 py-3 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colI) => (
            <Skeleton
              key={colI}
              className={cn(
                'h-4',
                colI === 0 ? 'w-8 shrink-0 rounded-full' : 'flex-1',
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── ProfileSkeleton ───────────────────────────────────────────────────────────
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('space-y-6', className)}
      role="status"
      aria-label="Cargando perfil..."
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      {/* Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── StatCardsSkeleton ─────────────────────────────────────────────────────────
export interface StatCardsSkeletonProps {
  count?: number;
  className?: string;
}

export function StatCardsSkeleton({
  count = 4,
  className,
}: StatCardsSkeletonProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
      role="status"
      aria-label="Cargando métricas..."
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-11 w-11 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ListSkeleton ──────────────────────────────────────────────────────────────
export interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListSkeleton({
  items = 5,
  showAvatar = true,
  className,
}: ListSkeletonProps) {
  return (
    <div
      className={cn('divide-y rounded-lg border', className)}
      role="status"
      aria-label="Cargando lista..."
    >
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          {showAvatar && (
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          )}
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── FormSkeleton ──────────────────────────────────────────────────────────────
export interface FormSkeletonProps {
  fields?: number;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function FormSkeleton({
  fields = 6,
  columns = 2,
  className,
}: FormSkeletonProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }[columns];

  return (
    <div
      className={cn('space-y-6', className)}
      role="status"
      aria-label="Cargando formulario..."
    >
      <div className={cn('grid gap-4', gridClass)}>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}
