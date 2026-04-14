'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, PlusCircle, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from 'react';
import { getSession, Session } from '@/lib/session';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { mockEmployees } from '@/lib/mock-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';


const payslips = [
  { id: 'slip-06-2024', employeeId: 'emp-1', period: 'Junio 2024', date: '05/07/2024', amount: '$ 1,250,000.00', status: 'Pagado' },
  { id: 'slip-05-2024', employeeId: 'emp-1', period: 'Mayo 2024', date: '05/06/2024', amount: '$ 1,250,000.00', status: 'Pagado' },
  { id: 'slip-04-2024', employeeId: 'emp-1', period: 'Abril 2024', date: '05/05/2024', amount: '$ 1,100,000.00', status: 'Pagado' },
  { id: 'slip-03-2024', employeeId: 'emp-1', period: 'Marzo 2024', date: '05/04/2024', amount: '$ 1,100,000.00', status: 'Pagado' },
  { id: 'slip-02-2024', employeeId: 'emp-1', period: 'Febrero 2024', date: '05/03/2024', amount: '$ 1,100,000.00', status: 'Pagado' },
  { id: 'slip-01-2024', employeeId: 'emp-2', period: 'Junio 2024', date: '05/07/2024', amount: '$ 800,000.00', status: 'Pagado' },
  { id: 'slip-01-2024-3', employeeId: 'emp-3', period: 'Junio 2024', date: '05/07/2024', amount: '$ 1,500,000.00', status: 'Pendiente' },
];

export default function PayslipsPageContent() {
  const [session, setSession] = useState<Session | null>(null);
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) return <div>Cargando...</div>;

  const isMyPortal = pathname.includes('/my-portal');
  const isAdminView = (session.role === 'admin' || session.role === 'owner') && !isMyPortal;

  // Si es empleado o está en "Mi Portal", solo ve los suyos (mockeamos que emp-1 es el usuario actual si no hay coincidencia exacta para propósitos de demo, sino filtramos por su ID real).
  let filteredPayslips = payslips;
  
  if (!isAdminView) {
     filteredPayslips = payslips.filter(p => p.employeeId === session.userId || p.employeeId === 'emp-1');
  } else {
     if (searchTerm) {
        filteredPayslips = filteredPayslips.filter(p => {
             const emp = mockEmployees.find(e => e.id === p.employeeId);
             return emp?.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
     }
     if (selectedPeriod !== 'all') {
         filteredPayslips = filteredPayslips.filter(p => p.period === selectedPeriod);
     }
  }

  const periods = Array.from(new Set(payslips.map(p => p.period)));
  return (
    <div className="space-y-8">
       <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">{isAdminView ? 'Nómina y Liquidaciones' : 'Recibos de Sueldo'}</h1>
                <p className="text-muted-foreground mt-2">
                    {isAdminView ? 'Gestiona las liquidaciones de sueldo de toda la empresa.' : 'Accede a tu historial de liquidaciones de sueldo.'}
                </p>
            </div>
            {isAdminView && (
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Liquidación
                </Button>
            )}
        </header>

        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="flex items-center gap-2"><FileText /> {isAdminView ? 'Registro de Recibos' : 'Historial de Recibos'}</CardTitle>
                    <CardDescription>{isAdminView ? 'Filtra y revisa los recibos emitidos.' : 'Aquí puedes ver y descargar tus últimos recibos de sueldo.'}</CardDescription>
                </div>
                {isAdminView && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Períodos</SelectItem>
                                {periods.map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                            placeholder="Buscar empleado..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {isAdminView && <TableHead>Empleado</TableHead>}
                            <TableHead>Período</TableHead>
                            <TableHead>Fecha de Pago</TableHead>
                            <TableHead>Monto Neto</TableHead>
                            {isAdminView && <TableHead>Estado</TableHead>}
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayslips.map((slip, i) => {
                            const emp = mockEmployees.find(e => e.id === slip.employeeId);
                            return (
                            <TableRow key={slip.id + i}>
                                {isAdminView && <TableCell className="font-semibold">{emp?.name || slip.employeeId}</TableCell>}
                                <TableCell className="font-medium">{slip.period}</TableCell>
                                <TableCell>{slip.date}</TableCell>
                                <TableCell>{slip.amount}</TableCell>
                                {isAdminView && (
                                    <TableCell>
                                        <Badge variant={slip.status === 'Pagado' ? 'default' : 'secondary'}>{slip.status}</Badge>
                                    </TableCell>
                                )}
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Descargar
                                    </Button>
                                </TableCell>
                            </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
