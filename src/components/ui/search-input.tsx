'use client';

/**
 * SearchInput — Input de búsqueda con ícono, botón de limpiar y debounce opcional.
 *
 * @example
 * // Con debounce
 * <SearchInput
 *   placeholder="Buscar empleado..."
 *   onSearch={(q) => setQuery(q)}
 *   debounceMs={300}
 * />
 *
 * // Controlado
 * <SearchInput
 *   value={query}
 *   onChange={(e) => setQuery(e.target.value)}
 * />
 */

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X, Loader2 } from 'lucide-react';

export interface SearchInputProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** Callback con el valor tras debounce */
  onSearch?: (value: string) => void;
  /** Milisegundos de debounce (0 = inmediato) */
  debounceMs?: number;
  /** Muestra spinner en lugar del ícono de búsqueda mientras se busca */
  isSearching?: boolean;
  /** Clase extra del wrapper */
  wrapperClassName?: string;
}

export function SearchInput({
  onSearch,
  debounceMs = 0,
  isSearching = false,
  wrapperClassName,
  className,
  value,
  onChange,
  ...props
}: SearchInputProps) {
  const [internalValue, setInternalValue] = React.useState(
    (value as string) ?? '',
  );
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isControlled = value !== undefined;

  const displayValue = isControlled ? (value as string) : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!isControlled) setInternalValue(v);
    onChange?.(e);

    if (onSearch) {
      if (debounceMs > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onSearch(v), debounceMs);
      } else {
        onSearch(v);
      }
    }
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue('');
    onSearch?.('');
    // Synthetic event to trigger onChange if provided
    const syntheticEvent = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(syntheticEvent);
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={cn('relative', wrapperClassName)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </span>
      <Input
        type="search"
        className={cn('pl-9', displayValue ? 'pr-9' : '', className)}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
      {displayValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
