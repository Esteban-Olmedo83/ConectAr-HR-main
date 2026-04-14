'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSession, Session } from '@/lib/session';
import { mockEmployees, initialRequests } from '@/lib/mock-data';
import { User, Calendar, Receipt, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MyPortalDashboard() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) return <div>Cargando...</div>;

  const employee = mockEmployees.find(e => e.id === session.userId);
  const myRequests = initialRequests.filter(req => req.employeeId === session.userId).slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold font-headline">¡Hola, {session.userName?.split(' ')[0] || 'Usuario'}!</h2>
        <p className="text-muted-foreground mt-1">Aquí tienes un resumen de tu información laboral.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Departamento</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold">{employee?.empresa.dependencia || 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">{employee?.empresa.sector || 'N/A'}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Próximo Recibo</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold">Disponible pronto</div>
                <p className="text-xs text-muted-foreground mt-1">Periodo actual en curso</p>
                 <Button variant="link" className="px-0 h-auto text-xs mt-2" asChild>
                    <Link href="/my-portal/payslips">Ver anteriores</Link>
                </Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Días de Vacaciones</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold">14 días disponibles</div>
                <p className="text-xs text-muted-foreground mt-1">Correspondientes a 2024</p>
                <Button variant="link" className="px-0 h-auto text-xs mt-2" asChild>
                    <Link href="/my-portal/leaves">Solicitar días</Link>
                </Button>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Últimas Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
             {myRequests.length > 0 ? (
                <div className="space-y-4">
                    {myRequests.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{req.type}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(req.startDate), 'dd MMM yyyy', { locale: es })}
                                    </p>
                                </div>
                            </div>
                            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                                req.status === 'Aprobado' ? 'bg-green-100 text-green-800' :
                                req.status === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {req.status}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No tienes solicitudes recientes.</p>
            )}
            <div className="mt-4 text-center">
                 <Button variant="outline" size="sm" asChild>
                    <Link href="/my-portal/leaves">Ver todas las solicitudes</Link>
                 </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
