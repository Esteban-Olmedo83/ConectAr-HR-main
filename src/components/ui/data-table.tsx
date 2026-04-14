'use client';

/**
 * DataTable — Tabla reutilizable con sort, filter y paginación.
 *
 * @example
 * // Uso básico
 * const columns: ColumnDef<Employee>[] = [
 *   { key: 'name', header: 'Nombre', sortable: true },
 *   { key: 'email', header: 'Email' },
 *   {
 *     key: 'status',
 *     header: 'Estado',
 *     render: (row) => <Badge>{row.status}</Badge>,
 *   },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={employees}
 *   searchPlaceholder="Buscar empleado..."
 *   pageSize={10}
 * />
 */

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  /** Clave del campo en el objeto de datos. Puede ser una ruta simple. */
  key: keyof T | string;
  header: string;
  /** Habilita ordenamiento por esta columna */
  sortable?: boolean;
  /** Renderizador personalizado. Recibe la fila completa. */
  render?: (row: T, index: number) => React.ReactNode;
  /** Clases extras para la celda de cabecera */
  headerClassName?: string;
  /** Clases extras para cada celda de datos */
  cellClassName?: string;
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  /** Muestra esqueletos de carga */
  isLoading?: boolean;
  /** Número de filas en pantalla cuando está cargando */
  loadingRows?: number;
  /** Placeholder del campo de búsqueda */
  searchPlaceholder?: string;
  /** Función de búsqueda personalizada. Omitir para usar búsqueda automática. */
  onSearch?: (query: string) => void;
  /** Filas por página */
  pageSize?: number;
  /** Mensaje cuando no hay resultados */
  emptyMessage?: string;
  /** Slot para acciones a la derecha de la barra de búsqueda */
  actions?: React.ReactNode;
  /** Clase extra para el contenedor raíz */
  className?: string;
  /** Identificador de fila (por defecto usa el índice) */
  getRowId?: (row: T) => string;
  /** Callback al hacer clic en una fila */
  onRowClick?: (row: T) => void;
  /** Clave del campo para ordenar por defecto */
  defaultSortKey?: keyof T | string;
  defaultSortDirection?: SortDirection;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function defaultSearchFilter<T>(row: T, query: string): boolean {
  const lower = query.toLowerCase();
  return Object.values(row as Record<string, unknown>).some((value) => {
    if (typeof value === 'string') return value.toLowerCase().includes(lower);
    if (typeof value === 'number') return String(value).includes(lower);
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value).toLowerCase().includes(lower);
    }
    return false;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  loadingRows = 5,
  searchPlaceholder = 'Buscar...',
  onSearch,
  pageSize = 10,
  emptyMessage = 'No se encontraron resultados.',
  actions,
  className,
  getRowId,
  onRowClick,
  defaultSortKey,
  defaultSortDirection = null,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState('');
  const [sortKey, setSortKey] = React.useState<keyof T | string | null>(
    defaultSortKey ?? null,
  );
  const [sortDir, setSortDir] = React.useState<SortDirection>(defaultSortDirection);
  const [page, setPage] = React.useState(1);

  // Reset page when query changes
  React.useEffect(() => {
    setPage(1);
  }, [query]);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    if (!query.trim()) return data;
    if (onSearch) return data; // external search — caller controls data
    return data.filter((row) => defaultSearchFilter(row, query));
  }, [data, query, onSearch]);

  // ── Sorting ──────────────────────────────────────────────────────────────
  const sorted = React.useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = getNestedValue(a, sortKey as string);
      const bv = getNestedValue(b, sortKey as string);
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const result =
        typeof av === 'string' && typeof bv === 'string'
          ? av.localeCompare(bv, 'es', { sensitivity: 'base' })
          : av < bv
          ? -1
          : av > bv
          ? 1
          : 0;
      return sortDir === 'asc' ? result : -result;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSort = (key: keyof T | string) => {
    if (sortKey === key) {
      setSortDir((prev) =>
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc',
      );
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch?.('');
  };

  // ── Sort icon ─────────────────────────────────────────────────────────────
  const SortIcon = ({ colKey }: { colKey: keyof T | string }) => {
    if (sortKey !== colKey) return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
    if (sortDir === 'asc') return <ChevronUp className="ml-1 h-3.5 w-3.5 text-primary" />;
    if (sortDir === 'desc') return <ChevronDown className="ml-1 h-3.5 w-3.5 text-primary" />;
    return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar en tabla"
            placeholder={searchPlaceholder}
            value={query}
            onChange={handleSearchChange}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              aria-label="Limpiar búsqueda"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    'select-none whitespace-nowrap',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer hover:bg-muted/60 transition-colors',
                    col.headerClassName,
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    col.sortable
                      ? sortKey === col.key
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : sortDir === 'desc'
                          ? 'descending'
                          : 'none'
                        : 'none'
                      : undefined
                  }
                >
                  <span className="inline-flex items-center">
                    {col.header}
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <TableRow key={`skel-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      <Skeleton className="h-5 w-full max-w-[180px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, rowIndex) => {
                const rowId = getRowId
                  ? getRowId(row)
                  : String((safePage - 1) * pageSize + rowIndex);
                return (
                  <TableRow
                    key={rowId}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(onRowClick && 'cursor-pointer')}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={String(col.key)}
                        className={cn(
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right',
                          col.cellClassName,
                        )}
                      >
                        {col.render
                          ? col.render(row, rowIndex)
                          : (getNestedValue(row, String(col.key)) as React.ReactNode) ?? '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && sorted.length > pageSize && (
        <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <span>
            Mostrando {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, sorted.length)} de {sorted.length} resultados
          </span>
          <div className="flex items-center gap-1" role="navigation" aria-label="Paginación">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Windowed page numbers
              let pg: number;
              if (totalPages <= 5) {
                pg = i + 1;
              } else if (safePage <= 3) {
                pg = i + 1;
              } else if (safePage >= totalPages - 2) {
                pg = totalPages - 4 + i;
              } else {
                pg = safePage - 2 + i;
              }
              return (
                <Button
                  key={pg}
                  variant={safePage === pg ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(pg)}
                  aria-label={`Ir a página ${pg}`}
                  aria-current={safePage === pg ? 'page' : undefined}
                  className="min-w-[2rem]"
                >
                  {pg}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
