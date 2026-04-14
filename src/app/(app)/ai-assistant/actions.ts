'use server';

import { z } from 'zod';

const schema = z.object({
  feedbackText: z.string().min(1, { message: 'El feedback no puede estar vacío.' }),
});

interface FormState {
    message: string;
    summary: string;
    errors: {
        feedbackText?: string[];
    } | null;
}

export async function getSummary(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = schema.safeParse({
    feedbackText: formData.get('feedbackText'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error de validación.',
      errors: validatedFields.error.flatten().fieldErrors,
      summary: '',
    };
  }
  
  // TODO: Implementar el flujo de IA para el resumen.
  console.log("Texto de feedback recibido:", validatedFields.data.feedbackText);

  // Simulación de respuesta de IA por ahora.
  const summary = `El análisis del feedback indica una alta motivación general en el equipo, pero resalta la necesidad de mayor claridad en los objetivos. La comunicación interdepartamental es un área clave de mejora. Se sugiere implementar reuniones de sincronización semanales.`;
  
  return {
    message: 'Resumen generado.',
    summary: summary,
    errors: null,
  };
}
