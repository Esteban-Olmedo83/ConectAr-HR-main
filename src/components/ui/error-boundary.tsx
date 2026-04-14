'use client';

/**
 * ErrorBoundary — React Error Boundary con UI de fallback.
 *
 * @example
 * // Envolver secciones críticas
 * <ErrorBoundary>
 *   <EmployeeTable />
 * </ErrorBoundary>
 *
 * // Con fallback personalizado
 * <ErrorBoundary fallback={<p>Error en el módulo.</p>}>
 *   <DangerousComponent />
 * </ErrorBoundary>
 *
 * // Hook para Next.js 13+ (app router) — usar en error.tsx
 * export default function Error({ error, reset }: { error: Error; reset: () => void }) {
 *   return <ErrorFallback error={error} onReset={reset} />;
 * }
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// ── ErrorFallback UI ──────────────────────────────────────────────────────────
export interface ErrorFallbackProps {
  error?: Error;
  onReset?: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  onReset,
  title = 'Algo salió mal',
  description = 'Ocurrió un error inesperado. Podés intentar recargar la sección.',
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        {error?.message && (
          <p className="mt-2 rounded bg-destructive/10 px-3 py-1 text-xs font-mono text-destructive">
            {error.message}
          </p>
        )}
      </div>
      {onReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}

// ── Class Component Boundary ──────────────────────────────────────────────────
interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorFallback
          error={this.state.error ?? undefined}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}
