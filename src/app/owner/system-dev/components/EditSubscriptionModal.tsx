'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Client, SubscriptionPlan } from '@/lib/types/system-dev';

interface EditSubscriptionModalProps {
  client: Client;
  plans: SubscriptionPlan[];
  onClose: () => void;
  onSave: (data: any) => void;
}

export function EditSubscriptionModal({
  client,
  plans,
  onClose,
  onSave,
}: EditSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const allAvailableModules = selectedPlan?.modules || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave({
        planId: selectedPlanId,
        modules: selectedModules.length > 0 ? selectedModules : allAvailableModules,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (module: string) => {
    setSelectedModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Cambiar Plan de Suscripción</h2>
            <p className="text-sm text-muted-foreground mt-1">{client.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Seleccionar Plan</h3>

            <div className="grid grid-cols-1 gap-4">
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition ${
                    selectedPlanId === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selectedPlanId === plan.id}
                    onChange={(e) => {
                      setSelectedPlanId(e.target.value);
                      setSelectedModules(plan.modules);
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{plan.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                    <p className="text-lg font-bold text-primary mt-2">
                      ${(plan.costCents / 100).toFixed(2)}/mes
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {plan.modules.map((module) => (
                        <span
                          key={module}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                        >
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Modules Selection */}
          {selectedPlan && selectedModules.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="font-semibold text-foreground">
                Módulos Incluidos ({selectedModules.length}/{allAvailableModules.length})
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {allAvailableModules.map((module) => (
                  <label
                    key={module}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module)}
                      onChange={() => toggleModule(module)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-foreground capitalize">
                      {module}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Resumen del cambio:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Plan actual: Professional ($149/mes)</p>
              <p>Nuevo plan: {selectedPlan?.name} (${(selectedPlan?.costCents || 0) / 100}/mes)</p>
              <p className="text-primary font-medium">
                {selectedPlan?.costCents || 0 > 14900
                  ? `+ $${((selectedPlan?.costCents || 0) - 14900) / 100}/mes`
                  : selectedPlan?.costCents || 0 < 14900
                  ? `- $${(14900 - (selectedPlan?.costCents || 0)) / 100}/mes`
                  : 'Sin cambios'}
              </p>
            </div>
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
              {loading ? 'Actualizando...' : 'Cambiar Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
