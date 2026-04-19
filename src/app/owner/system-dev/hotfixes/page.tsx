'use client';

import { useState } from 'react';
import {
  Zap, Plus, Globe, Building2, Bug, Sparkles, Shield, Gauge,
  ChevronDown, ChevronUp, Send, RotateCcw, Calendar, Tag,
  CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

type HotfixType   = 'bugfix' | 'feature' | 'security' | 'performance';
type HotfixScope  = 'global' | 'specific';
type HotfixStatus = 'draft' | 'published' | 'rolled_back';

interface Hotfix {
  id: string;
  title: string;
  description: string;
  type: HotfixType;
  scope: HotfixScope;
  status: HotfixStatus;
  version: string;
  changelog: string;
  targetTenants: string[];
  targetModules: string[];
  publishedAt: string | null;
  createdAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const TENANTS = [
  { id: 'c0nec7ar-0001', name: 'TechCorp Argentina' },
  { id: 'c0nec7ar-0002', name: 'Freelance Pro' },
  { id: 'c0nec7ar-0003', name: 'Distribuidora Sur' },
];

const MODULES = [
  'dashboard', 'employees', 'attendance', 'leave', 'payslips',
  'recruitment', 'organization-chart', 'communications', 'my-portal', 'community',
];

const INITIAL_HOTFIXES: Hotfix[] = [
  {
    id: 'hf-001', title: 'Fix validación GPS Home Office',
    description: 'Corrige un bug donde el modo Home Office no guardaba correctamente la sucursal virtual.',
    type: 'bugfix', scope: 'global', status: 'published', version: '1.2.1',
    changelog: '- Corregida la persistencia de `isVirtual` en el registro de asistencia\n- Fix UI badge en modo Home Office',
    targetTenants: [], targetModules: ['attendance'],
    publishedAt: '2026-04-15T10:00:00Z', createdAt: '2026-04-14T09:00:00Z',
  },
  {
    id: 'hf-002', title: 'Mejora de rendimiento — Directorio de Empleados',
    description: 'Optimización de queries en el listado de empleados para empresas con más de 500 registros.',
    type: 'performance', scope: 'global', status: 'published', version: '1.2.2',
    changelog: '- Paginación del lado del servidor\n- Índices B-tree en campos de búsqueda frecuentes',
    targetTenants: [], targetModules: ['employees'],
    publishedAt: '2026-04-17T14:00:00Z', createdAt: '2026-04-16T11:00:00Z',
  },
  {
    id: 'hf-003', title: 'Parche de seguridad — Rate Limiting',
    description: 'Implementación de rate limiting avanzado con backoff exponencial en endpoints de autenticación.',
    type: 'security', scope: 'global', status: 'draft', version: '1.3.0',
    changelog: '- Rate limit 5 req/15min en /api/auth/*\n- Bloqueo progresivo para IPs reincidentes',
    targetTenants: [], targetModules: [],
    publishedAt: null, createdAt: '2026-04-18T08:00:00Z',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<HotfixType, { label: string; color: string; icon: React.ElementType }> = {
  bugfix:      { label: 'Bug Fix',      color: 'bg-red-500/10 text-red-600 border-red-200',        icon: Bug },
  feature:     { label: 'Feature',      color: 'bg-blue-500/10 text-blue-600 border-blue-200',      icon: Sparkles },
  security:    { label: 'Seguridad',    color: 'bg-orange-500/10 text-orange-600 border-orange-200',icon: Shield },
  performance: { label: 'Rendimiento',  color: 'bg-purple-500/10 text-purple-600 border-purple-200',icon: Gauge },
};

const STATUS_CONFIG: Record<HotfixStatus, { label: string; icon: React.ElementType; color: string }> = {
  draft:       { label: 'Borrador',    icon: Clock,         color: 'text-muted-foreground' },
  published:   { label: 'Publicado',   icon: CheckCircle2,  color: 'text-green-600' },
  rolled_back: { label: 'Revertido',   icon: AlertCircle,   color: 'text-destructive' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface FormState {
  title: string; description: string; type: HotfixType; scope: HotfixScope;
  version: string; changelog: string; targetTenants: string[]; targetModules: string[];
}

const EMPTY_FORM: FormState = {
  title: '', description: '', type: 'feature', scope: 'global',
  version: '', changelog: '', targetTenants: [], targetModules: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HotfixesPage() {
  const [hotfixes, setHotfixes]         = useState<Hotfix[]>(INITIAL_HOTFIXES);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState<FormState>(EMPTY_FORM);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [publishConfirm, setPublish]    = useState<string | null>(null);
  const [rollbackConfirm, setRollback]  = useState<string | null>(null);

  function toggleModule(mod: string) {
    setForm(f => ({
      ...f,
      targetModules: f.targetModules.includes(mod)
        ? f.targetModules.filter(m => m !== mod)
        : [...f.targetModules, mod],
    }));
  }

  function toggleTenant(id: string) {
    setForm(f => ({
      ...f,
      targetTenants: f.targetTenants.includes(id)
        ? f.targetTenants.filter(t => t !== id)
        : [...f.targetTenants, id],
    }));
  }

  function saveDraft() {
    if (!form.title.trim() || !form.version.trim()) return;
    const newHotfix: Hotfix = {
      id: `hf-${Date.now()}`,
      ...form,
      status: 'draft',
      publishedAt: null,
      createdAt: new Date().toISOString(),
    };
    setHotfixes(prev => [newHotfix, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function publishHotfix(id: string) {
    setHotfixes(prev => prev.map(h =>
      h.id === id ? { ...h, status: 'published', publishedAt: new Date().toISOString() } : h
    ));
    setPublish(null);
  }

  function rollbackHotfix(id: string) {
    setHotfixes(prev => prev.map(h =>
      h.id === id ? { ...h, status: 'rolled_back' } : h
    ));
    setRollback(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            HotFixes y Actualizaciones
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Publica mejoras, parches y nuevas funcionalidades a empresas específicas o a todo el sistema.
          </p>
        </div>
        <Button onClick={() => setShowForm(s => !s)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo HotFix
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['bugfix', 'feature', 'security', 'performance'] as HotfixType[]).map(type => {
          const cfg   = TYPE_CONFIG[type];
          const count = hotfixes.filter(h => h.type === type).length;
          return (
            <Card key={type} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${cfg.color}`}>
                  <cfg.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Nuevo HotFix</CardTitle>
            <CardDescription>Completa los campos y guarda como borrador antes de publicar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input placeholder="Ej: Fix validación de email" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Versión *</Label>
                <Input placeholder="Ej: 1.3.1" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea rows={3} placeholder="Qué se corrigió / mejoró y por qué..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as HotfixType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Alcance</Label>
                <Select value={form.scope} onValueChange={v => setForm(f => ({ ...f, scope: v as HotfixScope, targetTenants: [] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global"><Globe className="inline h-3.5 w-3.5 mr-2" />Global (todas las empresas)</SelectItem>
                    <SelectItem value="specific"><Building2 className="inline h-3.5 w-3.5 mr-2" />Específico (seleccionar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.scope === 'specific' && (
              <div className="space-y-2">
                <Label>Empresas objetivo</Label>
                <div className="flex flex-col gap-2">
                  {TENANTS.map(t => (
                    <div key={t.id} className="flex items-center gap-2">
                      <Checkbox checked={form.targetTenants.includes(t.id)} onCheckedChange={() => toggleTenant(t.id)} id={`tenant-${t.id}`} />
                      <label htmlFor={`tenant-${t.id}`} className="text-sm cursor-pointer">{t.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Módulos afectados (opcional)</Label>
              <div className="flex flex-wrap gap-2">
                {MODULES.map(mod => (
                  <button
                    key={mod}
                    onClick={() => toggleModule(mod)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.targetModules.includes(mod)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Changelog</Label>
              <Textarea rows={4} placeholder="- Cambio 1&#10;- Cambio 2" value={form.changelog} onChange={e => setForm(f => ({ ...f, changelog: e.target.value }))} className="font-mono text-sm" />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Cancelar</Button>
              <Button onClick={saveDraft} disabled={!form.title.trim() || !form.version.trim()}>
                Guardar Borrador
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotfix list */}
      <div className="space-y-3">
        {hotfixes.map(hf => {
          const typeCfg   = TYPE_CONFIG[hf.type];
          const statusCfg = STATUS_CONFIG[hf.status];
          const isExpanded = expandedId === hf.id;

          return (
            <Card key={hf.id} className="border-border/50">
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : hf.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`mt-0.5 p-1.5 rounded-md border flex-shrink-0 ${typeCfg.color}`}>
                      <typeCfg.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-sm font-semibold">{hf.title}</CardTitle>
                        <Badge variant="outline" className="text-xs py-0">{hf.version}</Badge>
                        {hf.scope === 'global' ? (
                          <Badge variant="secondary" className="text-xs py-0 gap-1"><Globe className="h-2.5 w-2.5" />Global</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs py-0 gap-1"><Building2 className="h-2.5 w-2.5" />{hf.targetTenants.length} empresa(s)</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{hf.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`flex items-center gap-1 text-xs font-medium ${statusCfg.color}`}>
                      <statusCfg.icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{statusCfg.label}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <>
                  <Separator />
                  <CardContent className="pt-4 space-y-4">
                    {hf.changelog && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Changelog</p>
                        <pre className="text-sm bg-muted rounded-lg p-3 font-mono whitespace-pre-wrap">{hf.changelog}</pre>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Creado: {formatDate(hf.createdAt)}</span>
                      {hf.publishedAt && <span className="flex items-center gap-1"><Send className="h-3.5 w-3.5" />Publicado: {formatDate(hf.publishedAt)}</span>}
                      {hf.targetModules.length > 0 && (
                        <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" />Módulos: {hf.targetModules.join(', ')}</span>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end">
                      {hf.status === 'draft' && (
                        <Button size="sm" onClick={() => setPublish(hf.id)} className="gap-2">
                          <Send className="h-3.5 w-3.5" /> Publicar
                        </Button>
                      )}
                      {hf.status === 'published' && (
                        <Button size="sm" variant="destructive" onClick={() => setRollback(hf.id)} className="gap-2">
                          <RotateCcw className="h-3.5 w-3.5" /> Revertir
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Publish confirm */}
      <Dialog open={!!publishConfirm} onOpenChange={() => setPublish(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="h-4 w-4 text-primary" />Publicar HotFix</DialogTitle>
            <DialogDescription>
              {publishConfirm && (() => {
                const hf = hotfixes.find(h => h.id === publishConfirm);
                return `¿Publicar "${hf?.title}" ${hf?.scope === 'global' ? 'a TODAS las empresas' : `a ${hf?.targetTenants.length} empresa(s) seleccionada(s)`}?`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublish(null)}>Cancelar</Button>
            <Button onClick={() => publishConfirm && publishHotfix(publishConfirm)}>
              <Send className="h-4 w-4 mr-2" /> Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rollback confirm */}
      <Dialog open={!!rollbackConfirm} onOpenChange={() => setRollback(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-destructive" />Revertir HotFix</DialogTitle>
            <DialogDescription>
              Esta acción marcará el HotFix como revertido. Deberás notificar manualmente a los clientes afectados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollback(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => rollbackConfirm && rollbackHotfix(rollbackConfirm)}>
              <RotateCcw className="h-4 w-4 mr-2" /> Revertir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
