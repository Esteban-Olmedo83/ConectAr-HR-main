'use client';

import type { Client } from '@/lib/types/system-dev';
import { Edit2, Settings, Trash2, MapPin, Mail, Phone } from 'lucide-react';

interface ClientsListProps {
  clients: Client[];
  loading: boolean;
  onEditClient: (client: Client) => void;
  onEditSubscription: (client: Client) => void;
}

export function ClientsList({
  clients,
  loading,
  onEditClient,
  onEditSubscription,
}: ClientsListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
              Empresa
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
              Contacto
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
              Ubicación
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b border-border hover:bg-muted/30 transition">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-foreground">{client.companyName}</p>
                  <p className="text-sm text-muted-foreground">{client.companySlug}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {client.contactPerson && (
                    <p className="text-sm font-medium text-foreground">{client.contactPerson}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {client.contactEmail}
                  </div>
                  {client.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {client.contactPhone}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                {client.city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <p>{client.city}, {client.region}</p>
                      <p className="text-xs">{client.country}</p>
                    </div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  {/* TODO: Get plan name from subscription */}
                  <p className="font-medium text-foreground">Professional</p>
                  <p className="text-xs text-muted-foreground">$149/mes</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    client.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : client.status === 'suspended'
                      ? 'bg-yellow-100 text-yellow-800'
                      : client.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {client.status === 'active'
                    ? 'Activo'
                    : client.status === 'suspended'
                    ? 'Suspendido'
                    : client.status === 'cancelled'
                    ? 'Cancelado'
                    : 'Trial'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEditSubscription(client)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                    title="Cambiar plan"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditClient(client)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                    title="Editar cliente"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded"
                    title="Eliminar cliente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {clients.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay clientes registrados</p>
        </div>
      )}
    </div>
  );
}
