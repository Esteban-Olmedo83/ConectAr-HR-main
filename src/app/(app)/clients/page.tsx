
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function ClientsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline">Gestión de Clientes</h1>
      <p className="text-muted-foreground mt-2">
        Administra las empresas que utilizan el sistema.
      </p>
      <Card className="mt-6">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Building />
                Panel de Control de Empresas
            </CardTitle>
            <CardDescription>Módulo en construcción. Aquí podrás dar de alta, configurar y gestionar a tus clientes.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Próximamente...</p>
        </CardContent>
      </Card>
    </div>
  );
}
