import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

const reviews = [
  {
    id: '1',
    employee: 'Ana López',
    avatar: 'https://placehold.co/40x40.png',
    period: 'Q2 2024',
    status: 'Completado',
    selfAssessment: 'Creo que he tenido un buen trimestre, especialmente liderando el rediseño de la landing page. Me gustaría mejorar mis habilidades en testing automatizado.',
    managerFeedback: 'Ana ha demostrado un liderazgo excepcional en el proyecto de rediseño. Su rendimiento ha sido excelente. Coincidimos en la necesidad de enfocarse en el testing para el próximo ciclo.',
  },
  {
    id: '2',
    employee: 'Carlos García',
    avatar: 'https://placehold.co/40x40.png',
    period: 'Q2 2024',
    status: 'Pendiente de Manager',
    selfAssessment: 'He cumplido todos mis objetivos de diseño para el Q2. Me siento orgulloso del nuevo sistema de diseño que implementamos. Estoy listo para asumir más responsabilidades.',
    managerFeedback: null,
  },
   {
    id: '3',
    employee: 'Juan Martínez',
    avatar: 'https://placehold.co/40x40.png',
    period: 'Q2 2024',
    status: 'Pendiente de Empleado',
    selfAssessment: null,
    managerFeedback: null,
  },
];

const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completado': return 'default';
      case 'Pendiente de Manager': return 'secondary';
      case 'Pendiente de Empleado': return 'outline';
      default: return 'secondary';
    }
  }

export default function DevelopmentPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Evaluaciones de Desempeño</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona y revisa los ciclos de evaluación de desempeño.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Evaluación
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Evaluaciones Actuales</CardTitle>
          <CardDescription>Ciclo de evaluación del Q2 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {reviews.map((review) => (
              <AccordionItem value={`item-${review.id}`} key={review.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-4 w-full">
                    <Avatar>
                      <AvatarImage src={review.avatar} alt={review.employee} data-ai-hint="person face" />
                      <AvatarFallback>{review.employee.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{review.employee}</p>
                      <p className="text-sm text-muted-foreground">{review.period}</p>
                    </div>
                    <Badge variant={getBadgeVariant(review.status)}>{review.status}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-16">
                  <div>
                    <h4 className="font-semibold mb-2">Autoevaluación del Empleado</h4>
                    <p className="text-muted-foreground italic">
                      {review.selfAssessment || 'Pendiente de completar.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Comentarios del Manager</h4>
                     <p className="text-muted-foreground italic">
                      {review.managerFeedback || 'Pendiente de completar.'}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
