'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDriveDownload } from "lucide-react";

export default function BackupPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">Generar Backup</h1>
                <p className="text-muted-foreground mt-2">
                    Crea y descarga copias de seguridad de la información clave de tu sistema.
                </p>
            </header>

            <Card>
                <CardHeader className="text-center">
                    <HardDriveDownload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <CardTitle>Módulo en Construcción</CardTitle>
                    <CardDescription>
                        Esta funcionalidad se encuentra temporalmente deshabilitada para asegurar la estabilidad de la aplicación. Estará disponible próximamente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-muted-foreground">Lamentamos las molestias.</p>
                </CardContent>
            </Card>
        </div>
    );
}
