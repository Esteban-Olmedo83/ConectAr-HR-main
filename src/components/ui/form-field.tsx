'use client';

/**
 * FormField — Wrapper accesible para campos de formulario con label, hint y error.
 *
 * Funciona tanto con react-hook-form (via Controller) como de forma standalone.
 *
 * @example
 * // Standalone
 * <FormField label="Nombre" required error={errors.name?.message} hint="Nombre completo">
 *   <Input {...register('name')} />
 * </FormField>
 *
 * // Con react-hook-form Controller
 * <Controller
 *   name="sector"
 *   control={control}
 *   render={({ field, fieldState }) => (
 *     <FormField label="Sector" error={fieldState.error?.message}>
 *       <Select value={field.value} onValueChange={field.onChange}>
 *         ...
 *       </Select>
 *     </FormField>
 *   )}
 * />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  /** ID del input asociado. Si no se provee, se genera automáticamente. */
  htmlFor?: string;
  required?: boolean;
  error?: string;
  /** Texto de ayuda debajo del campo */
  hint?: string;
  children: React.ReactNode;
  className?: string;
  /** Layout: vertical (por defecto) u horizontal */
  layout?: 'vertical' | 'horizontal';
  /** Ancho de la columna de label en layout horizontal */
  labelWidth?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
  layout = 'vertical',
  labelWidth = 'w-36',
}: FormFieldProps) {
  // Generate stable ID if not provided
  const id = React.useId();
  const fieldId = htmlFor ?? id;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  // Clone child to inject id + aria attrs if it's a single element
  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }
  >;

  const describedBy = [error ? errorId : '', hint ? hintId : '']
    .filter(Boolean)
    .join(' ') || undefined;

  const enhancedChild = React.cloneElement(child, {
    id: child.props.id ?? fieldId,
    'aria-describedby': describedBy,
    'aria-invalid': !!error || undefined,
  });

  if (layout === 'horizontal') {
    return (
      <div className={cn('flex items-start gap-4', className)}>
        <label
          htmlFor={fieldId}
          className={cn(
            'mt-2.5 shrink-0 text-sm font-medium text-foreground',
            labelWidth,
          )}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="flex-1 space-y-1">
          {enhancedChild}
          {hint && !error && (
            <p id={hintId} className="text-xs text-muted-foreground">
              {hint}
            </p>
          )}
          {error && (
            <p
              id={errorId}
              role="alert"
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {enhancedChild}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
