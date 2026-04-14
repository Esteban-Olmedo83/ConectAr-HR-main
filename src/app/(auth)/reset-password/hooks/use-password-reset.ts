'use client';

/**
 * @fileOverview usePasswordReset — ConectAr HR
 *
 * Hook para el flujo de reset de contraseña en 3 pasos:
 *  1. Solicitar token (verificar email en mock store)
 *  2. Validar token de 6 dígitos (con TTL de 15 min)
 *  3. Establecer nueva contraseña
 *
 * Usa localStorage como mock de backend para tokens y usuarios.
 *
 * @module use-password-reset
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useToast } from '@/hooks/use-toast';
import {
  generateResetToken,
  validateResetToken,
  consumeResetToken,
  updateUserPassword,
  isEmailRegistered,
  calculatePasswordStrength,
  type PasswordStrengthResult,
} from '@/lib/password-reset';

// ---------------------------------------------------------------------------
// Paso 1 — Email
// ---------------------------------------------------------------------------

export const Step1Schema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Por favor, ingresa un email válido'),
});
export type Step1Values = z.infer<typeof Step1Schema>;

// ---------------------------------------------------------------------------
// Paso 2 — Token
// ---------------------------------------------------------------------------

export const Step2Schema = z.object({
  token: z
    .string()
    .length(6, 'El código debe tener exactamente 6 dígitos')
    .regex(/^\d{6}$/, 'El código solo debe contener números'),
});
export type Step2Values = z.infer<typeof Step2Schema>;

// ---------------------------------------------------------------------------
// Paso 3 — Nueva contraseña
// ---------------------------------------------------------------------------

export const Step3Schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
export type Step3Values = z.infer<typeof Step3Schema>;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type ResetStep = 1 | 2 | 3;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePasswordReset() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<ResetStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrengthResult>(() => calculatePasswordStrength(''));

  // Formularios por paso
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(Step1Schema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(Step2Schema),
    defaultValues: { token: '' },
    mode: 'onChange',
  });

  const step3Form = useForm<Step3Values>({
    resolver: zodResolver(Step3Schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  // -------------------------------------------------------------------------
  // Paso 1: Solicitar reset
  // -------------------------------------------------------------------------
  const onStep1Submit = step1Form.handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 700));

      // Mock: verificar que el email exista (usuarios demo + localStorage)
      const demoEmails = [
        'admin@empresa.com',
        'gerente@empresa.com',
        'manager@empresa.com',
        'empleado@empresa.com',
      ];
      const emailExists =
        demoEmails.includes(values.email.toLowerCase()) ||
        isEmailRegistered(values.email);

      if (!emailExists) {
        step1Form.setError('email', {
          type: 'manual',
          message: 'No encontramos una cuenta con ese email',
        });
        return;
      }

      const token = generateResetToken(values.email);

      // En desarrollo exponemos el token en toast para poder testearlo
      if (process.env.NODE_ENV === 'development') {
        toast({
          title: 'Token generado (solo desarrollo)',
          description: `Tu código: ${token}`,
        });
      } else {
        toast({
          title: 'Email enviado',
          description: 'Revisá tu bandeja de entrada para obtener el código.',
        });
      }

      setConfirmedEmail(values.email);
      setCurrentStep(2);
    } finally {
      setIsLoading(false);
    }
  });

  // -------------------------------------------------------------------------
  // Paso 2: Validar token
  // -------------------------------------------------------------------------
  const onStep2Submit = step2Form.handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 500));

      const isValid = validateResetToken(confirmedEmail, values.token);

      if (!isValid) {
        step2Form.setError('token', {
          type: 'manual',
          message: 'Código incorrecto o expirado. Solicitá uno nuevo.',
        });
        return;
      }

      setCurrentStep(3);
    } finally {
      setIsLoading(false);
    }
  });

  // -------------------------------------------------------------------------
  // Paso 3: Cambiar contraseña
  // -------------------------------------------------------------------------
  const onStep3Submit = step3Form.handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 700));

      updateUserPassword(confirmedEmail, values.newPassword);
      consumeResetToken(confirmedEmail);

      toast({
        title: 'Contraseña actualizada',
        description: 'Ya podés iniciar sesión con tu nueva contraseña.',
      });

      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  });

  // -------------------------------------------------------------------------
  // Volver al paso anterior
  // -------------------------------------------------------------------------
  function goBack() {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
  }

  /** Actualiza el strength meter para la contraseña del paso 3 */
  function handleNewPasswordChange(value: string) {
    setPasswordStrength(calculatePasswordStrength(value));
    step3Form.setValue('newPassword', value, {
      shouldValidate: step3Form.formState.isSubmitted,
    });
  }

  return {
    currentStep,
    isLoading,
    confirmedEmail,
    passwordStrength,
    // Formularios
    step1Form,
    step2Form,
    step3Form,
    // Handlers de envío
    onStep1Submit,
    onStep2Submit,
    onStep3Submit,
    goBack,
    handleNewPasswordChange,
  };
}
