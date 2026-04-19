'use client';

/**
 * @fileOverview ResetForm — ConectAr HR
 *
 * Formulario de 3 pasos para reset de contraseña.
 * Incluye:
 *  - Indicador de progreso visual (1/3, 2/3, 3/3)
 *  - Paso 1: Ingreso de email con verificación mock
 *  - Paso 2: Ingreso de token de 6 dígitos con auto-focus
 *  - Paso 3: Nueva contraseña + confirmar + strength meter
 *  - Transiciones entre pasos
 *  - Estados de loading y error por campo
 *
 * @example
 * // Montado desde reset-password/page.tsx
 * <ResetForm />
 */

import Link from 'next/link';
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationCard } from './confirmation-card';
import { PasswordStrengthMeter } from '../../signup/components/password-strength-meter';
import { usePasswordReset } from '../hooks/use-password-reset';

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

/** Barra de progreso por pasos */
function StepProgress({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { num: 1, label: 'Email' },
    { num: 2, label: 'Código' },
    { num: 3, label: 'Contraseña' },
  ];

  return (
    <div className="mb-6 flex items-center justify-between" aria-label="Progreso de pasos">
      {steps.map((step, index) => (
        <div key={step.num} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step.num < current
                  ? 'bg-green-500 text-white'
                  : step.num === current
                  ? 'bg-[#4979f5] text-white shadow-[0_4px_12px_rgba(73,121,245,0.4)]'
                  : 'bg-[#e8edf8] text-[#9aa3c0]'
              }`}
              aria-current={step.num === current ? 'step' : undefined}
            >
              {step.num < current ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={`text-[0.62rem] font-semibold tracking-wide ${
                step.num === current ? 'text-[#4979f5]' : 'text-[#9aa3c0]'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Conector entre pasos */}
          {index < steps.length - 1 && (
            <div
              className={`mx-2 mb-5 h-0.5 flex-1 rounded transition-colors ${
                step.num < current ? 'bg-green-400' : 'bg-[#e8edf8]'
              }`}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function ResetForm() {
  const {
    currentStep,
    isLoading,
    confirmedEmail,
    passwordStrength,
    step1Form,
    step2Form,
    step3Form,
    onStep1Submit,
    onStep2Submit,
    onStep3Submit,
    goBack,
    handleNewPasswordChange,
  } = usePasswordReset();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const step3PasswordValue = step3Form.watch('newPassword');

  return (
    <div className="space-y-2">
      <StepProgress current={currentStep} />

      {/* ------------------------------------------------------------------ */}
      {/* PASO 1: Email                                                        */}
      {/* ------------------------------------------------------------------ */}
      {currentStep === 1 && (
        <form
          onSubmit={onStep1Submit}
          noValidate
          className="flex flex-col gap-5"
          aria-label="Paso 1: ingresar email"
        >
          <ConfirmationCard
            icon={<Mail className="h-6 w-6" />}
            title="Recuperar contraseña"
            description="Ingresá tu email y te enviaremos un código de verificación."
            variant="info"
          />

          <div className="space-y-1">
            <label
              htmlFor="reset-email"
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
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="nombre@empresa.com"
                aria-invalid={!!step1Form.formState.errors.email}
                aria-describedby={
                  step1Form.formState.errors.email ? 'reset-email-error' : undefined
                }
                className="h-[52px] rounded-[13px] border-[#93a9ec8a] bg-[#f5f8ffda] pl-12 text-[1rem] text-[#3d4664] focus-visible:ring-[#5f84eb2b] focus-visible:ring-offset-0"
                {...step1Form.register('email')}
              />
            </div>
            <FieldError message={step1Form.formState.errors.email?.message} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-[52px] flex-1 rounded-[14px] bg-[linear-gradient(90deg,#3f6ff0_0%,#4979f5_100%)] text-[1rem] font-semibold shadow-[0_14px_26px_rgba(49,90,205,0.35)] hover:brightness-105"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Enviando...
                </>
              ) : (
                'Enviar código'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="h-[52px] flex-1 rounded-[14px] border-[#93a9ec8a] text-[#4a527a] hover:bg-[#f0f4ff]"
            >
              <Link href="/login">Cancelar</Link>
            </Button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PASO 2: Token                                                         */}
      {/* ------------------------------------------------------------------ */}
      {currentStep === 2 && (
        <form
          onSubmit={onStep2Submit}
          noValidate
          className="flex flex-col gap-5"
          aria-label="Paso 2: ingresar código de verificación"
        >
          <ConfirmationCard
            icon={<Mail className="h-6 w-6" />}
            title="Código enviado"
            description="Revisá tu bandeja de entrada e ingresá el código de 6 dígitos."
            email={confirmedEmail}
            variant="info"
          />

          <div className="space-y-1">
            <label
              htmlFor="reset-token"
              className="block text-[0.68rem] font-bold tracking-[0.24em] text-[#66729d]"
            >
              CÓDIGO DE VERIFICACIÓN
            </label>
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1accb]"
                aria-hidden="true"
              />
              <Input
                id="reset-token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                aria-invalid={!!step2Form.formState.errors.token}
                aria-describedby={
                  step2Form.formState.errors.token ? 'token-error' : undefined
                }
                className="h-[52px] rounded-[13px] border-[#93a9ec8a] bg-[#f5f8ffda] pl-12 text-center text-xl font-bold tracking-[0.5em] text-[#3d4664] focus-visible:ring-[#5f84eb2b] focus-visible:ring-offset-0"
                {...step2Form.register('token')}
              />
            </div>
            <FieldError message={step2Form.formState.errors.token?.message} />
            <p className="text-xs text-[#9aa3c0]">El código expira en 15 minutos.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-[52px] flex-1 rounded-[14px] bg-[linear-gradient(90deg,#3f6ff0_0%,#4979f5_100%)] text-[1rem] font-semibold shadow-[0_14px_26px_rgba(49,90,205,0.35)] hover:brightness-105"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Verificando...
                </>
              ) : (
                'Verificar código'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={isLoading}
              className="h-[52px] flex-1 rounded-[14px] border-[#93a9ec8a] text-[#4a527a] hover:bg-[#f0f4ff]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PASO 3: Nueva contraseña                                            */}
      {/* ------------------------------------------------------------------ */}
      {currentStep === 3 && (
        <form
          onSubmit={onStep3Submit}
          noValidate
          className="flex flex-col gap-5"
          aria-label="Paso 3: ingresar nueva contraseña"
        >
          <ConfirmationCard
            icon={<Lock className="h-6 w-6" />}
            title="Nueva contraseña"
            description="Elegí una contraseña segura para tu cuenta."
            variant="success"
          />

          {/* Nueva contraseña */}
          <div className="space-y-1">
            <label
              htmlFor="reset-new-password"
              className="block text-[0.68rem] font-bold tracking-[0.24em] text-[#66729d]"
            >
              NUEVA CONTRASEÑA
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1accb]"
                aria-hidden="true"
              />
              <Input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!step3Form.formState.errors.newPassword}
                aria-describedby="new-password-strength"
                className="h-[52px] rounded-[13px] border-[#93a9ec8a] bg-[#ffffffc9] pl-12 pr-14 text-[1rem] text-[#3d4664] focus-visible:ring-[#5f84eb2b] focus-visible:ring-offset-0"
                value={step3PasswordValue}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
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
            <FieldError message={step3Form.formState.errors.newPassword?.message} />

            <div id="new-password-strength" className="pt-1">
              <PasswordStrengthMeter strength={passwordStrength} />
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-1">
            <label
              htmlFor="reset-confirm-password"
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
                id="reset-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!step3Form.formState.errors.confirmPassword}
                aria-describedby={
                  step3Form.formState.errors.confirmPassword
                    ? 'confirm-password-error'
                    : undefined
                }
                className="h-[52px] rounded-[13px] border-[#93a9ec8a] bg-[#ffffffc9] pl-12 pr-14 text-[1rem] text-[#3d4664] focus-visible:ring-[#5f84eb2b] focus-visible:ring-offset-0"
                {...step3Form.register('confirmPassword')}
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
            <FieldError message={step3Form.formState.errors.confirmPassword?.message} />
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-[52px] flex-1 rounded-[14px] bg-[linear-gradient(90deg,#3f6ff0_0%,#4979f5_100%)] text-[1rem] font-semibold shadow-[0_14px_26px_rgba(49,90,205,0.35)] hover:brightness-105"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Guardando...
                </>
              ) : (
                'Guardar contraseña'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={isLoading}
              className="h-[52px] flex-1 rounded-[14px] border-[#93a9ec8a] text-[#4a527a] hover:bg-[#f0f4ff]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>
          </div>
        </form>
      )}

      {/* Link al login */}
      <p className="pt-2 text-center text-sm text-[#66729d]">
        ¿Recordaste tu contraseña?{' '}
        <Link href="/login" className="font-semibold text-[#4979f5] hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
