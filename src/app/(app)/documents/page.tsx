import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline">Gestión de Documentos</h1>
      <p className="text-muted-foreground mt-2">
        Módulo en construcción.
      </p>
      <Card className="mt-6">
        <CardHeader>
            <CardTitle>Repositorio de Documentos</CardTitle>
            <CardDescription>Encuentra políticas, manuales y más.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Próximamente...</p>
        </CardContent>
      </Card>
    </div>
  );
}
