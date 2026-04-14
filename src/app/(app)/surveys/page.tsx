'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

const surveys = [
  {
    id: 1,
    title: "Encuesta de Clima Laboral Q3 2024",
    description: "Tu opinión es clave para seguir mejorando. Tómate unos minutos para completar esta encuesta anónima.",
    status: "Pendiente",
    dueDate: "31 de Agosto, 2024",
  },
  {
    id: 2,
    title: "Feedback sobre Beneficios Corporativos",
    description: "Queremos saber qué beneficios valoras más y qué nuevas opciones te gustaría tener.",
    status: "Pendiente",
    dueDate: "15 de Agosto, 2024",
  },
  {
    id: 3,
    title: "Encuesta de Clima Laboral Q2 2024",
    description: "Gracias por tu participación. Los resultados han sido compartidos en la última reunión general.",
    status: "Completada",
    dueDate: "31 de Mayo, 2024",
  },
];


export default function SurveysPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Encuestas de Clima</h1>
        <p className="text-muted-foreground mt-2">
          Tu voz es importante. Participa en nuestras encuestas para ayudarnos a mejorar.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <Card key={survey.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="font-headline">{survey.title}</CardTitle>
                <Badge variant={survey.status === 'Completada' ? 'default' : 'secondary'}>
                  {survey.status === 'Completada' ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                  {survey.status}
                </Badge>
              </div>
              <CardDescription>Fecha Límite: {survey.dueDate}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-sm">{survey.description}</p>
            </CardContent>
            <CardFooter>
              {survey.status === 'Pendiente' ? (
                <Button className="w-full">Comenzar Encuesta</Button>
              ) : (
                <Button variant="secondary" className="w-full">Ver Resultados</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
