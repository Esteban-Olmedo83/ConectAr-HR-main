'use client';

/**
 * @fileOverview TermsAgreement — ConectAr HR
 *
 * Componente de checkbox + link que abre un Dialog con los Términos y
 * Condiciones completos. Integrado con React Hook Form a través de
 * `Controller`.
 *
 * @example
 * <TermsAgreement control={form.control} error={form.formState.errors.acceptTerms} />
 */

import { useState } from 'react';
import { Controller, type Control, type FieldError } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { SignupFormValues } from '../hooks/use-signup';

interface TermsAgreementProps {
  control: Control<SignupFormValues>;
  error?: FieldError;
}

export function TermsAgreement({ control, error }: TermsAgreementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="acceptTerms"
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-describedby={error ? 'terms-error' : undefined}
              className="mt-0.5"
            />
          )}
        />
        <label
          htmlFor="acceptTerms"
          className="cursor-pointer text-sm leading-snug text-[#4a527a]"
        >
          Acepto los{' '}
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="font-semibold text-[#4979f5] underline underline-offset-2 hover:text-[#3f6ff0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4979f5]"
          >
            términos y condiciones
          </button>{' '}
          de uso de ConectAr HR
        </label>
      </div>

      {error && (
        <p id="terms-error" role="alert" className="text-xs text-red-500">
          {error.message}
        </p>
      )}

      {/* Dialog de Términos */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Términos y Condiciones de Uso</DialogTitle>
            <DialogDescription>
              ConectAr HR — Versión 1.0 · Última actualización: Abril 2026
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-[#4a527a]">
            <section>
              <h3 className="mb-1 font-semibold text-[#2d3561]">1. Aceptación de los Términos</h3>
              <p>
                Al registrarte en ConectAr HR aceptás estos términos en su totalidad. Si
                no estás de acuerdo con alguna parte, no podés utilizar el servicio.
              </p>
            </section>

            <section>
              <h3 className="mb-1 font-semibold text-[#2d3561]">2. Uso de la Plataforma</h3>
              <p>
                ConectAr HR es una plataforma de gestión de recursos humanos. El acceso
                está restringido a usuarios autorizados por la organización contratante.
                Queda prohibido compartir credenciales o utilizar la plataforma con fines
                ajenos a la gestión de personal.
              </p>
            </section>

            <section>
              <h3 className="mb-1 font-semibold text-[#2d3561]">3. Privacidad y Datos</h3>
              <p>
                Los datos personales ingresados son tratados conforme a la Ley 25.326 de
                Protección de Datos Personales (Argentina). No compartimos información con
                terceros sin consentimiento expreso.
              </p>
            </section>

            <section>
              <h3 className="mb-1 font-semibold text-[#2d3561]">4. Seguridad de la Cuenta</h3>
              <p>
                Sos responsable de mantener la confidencialidad de tu contraseña. Notificá
                inmediatamente cualquier acceso no autorizado a tu cuenta.
              </p>
            </section>

            <section>
              <h3 className="mb-1 font-semibold text-[#2d3561]">5. Limitación de Responsabilidad</h3>
              <p>
                ConectAr HR no se responsabiliza por pérdidas derivadas del uso indebido
                de la plataforma o por interrupciones del servicio fuera de nuestro control.
              </p>
            </section>

            <section>
              <h3 className="mb-1 font-semibold text-[#2d3561]">6. Modificaciones</h3>
              <p>
                Nos reservamos el derecho de modificar estos términos con previo aviso de
                30 días. El uso continuado de la plataforma implica aceptación de los
                cambios.
              </p>
            </section>
          </div>

          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
