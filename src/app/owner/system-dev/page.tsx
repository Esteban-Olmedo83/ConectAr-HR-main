'use client';

import { useEffect, useState } from 'react';
import { ClientsList } from './components/ClientsList';
import { CreateClientModal } from './components/CreateClientModal';
import { EditClientModal } from './components/EditClientModal';
import { EditSubscriptionModal } from './components/EditSubscriptionModal';
import type { Client, SubscriptionPlan } from '@/lib/types/system-dev';

export default function SystemDevPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showEditSubscriptionModal, setShowEditSubscriptionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Fetch clients and plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientsRes, plansRes] = await Promise.all([
          fetch('/api/system-dev/clients'),
          fetch('/api/system-dev/plans'),
        ]);

        if (!clientsRes.ok || !plansRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const clientsData = await clientsRes.json();
        const plansData = await plansRes.json();

        setClients(clientsData.data || []);
        setPlans(plansData.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateClient = async (data: any) => {
    try {
      const response = await fetch('/api/system-dev/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create client');

      const result = await response.json();
      setClients([...clients, result.data]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleEditClient = async (data: any) => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/system-dev/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update client');

      const result = await response.json();
      setClients(clients.map(c => c.id === result.data.id ? result.data : c));
      setShowEditClientModal(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleEditSubscription = async (data: any) => {
    if (!selectedClient) return;

    try {
      const response = await fetch(
        `/api/system-dev/clients/${selectedClient.id}/subscription`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error('Failed to update subscription');

      // Refresh clients list
      const clientsRes = await fetch('/api/system-dev/clients');
      const clientsData = await clientsRes.json();
      setClients(clientsData.data || []);
      setShowEditSubscriptionModal(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sistema y Desarrollo</h1>
          <p className="text-muted-foreground">Gestión de Clientes y Planes de Suscripción</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Clients List */}
      <ClientsList
        clients={clients}
        loading={loading}
        onEditClient={(client) => {
          setSelectedClient(client);
          setShowEditClientModal(true);
        }}
        onEditSubscription={(client) => {
          setSelectedClient(client);
          setShowEditSubscriptionModal(true);
        }}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateClientModal
          plans={plans}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClient}
        />
      )}

      {showEditClientModal && selectedClient && (
        <EditClientModal
          client={selectedClient}
          onClose={() => {
            setShowEditClientModal(false);
            setSelectedClient(null);
          }}
          onSave={handleEditClient}
        />
      )}

      {showEditSubscriptionModal && selectedClient && (
        <EditSubscriptionModal
          client={selectedClient}
          plans={plans}
          onClose={() => {
            setShowEditSubscriptionModal(false);
            setSelectedClient(null);
          }}
          onSave={handleEditSubscription}
        />
      )}
    </div>
  );
}
