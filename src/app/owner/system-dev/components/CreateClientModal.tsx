'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { SubscriptionPlan } from '@/lib/types/system-dev';

interface CreateClientModalProps {
  plans: SubscriptionPlan[];
  onClose: () => void;
  onCreate: (data: any) => void;
}

export function CreateClientModal({ plans, onClose, onCreate }: CreateClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companySlug: '',
    contactEmail: '',
    contactPerson: '',
    contactPhone: '',
    country: '',
    region: '',
    city: '',
    planId: plans[0]?.id || '',
    modules: [] as string[],
  });

  const selectedPlan = plans.find(p => p.id === formData.planId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreate({
        ...formData,
        modules: selectedPlan?.modules || [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Crear Nuevo Cliente</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos de Empresa */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Datos de la Empresa</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.companySlug}
                  onChange={(e) =>
                    setFormData({ ...formData, companySlug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="empresa-name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Datos de Contacto */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Datos de Contacto</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Persona de Contacto
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Ubicación</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  País
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Región/Estado
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Plan de Suscripción */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Plan de Suscripción</h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plan *
              </label>
              <select
                value={formData.planId}
                onChange={(e) =>
                  setFormData({ ...formData, planId: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg"
                required
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${(plan.costCents / 100).toFixed(2)}/mes
                  </option>
                ))}
              </select>
            </div>

            {selectedPlan && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">
                  Módulos incluidos:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPlan.modules.map((module) => (
                    <span
                      key={module}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {module}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
