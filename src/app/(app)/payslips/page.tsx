'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, PlusCircle, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from 'react';
import { getSession, Session } from '@/lib/session';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { PayrollRow } from '@/lib/services/payroll.service';

const MONTH_NAMES: Record<string, string> = {
  '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
  '05': 'Mayo',  '06': 'Junio',   '07': 'Julio', '08': 'Agosto',
  '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
};

function formatPeriod(period: string) {
  const [year, month] = period.split('-');
  return `${MONTH_NAMES[month] ?? month} ${year}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
}

export default function PayslipsPageContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [payrollRows, setPayrollRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s) return;

    const url = (s.role === 'employee')
      ? `/api/payroll?employeeId=${s.userId}`
      : '/api/payroll';

    fetch(url)
      .then(r => r.json())
      .then(d => setPayrollRows(d.payrolls ?? []))
      .catch(() => setPayrollRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (!session || loading) return <div className="p-8 text-muted-foreground">Cargando...</div>;

  const isMyPortal = pathname.includes('/my-portal');
  const isAdminView = (session.role === 'admin' || session.role === 'owner') && !isMyPortal;

  let filtered = payrollRows;

  if (isAdminView) {
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const name = `${p.employees?.first_name ?? ''} ${p.employees?.last_name ?? ''}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
      });
    }
    if (selectedPeriod !== 'all') {
      filtered = filtered.filter(p => p.payroll_period === selectedPeriod);
    }
  }

  const periods = Array.from(new Set(payrollRows.map(p => p.payroll_period))).sort().reverse();

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
            <CardDescription>
              {isAdminView
                ? `${filtered.length} liquidaciones encontradas.`
                : 'Aquí puedes ver y descargar tus últimos recibos de sueldo.'}
            </CardDescription>
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
                    <SelectItem key={p} value={p}>{formatPeriod(p)}</SelectItem>
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
                {isAdminView && <TableHead>Departamento</TableHead>}
                <TableHead>Período</TableHead>
                <TableHead>Fecha de Pago</TableHead>
                <TableHead>Sueldo Bruto</TableHead>
                <TableHead>Monto Neto</TableHead>
                {isAdminView && <TableHead>Estado</TableHead>}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  {isAdminView && (
                    <TableCell className="font-semibold">
                      {row.employees ? `${row.employees.first_name} ${row.employees.last_name}` : row.employee_id}
                    </TableCell>
                  )}
                  {isAdminView && (
                    <TableCell className="text-muted-foreground text-sm">
                      {row.employees?.departments?.name ?? '-'}
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{formatPeriod(row.payroll_period)}</TableCell>
                  <TableCell>{row.paid_at ? new Date(row.paid_at).toLocaleDateString('es-AR') : '-'}</TableCell>
                  <TableCell>{formatCurrency(row.gross_salary)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(row.net_salary)}</TableCell>
                  {isAdminView && (
                    <TableCell>
                      <Badge variant={row.status === 'paid' ? 'default' : 'secondary'}>
                        {row.status === 'paid' ? 'Pagado' : row.status === 'pending' ? 'Pendiente' : row.status}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No se encontraron liquidaciones
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
