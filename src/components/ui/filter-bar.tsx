'use client';

/**
 * FilterBar — Barra de filtros con chips activos y opción de limpiar todo.
 *
 * @example
 * const filters: FilterConfig[] = [
 *   {
 *     key: 'sector',
 *     label: 'Sector',
 *     type: 'select',
 *     options: [
 *       { label: 'RRHH', value: 'rrhh' },
 *       { label: 'IT', value: 'it' },
 *     ],
 *   },
 *   {
 *     key: 'status',
 *     label: 'Estado',
 *     type: 'select',
 *     options: [
 *       { label: 'Activo', value: 'activo' },
 *       { label: 'Inactivo', value: 'inactivo' },
 *     ],
 *   },
 * ];
 *
 * const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});
 *
 * <FilterBar
 *   filters={filters}
 *   values={activeFilters}
 *   onChange={setActiveFilters}
 * />
 */

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Filter } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select';
  options: FilterOption[];
  placeholder?: string;
}

export interface FilterBarProps {
  filters: FilterConfig[];
  /** Valores activos: { [filterKey]: selectedValue } */
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  className?: string;
  /** Texto del botón de limpiar */
  clearLabel?: string;
  /** Muestra el ícono de filtro */
  showIcon?: boolean;
}

export function FilterBar({
  filters,
  values,
  onChange,
  className,
  clearLabel = 'Limpiar filtros',
  showIcon = true,
}: FilterBarProps) {
  const activeCount = Object.values(values).filter(Boolean).length;

  const handleChange = (key: string, value: string) => {
    onChange({ ...values, [key]: value });
  };

  const handleClearFilter = (key: string) => {
    const updated = { ...values };
    delete updated[key];
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange({});
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {showIcon && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Filtros</span>
        </div>
      )}

      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-1">
          <Select
            value={values[filter.key] ?? ''}
            onValueChange={(v) => handleChange(filter.key, v)}
          >
            <SelectTrigger
              className={cn(
                'h-8 min-w-[120px] text-xs',
                values[filter.key] && 'border-primary text-primary',
              )}
              aria-label={filter.label}
            >
              <SelectValue placeholder={filter.placeholder ?? filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {values[filter.key] && (
            <button
              type="button"
              onClick={() => handleClearFilter(filter.key)}
              aria-label={`Quitar filtro ${filter.label}`}
              className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}

      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
          {clearLabel}
          <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
            {activeCount}
          </span>
        </Button>
      )}
    </div>
  );
}
