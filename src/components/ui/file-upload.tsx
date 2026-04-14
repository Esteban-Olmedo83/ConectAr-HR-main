'use client';

/**
 * FileUpload — Zona de arrastre para carga de archivos con lista de archivos seleccionados.
 *
 * @example
 * <FileUpload
 *   accept=".pdf,.doc,.docx"
 *   maxSizeMb={5}
 *   multiple={false}
 *   onFilesChange={(files) => setFiles(files)}
 *   label="Subir documento"
 * />
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FileUploadProps {
  /** Lista de extensiones permitidas: ".pdf,.xlsx" */
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  label?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function FileUpload({
  accept,
  maxSizeMb = 10,
  multiple = false,
  onFilesChange,
  label = 'Arrastrá o hacé clic para subir',
  hint,
  className,
  disabled = false,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const validateFiles = (incoming: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    incoming.forEach((file) => {
      if (file.size > maxSizeMb * 1024 * 1024) {
        errors.push(`"${file.name}" supera el límite de ${maxSizeMb} MB.`);
        return;
      }
      if (accept) {
        const exts = accept.split(',').map((e) => e.trim().toLowerCase());
        const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const mime = file.type.toLowerCase();
        const allowed = exts.some((e) => e === fileExt || mime.includes(e.replace('.', '')));
        if (!allowed) {
          errors.push(`"${file.name}" no es un tipo de archivo permitido.`);
          return;
        }
      }
      valid.push(file);
    });

    return { valid, errors };
  };

  const addFiles = (incoming: File[]) => {
    const { valid, errors: errs } = validateFiles(incoming);
    setErrors(errs);
    if (valid.length === 0) return;

    const updated = multiple ? [...files, ...valid] : [valid[0]];
    setFiles(updated);
    onFilesChange?.(updated);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange?.(updated);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    addFiles(Array.from(e.dataTransfer.files));
  };

  const hintText =
    hint ??
    `${accept ? `Formatos: ${accept}` : 'Cualquier formato'} — Máx. ${maxSizeMb} MB`;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/40',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hintText}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          aria-hidden="true"
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <ul className="space-y-1" role="alert">
          {errors.map((err, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {err}
            </li>
          ))}
        </ul>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-1.5" aria-label="Archivos seleccionados">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm"
            >
              <File className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate font-medium">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                aria-label={`Eliminar ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
