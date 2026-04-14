'use client';

/**
 * FormSection — Sección agrupada dentro de un formulario largo.
 *
 * @example
 * <FormSection
 *   title="Datos Personales"
 *   description="Información básica del empleado"
 *   icon={<User className="h-4 w-4" />}
 * >
 *   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 *     <FormField label="Nombre">
 *       <Input />
 *     </FormField>
 *   </div>
 * </FormSection>
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Oculta la línea separadora superior */
  hideSeparator?: boolean;
  /** Permite colapsar la sección */
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function FormSection({
  title,
  description,
  icon,
  children,
  className,
  hideSeparator = false,
  collapsible = false,
  defaultCollapsed = false,
}: FormSectionProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={cn('space-y-4', className)}>
      {!hideSeparator && <Separator />}
      <div
        className={cn(
          'flex items-start justify-between',
          collapsible && 'cursor-pointer select-none',
        )}
        onClick={collapsible ? () => setCollapsed((v) => !v) : undefined}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? !collapsed : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={
          collapsible
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCollapsed((v) => !v);
                }
              }
            : undefined
        }
      >
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {collapsible && (
          <span className="mt-0.5 text-xs text-muted-foreground">
            {collapsed ? 'Expandir' : 'Colapsar'}
          </span>
        )}
      </div>
      {!collapsed && <div className="pt-1">{children}</div>}
    </div>
  );
}
