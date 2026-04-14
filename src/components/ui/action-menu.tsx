'use client';

/**
 * ActionMenu — Menú de acciones contextual para filas de tabla o cards.
 *
 * @example
 * <ActionMenu
 *   items={[
 *     { label: 'Ver perfil', icon: <Eye />, onClick: () => viewEmployee(id) },
 *     { label: 'Editar', icon: <Pencil />, onClick: () => editEmployee(id) },
 *     { label: 'Eliminar', icon: <Trash2 />, onClick: () => deleteEmployee(id), variant: 'destructive' },
 *   ]}
 * />
 */

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  /** Si se provee, inserta un separador ANTES de este item */
  separator?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  /** Texto del botón trigger (sr-only si se omite) */
  triggerLabel?: string;
  /** Etiqueta del grupo de acciones (opcional) */
  groupLabel?: string;
  /** Alineación del dropdown */
  align?: 'start' | 'center' | 'end';
  className?: string;
  disabled?: boolean;
}

export function ActionMenu({
  items,
  triggerLabel,
  groupLabel,
  align = 'end',
  className,
  disabled = false,
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8 data-[state=open]:bg-muted', className)}
          disabled={disabled}
          aria-label={triggerLabel ?? 'Abrir menú de acciones'}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          {triggerLabel && (
            <span className="sr-only">{triggerLabel}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[160px]">
        {groupLabel && (
          <>
            <DropdownMenuLabel>{groupLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {item.separator && i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                'flex items-center gap-2 text-sm',
                item.variant === 'destructive' &&
                  'text-destructive focus:bg-destructive/10 focus:text-destructive',
              )}
            >
              {item.icon && (
                <span className="h-4 w-4 shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
