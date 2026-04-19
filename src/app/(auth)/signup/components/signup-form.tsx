'use client';

/**
 * @fileOverview SignupForm — ConectAr HR
 *
 * Formulario completo de registro de cuenta. Incluye:
 *  - Email, Nombre, Apellido
 *  - Contraseña con toggle de visibilidad y PasswordStrengthMeter en tiempo real
 *  - Confirmar contraseña
 *  - Checkbox de aceptación de términos con Dialog
 *  - Estados de loading, error por campo y toast de éxito
 *  - Validación Zod + React Hook Form
 *
 * @example
 * // Usado directamente desde signup/page.tsx
 * <SignupForm />
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignup } from '../hooks/use-signup';
import { PasswordStrengthMeter } from './password-strength-meter';
import { TermsAgreement } from './terms-agreement';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-red-500">
      {message}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function SignupForm() {
  const { form, isLoading, passwordStrength, handlePasswordChange, onSubmit } =
    useSignup();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    formState: { errors },
    control,
    watch,
  } = form;

  const passwordValue = watch('password');

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5"
      aria-label="Formulario de registro"
    >
      {/* Email */}
      <div className="space-y-1">
        <label
          htmlFor="signup-email"
          className="block text-[0.68rem] font-bold tracking-[0.24em] text-[#66729d]"
        >
          EMAIL
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c77d2]"
            aria-hidden="true"
          />
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="nombre@empresa.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="h-[52px] rounded-[13px] border-[#93a9ec8a] bg-[#f5f8ffda] pl-12 text-[1rem] text-[#3d4664] focus-visible:ring-[#5f84eb2b] focus-visible:ring-offset-0"
            {...register('email')}
          />
        </div>
        <FieldError message={errors.email?.message} />
      </div>

      {/* Nombre y Apellido en fila */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="signup-firstName"
            className="block text-[0.68rem] font-bold tracking-[0.24em] text-[#66729d]"
          >
            NOMBRE
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1accb]"
              aria-hidden="true"
            />
            <Input
              id="signup-firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Juan"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              className="h-[52px] rounded-[13px] border-[#93a9ec8a] bg-[#f5f8ffda] pl-12 text-[1rem] text-[#3d4664] focus-visible:ring-[#5f84eb2b] focus-visible:ring-offset-0"
              {...register('firstName')}
            />
          </div>
          <FieldError message={errors.firstName?.message} />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="signup-lastName"
            className="block text-[0.68rem] font-bold tracking-[0.24em] text-[#66729d]"
          >
            APELLIDO
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1accb]"
              aria-hidden="true"
            />
            <Input
              id="signup-lastName"
              type="text"
              autoComplete="family-name"
              placeholder="García"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              className="h-[52px] rounded-[13px] border-[#93a9ec8a] bg-[#f5f8ffda] pl-12 text-[1rem] text-[#3d4664] focus-visible:ring-[#5f84eb2b] focus-visible:ring-offset-0"
              {...register('lastName')}
            />
          </div>
          <FieldError message={errors.lastName?.message} />
        </div>
      </div>

      {/* Contraseña */}
      <div className="space-y-1">
        <label
          htmlFor="signup-password"
          className="block text-[0.68rem] font-bold tracking-[0.24em] text-[#66729d]"
        >
          CONTRASEÑA
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1accb]"
            aria-hidden="true"
          />
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby="password-strength"
            className="h-[52px] rounded-[13px] border-[#93a9ec8a] bg-[#ffffffc9] pl-12 pr-14 text-[1rem] text-[#3d4664] focus-visible:ring-[#5f84eb2b] focus-visible:ring-offset-0"
            value={passwordValue}
            onChange={(e) => handlePasswordChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-transparent text-[#9aa6c8] transition hover:border-[#a8b5de9c] hover:bg-white/40 hover:text-[#647abf]"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <FieldError message={errors.password?.message} />

        {/* Strength Meter */}
        <div id="password-strength" className="pt-1">
          <PasswordStrengthMeter strength={passwordStrength} />
        </div>
      </div>

      {/* Confirmar Contraseña */}
      <div className="space-y-1">
        <label
          htmlFor="signup-confirmPassword"
          className="block text-[0.68rem] font-bold tracking-[0.24em] text-[#66729d]"
        >
          CONFIRMAR CONTRASEÑA
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1accb]"
            aria-hidden="true"
          />
          <Input
            id="signup-confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            className="h-[52px] rounded-[13px] border-[#93a9ec8a] bg-[#ffffffc9] pl-12 pr-14 text-[1rem] text-[#3d4664] focus-visible:ring-[#5f84eb2b] focus-visible:ring-offset-0"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-transparent text-[#9aa6c8] transition hover:border-[#a8b5de9c] hover:bg-white/40 hover:text-[#647abf]"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      {/* Términos y Condiciones */}
      <TermsAgreement control={control} error={errors.acceptTerms} />

      {/* Acciones */}
      <div className="flex flex-col gap-3 pt-1 sm:flex-row-reverse">
        <Button
          type="submit"
          disabled={isLoading}
          className="h-[54px] flex-1 rounded-[14px] bg-[linear-gradient(90deg,#3f6ff0_0%,#4979f5_100%)] text-[1rem] font-semibold shadow-[0_14px_26px_rgba(49,90,205,0.35)] hover:brightness-105"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creando cuenta...
            </>
          ) : (
            'Crear Cuenta'
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          asChild
          className="h-[54px] flex-1 rounded-[14px] border-[#93a9ec8a] text-[#4a527a] hover:bg-[#f0f4ff]"
        >
          <Link href="/login">Cancelar</Link>
        </Button>
      </div>

      {/* Link a login */}
      <p className="text-center text-sm text-[#66729d]">
        ¿Ya tenés una cuenta?{' '}
        <Link
          href="/login"
          className="font-semibold text-[#4979f5] hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}
