'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getSummary } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, FileText } from 'lucide-react';

const initialState = {
  message: '',
  summary: '',
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analizando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generar Resumen
        </>
      )}
    </Button>
  );
}

export default function AiAssistantPage() {
  const [state, formAction] = useFormState(getSummary, initialState);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Asistente IA</h1>
        <p className="text-muted-foreground mt-2">
          Utiliza la IA para obtener respuestas y análisis sobre RRHH.
        </p>
      </header>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <form action={formAction}>
            <CardHeader>
              <CardTitle className="font-headline">Análisis de Feedback</CardTitle>
              <CardDescription>
                Pega el texto de los comentarios de los empleados para generar un resumen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="feedbackText"
                aria-label="Caja de texto para comentarios"
                placeholder="Ej: 'El equipo está motivado pero necesita más claridad en los objetivos del sprint. La comunicación entre departamentos podría mejorar...'"
                rows={10}
                required
              />
              {state?.errors?.feedbackText && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {state.errors.feedbackText[0]}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Resumen Generado por IA</CardTitle>
            <CardDescription>
              Temas clave y áreas de mejora identificadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {state.summary ? (
              <div className="space-y-4 text-sm prose prose-sm max-w-none">
                {state.summary.split('\n').filter(line => line.trim() !== '').map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 rounded-lg border-2 border-dashed">
                <FileText className="w-12 h-12 mb-4" />
                <p>El resumen aparecerá aquí una vez generado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
