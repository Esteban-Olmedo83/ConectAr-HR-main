'use client';

/**
 * StepWizard — Asistente por pasos para formularios de múltiples etapas.
 *
 * @example
 * const steps = [
 *   { id: 'personal', label: 'Datos Personales', description: 'Nombre, DNI...' },
 *   { id: 'empresa', label: 'Empresa', description: 'Sector, categoría...' },
 *   { id: 'revision', label: 'Revisión', description: 'Confirmá los datos' },
 * ];
 *
 * <StepWizard
 *   steps={steps}
 *   currentStep={step}
 *   onStepClick={(i) => setStep(i)}
 * >
 *   {step === 0 && <PersonalForm />}
 *   {step === 1 && <CompanyForm />}
 *   {step === 2 && <ReviewPanel />}
 * </StepWizard>
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

export interface StepWizardProps {
  steps: WizardStep[];
  /** Índice 0-based del paso actual */
  currentStep: number;
  children: React.ReactNode;
  onStepClick?: (index: number) => void;
  /** Permite navegar a pasos anteriores al hacer clic */
  allowBackNav?: boolean;
  className?: string;
  /** Acciones (Siguiente / Anterior / Guardar) */
  footer?: React.ReactNode;
}

export function StepWizard({
  steps,
  currentStep,
  children,
  onStepClick,
  allowBackNav = true,
  className,
  footer,
}: StepWizardProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Step indicators */}
      <nav aria-label="Pasos del formulario">
        <ol className="flex flex-wrap items-center gap-0">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = allowBackNav && index < currentStep && onStepClick;

            return (
              <React.Fragment key={step.id}>
                <li className="flex items-center">
                  <button
                    type="button"
                    onClick={isClickable ? () => onStepClick(index) : undefined}
                    disabled={!isClickable}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors',
                      isCurrent && 'font-semibold text-primary',
                      isCompleted && isClickable && 'cursor-pointer hover:bg-muted',
                      isCompleted && !isClickable && 'cursor-default',
                      !isCompleted && !isCurrent && 'text-muted-foreground',
                    )}
                  >
                    {/* Circle */}
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                        isCurrent &&
                          'border-primary bg-primary text-primary-foreground',
                        isCompleted &&
                          'border-primary bg-primary text-primary-foreground',
                        !isCompleted &&
                          !isCurrent &&
                          'border-muted-foreground/30 text-muted-foreground',
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    {/* Label — hidden on very small screens */}
                    <span className="hidden sm:inline">
                      {step.label}
                    </span>
                  </button>
                </li>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <li
                    aria-hidden="true"
                    className={cn(
                      'mx-1 h-0.5 flex-1 min-w-[16px] rounded-full transition-colors',
                      index < currentStep ? 'bg-primary' : 'bg-border',
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </ol>

        {/* Current step description */}
        {steps[currentStep]?.description && (
          <p className="mt-2 text-xs text-muted-foreground">
            {steps[currentStep].description}
          </p>
        )}
      </nav>

      {/* Content */}
      <div>{children}</div>

      {/* Footer actions */}
      {footer && (
        <div className="flex items-center justify-between border-t pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}
