'use client';

/**
 * ConfirmDialog — Diálogo de confirmación reutilizable con variantes de severidad.
 *
 * @example
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Eliminar empleado"
 *   description="Esta acción no se puede deshacer. ¿Confirma eliminar a Juan García?"
 *   variant="destructive"
 *   confirmLabel="Eliminar"
 *   onConfirm={handleDelete}
 *   isLoading={deleting}
 * />
 */

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CheckCircle2, Loader2 } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Texto del botón de confirmación */
  confirmLabel?: string;
  /** Texto del botón de cancelación */
  cancelLabel?: string;
  /** Callback al confirmar */
  onConfirm: () => void | Promise<void>;
  /** Muestra spinner en el botón de confirmación */
  isLoading?: boolean;
  variant?: 'default' | 'destructive' | 'info' | 'success';
}

const variantConfig = {
  default: {
    icon: null,
    confirmClass: '',
  },
  destructive: {
    icon: <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />,
    confirmClass:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive',
  },
  info: {
    icon: <Info className="h-5 w-5 text-primary" aria-hidden="true" />,
    confirmClass: '',
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />,
    confirmClass:
      'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  isLoading = false,
  variant = 'default',
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            {config.icon && (
              <div className="mt-0.5 shrink-0">{config.icon}</div>
            )}
            <div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description && (
                <AlertDialogDescription className="mt-1">
                  {description}
                </AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center gap-2',
              config.confirmClass,
            )}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
