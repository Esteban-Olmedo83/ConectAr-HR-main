'use client';

/**
 * @fileOverview PasswordStrengthMeter — ConectAr HR
 *
 * Indicador visual de fortaleza de contraseña.
 * Muestra una barra de progreso coloreada, una etiqueta de nivel
 * y la lista detallada de requisitos con íconos de check/x.
 *
 * @example
 * <PasswordStrengthMeter strength={strengthResult} />
 */

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PasswordStrengthResult } from '@/lib/password-reset';

interface PasswordStrengthMeterProps {
  strength: PasswordStrengthResult;
  /** Si es true muestra el listado de requisitos */
  showRequirements?: boolean;
}

export function PasswordStrengthMeter({
  strength,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const { percent, label, color, requirements } = strength;

  return (
    <div className="space-y-2" aria-live="polite" aria-atomic="true">
      {/* Barra de progreso */}
      <div className="flex items-center gap-3">
        <div
          className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#e8edf8]"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Fortaleza de contraseña: ${label}`}
        >
          <div
            className={cn('h-full rounded-full transition-all duration-300', color)}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span
          className={cn(
            'min-w-[80px] text-right text-xs font-semibold',
            percent === 0 && 'text-[#9aa3c0]',
            percent > 0 && percent <= 40 && 'text-red-500',
            percent > 40 && percent <= 60 && 'text-yellow-500',
            percent > 60 && percent <= 80 && 'text-lime-600',
            percent > 80 && 'text-green-600'
          )}
        >
          {label}
        </span>
      </div>

      {/* Lista de requisitos */}
      {showRequirements && (
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2" aria-label="Requisitos de contraseña">
          {requirements.map((req) => (
            <li
              key={req.label}
              className={cn(
                'flex items-center gap-1.5 text-xs',
                req.met ? 'text-green-600' : 'text-[#9aa3c0]'
              )}
            >
              {req.met ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-green-500" aria-hidden="true" />
              ) : (
                <X className="h-3.5 w-3.5 shrink-0 text-[#c4cae0]" aria-hidden="true" />
              )}
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
