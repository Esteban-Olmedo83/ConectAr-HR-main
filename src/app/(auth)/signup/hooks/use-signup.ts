'use client';

/**
 * @fileOverview Hook de lógica para el formulario de Signup — ConectAr HR
 *
 * Encapsula:
 *  - Inicialización de React Hook Form + Zod
 *  - Cálculo en tiempo real de fortaleza de contraseña
 *  - Verificación mock de email único (localStorage)
 *  - Envío del formulario con loading state y toast
 *  - Redirección a /login tras el registro exitoso
 *
 * @module use-signup
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useToast } from '@/hooks/use-toast';
import {
  calculatePasswordStrength,
  isEmailRegistered,
  registerUser,
  type PasswordStrengthResult,
} from '@/lib/password-reset';

// ---------------------------------------------------------------------------
// Schema Zod con mensajes en Español y validación de caracteres especiales
// ---------------------------------------------------------------------------

export const SignupSchema = z
  .object({
    email: z
      .string()
      .min(1, 'El email es requerido')
      .email('Por favor, ingresa un email válido'),
    firstName: z
      .string()
      .min(1, 'El nombre es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z
      .string()
      .min(1, 'El apellido es requerido')
      .min(2, 'El apellido debe tener al menos 2 caracteres'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Debes aceptar los términos y condiciones',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof SignupSchema>;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSignup() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrengthResult>(() => calculatePasswordStrength(''));

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onBlur',
  });

  /** Actualiza el strength meter cada vez que cambia el campo password */
  function handlePasswordChange(value: string) {
    setPasswordStrength(calculatePasswordStrength(value));
    form.setValue('password', value, { shouldValidate: form.formState.isSubmitted });
  }

  /** Envío del formulario */
  async function onSubmit(values: SignupFormValues) {
    setIsLoading(true);

    try {
      // Simulación de latencia de red (mock)
      await new Promise<void>((resolve) => setTimeout(resolve, 800));

      // Verificación de email único (mock vía localStorage)
      if (isEmailRegistered(values.email)) {
        form.setError('email', {
          type: 'manual',
          message: 'Este email ya está registrado',
        });
        return;
      }

      // Guardar usuario en mock store
      registerUser({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
      });

      toast({
        title: 'Cuenta creada exitosamente',
        description: `Bienvenido/a, ${values.firstName}. Ya podés iniciar sesión.`,
      });

      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    isLoading,
    passwordStrength,
    handlePasswordChange,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
