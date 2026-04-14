'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, FileText } from 'lucide-react';

const mockInvoices = [
  { id: 'INV-001', client: 'TechCorp SA', amount: '$4,500', date: '2024-07-01', status: 'Pagada', due: '2024-07-15' },
  { id: 'INV-002', client: 'Innova Solutions', amount: '$1,200', date: '2024-07-02', status: 'Pendiente', due: '2024-07-16' },
  { id: 'INV-003', client: 'Global Retail', amount: '$850', date: '2024-07-05', status: 'Atrasada', due: '2024-07-05' },
  { id: 'INV-004', client: 'Agro Exports', amount: '$1,500', date: '2024-06-01', status: 'Pagada', due: '2024-06-15' },
  { id: 'INV-005', client: 'Fintech Latam', amount: '$3,800', date: '2024-06-05', status: 'Pagada', due: '2024-06-20' },
];

export default function OwnerBillingPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = mockInvoices.filter(inv => 
    inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Pagada': return 'default';
        case 'Pendiente': return 'secondary';
        case 'Atrasada': return 'destructive';
        default: return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Facturación Mensual</h1>
          <p className="text-muted-foreground mt-2">Historial de pagos, facturas emitidas y estado de cuentas de clientes.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Recurrente Mensual (MRR)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">$84,500</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Pendiente de Cobro</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-amber-500">$2,050</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Facturas Atrasadas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-destructive">1</div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Últimas Facturas</CardTitle>
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Buscar por cliente o N°..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell className="font-semibold">{inv.client}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.due}</TableCell>
                  <TableCell>{inv.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(inv.status)}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Ver Factura">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
