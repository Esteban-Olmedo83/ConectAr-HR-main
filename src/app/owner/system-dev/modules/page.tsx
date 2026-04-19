'use client';

import { useState } from 'react';
import { Puzzle, Power, PowerOff, Search, Info, Building2, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

// ─── Mock data ────────────────────────────────────────────────────────────────

interface SystemModule {
  key: string;
  label: string;
  description: string;
  icon: string;
  version: string;
  isActive: boolean;
  requires: string[];
}

interface Tenant {
  id: string;
  name: string;
  plan: string;
  modules: Record<string, boolean>;
}

const SYSTEM_MODULES: SystemModule[] = [
  { key: 'dashboard',          label: 'Dashboard',              description: 'Panel principal de indicadores KPIs',             icon: '📊', version: '1.0.0', isActive: true,  requires: [] },
  { key: 'employees',          label: 'Directorio de Empleados',description: 'Gestión completa del ciclo de vida del empleado',  icon: '👥', version: '1.0.0', isActive: true,  requires: [] },
  { key: 'attendance',         label: 'Asistencia',             description: 'Control de asistencia con geolocalización GPS',   icon: '🕐', version: '1.2.0', isActive: true,  requires: ['employees'] },
  { key: 'leave',              label: 'Licencias y Ausencias',  description: 'Gestión de vacaciones, licencias y ausencias',    icon: '📅', version: '1.0.0', isActive: true,  requires: ['employees'] },
  { key: 'payslips',           label: 'Recibos de Sueldo',      description: 'Generación y consulta digital de recibos',        icon: '💰', version: '1.1.0', isActive: true,  requires: ['employees'] },
  { key: 'recruitment',        label: 'Reclutamiento',          description: 'Pipeline de candidatos, ofertas y onboarding',    icon: '🎯', version: '1.0.0', isActive: true,  requires: [] },
  { key: 'organization-chart', label: 'Organigrama',            description: 'Estructura organizacional visual e interactiva',  icon: '🌳', version: '1.0.0', isActive: true,  requires: ['employees'] },
  { key: 'communications',     label: 'Comunicaciones',         description: 'Comunicados internos y mensajería por roles',     icon: '💬', version: '1.0.0', isActive: true,  requires: [] },
  { key: 'my-portal',          label: 'Portal del Empleado',    description: 'Autoservicio: recibos, licencias, asistencia',    icon: '👤', version: '1.0.0', isActive: true,  requires: ['employees'] },
  { key: 'community',          label: 'Comunidad',              description: 'Feed de novedades, reacciones y comentarios',     icon: '🌐', version: '1.0.0', isActive: true,  requires: [] },
];

const MOCK_TENANTS: Tenant[] = [
  {
    id: 'c0nec7ar-0001-0001-0001-000000000001',
    name: 'TechCorp Argentina',
    plan: 'Enterprise',
    modules: Object.fromEntries(SYSTEM_MODULES.map(m => [m.key, true])),
  },
  {
    id: 'c0nec7ar-0002-0002-0002-000000000002',
    name: 'Freelance Pro',
    plan: 'Starter',
    modules: { dashboard: true, employees: true, recruitment: true, community: false, attendance: false, leave: false, payslips: false, 'organization-chart': false, 'my-portal': true, communications: false },
  },
  {
    id: 'c0nec7ar-0003-0003-0003-000000000003',
    name: 'Distribuidora Sur',
    plan: 'Professional',
    modules: { dashboard: true, employees: true, attendance: true, leave: true, payslips: true, recruitment: false, 'organization-chart': true, communications: true, 'my-portal': true, community: false },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ModulesPage() {
  const [search, setSearch]           = useState('');
  const [selectedTenant, setSelected] = useState<string>('all');
  const [tenants, setTenants]         = useState<Tenant[]>(MOCK_TENANTS);
  const [confirmDialog, setConfirm]   = useState<{ tenantId: string; moduleKey: string; enabling: boolean } | null>(null);

  const filteredModules = SYSTEM_MODULES.filter(m =>
    m.label.toLowerCase().includes(search.toLowerCase()) ||
    m.key.toLowerCase().includes(search.toLowerCase())
  );

  function toggleModule(tenantId: string, moduleKey: string, enabling: boolean) {
    const mod = SYSTEM_MODULES.find(m => m.key === moduleKey);
    if (!mod) return;

    // Dependency check when disabling
    if (!enabling) {
      const dependents = SYSTEM_MODULES.filter(m => m.requires.includes(moduleKey));
      const tenant = tenants.find(t => t.id === tenantId);
      const activeDependents = dependents.filter(d => tenant?.modules[d.key]);
      if (activeDependents.length > 0) {
        alert(`No se puede desactivar "${mod.label}" porque los siguientes módulos dependen de él: ${activeDependents.map(d => d.label).join(', ')}`);
        return;
      }
    }

    setConfirm({ tenantId, moduleKey, enabling });
  }

  function confirmToggle() {
    if (!confirmDialog) return;
    const { tenantId, moduleKey, enabling } = confirmDialog;
    setTenants(prev => prev.map(t =>
      t.id === tenantId
        ? { ...t, modules: { ...t.modules, [moduleKey]: enabling } }
        : t
    ));
    setConfirm(null);
  }

  const activeTenants = selectedTenant === 'all' ? tenants : tenants.filter(t => t.id === selectedTenant);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
            <Puzzle className="h-6 w-6 text-primary" />
            Módulos del Sistema
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Activa o desactiva módulos por empresa cliente. Los cambios aplican en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="bg-green-500/10 text-green-600 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">
            {SYSTEM_MODULES.filter(m => m.isActive).length} módulos activos
          </span>
          <span className="bg-muted rounded-full px-2.5 py-0.5">
            {MOCK_TENANTS.length} clientes
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar módulo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedTenant} onValueChange={setSelected}>
          <SelectTrigger className="w-full sm:w-60">
            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar por empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las empresas</SelectItem>
            {MOCK_TENANTS.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Module grid */}
      <div className="space-y-4">
        {filteredModules.map(mod => (
          <Card key={mod.key} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mod.icon}</span>
                  <div>
                    <CardTitle className="text-base font-semibold">{mod.label}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{mod.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs">v{mod.version}</Badge>
                  {mod.requires.length > 0 && (
                    <Badge variant="secondary" className="text-xs hidden sm:flex">
                      Requiere: {mod.requires.join(', ')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="space-y-2">
                {activeTenants.map(tenant => {
                  const enabled = tenant.modules[mod.key] ?? false;
                  return (
                    <div key={tenant.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{tenant.name}</span>
                        <Badge variant="outline" className="text-xs py-0">{tenant.plan}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${enabled ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {enabled ? 'Activo' : 'Inactivo'}
                        </span>
                        <Switch
                          checked={enabled}
                          onCheckedChange={val => toggleModule(tenant.id, mod.key, val)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog?.enabling ? <Power className="inline h-4 w-4 mr-2 text-green-600" /> : <PowerOff className="inline h-4 w-4 mr-2 text-destructive" />}
              {confirmDialog?.enabling ? 'Activar módulo' : 'Desactivar módulo'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog && (() => {
                const mod    = SYSTEM_MODULES.find(m => m.key === confirmDialog.moduleKey);
                const tenant = tenants.find(t => t.id === confirmDialog.tenantId);
                return `¿Confirmar ${confirmDialog.enabling ? 'activación' : 'desactivación'} de "${mod?.label}" para "${tenant?.name}"?`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button
              variant={confirmDialog?.enabling ? 'default' : 'destructive'}
              onClick={confirmToggle}
            >
              <Check className="h-4 w-4 mr-2" /> Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
