import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline">Eventos y Cumpleaños</h1>
      <p className="text-muted-foreground mt-2">
        Módulo en construcción.
      </p>
       <Card className="mt-6">
        <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>No te pierdas ninguna celebración.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Próximamente...</p>
        </CardContent>
      </Card>
    </div>
  );
}
