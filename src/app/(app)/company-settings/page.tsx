import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompanySettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline">Configuración de la Empresa</h1>
      <p className="text-muted-foreground mt-2">
        Módulo en construcción.
      </p>
      <Card className="mt-6">
        <CardHeader>
            <CardTitle>Datos de la Empresa</CardTitle>
            <CardDescription>Gestiona la información de tu organización.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Próximamente...</p>
        </CardContent>
      </Card>
    </div>
  );
}
