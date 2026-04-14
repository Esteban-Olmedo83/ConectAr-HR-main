'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, Settings, Power } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const mockClients = [
  { id: '1', name: 'TechCorp SA', plan: 'Enterprise', users: 1250, status: 'Activo', nextBilling: '2024-08-01' },
  { id: '2', name: 'Innova Solutions', plan: 'Pro', users: 340, status: 'Activo', nextBilling: '2024-07-15' },
  { id: '3', name: 'Global Retail', plan: 'Starter', users: 85, status: 'Activo', nextBilling: '2024-07-20' },
  { id: '4', name: 'Fintech Latam', plan: 'Enterprise', users: 890, status: 'Suspendido', nextBilling: '-' },
  { id: '5', name: 'Agro Exports', plan: 'Pro', users: 150, status: 'Activo', nextBilling: '2024-08-05' },
];

export default function OwnerClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = mockClients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Clientes y Empresas</h1>
          <p className="text-muted-foreground mt-2">Gestiona el acceso, planes y módulos de las empresas cliente.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </header>

      <Card>
        <CardHeader className="py-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
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
                <TableHead>Empresa</TableHead>
                <TableHead>Plan Módulos</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Próx. Facturación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-semibold">{client.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.plan}</Badge>
                  </TableCell>
                  <TableCell>{client.users}</TableCell>
                  <TableCell>{client.nextBilling}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'Activo' ? 'default' : 'destructive'}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Suspender/Activar">
                        <Power className={`h-4 w-4 ${client.status === 'Activo' ? 'text-green-500' : 'text-red-500'}`} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Configurar Módulos">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
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
