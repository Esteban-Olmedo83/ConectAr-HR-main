'use client';

import { useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, PlusCircle, Settings, Power, Mail, Building2,
  Clock, Copy, CheckCircle2, Loader2, XCircle, Trash2, Send,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: string; name: string; plan: string; users: number;
  status: 'Activo' | 'Suspendido'; nextBilling: string;
}

interface Invitation {
  id: string; companyName: string; adminEmail: string; plan: string;
  modules: string[]; status: 'pending' | 'activated' | 'expired';
  expiresAt: string; createdAt: string;
  devUrl?: string; // only in dev
}

// ─── Mock active clients ─────────────────────────────────────────────────────

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'TechCorp SA',      plan: 'Enterprise',    users: 1250, status: 'Activo',    nextBilling: '2024-08-01' },
  { id: '2', name: 'Innova Solutions', plan: 'Professional',  users: 340,  status: 'Activo',    nextBilling: '2024-07-15' },
  { id: '3', name: 'Global Retail',    plan: 'Starter',       users: 85,   status: 'Activo',    nextBilling: '2024-07-20' },
  { id: '4', name: 'Fintech Latam',    plan: 'Enterprise',    users: 890,  status: 'Suspendido',nextBilling: '-' },
  { id: '5', name: 'Agro Exports',     plan: 'Professional',  users: 150,  status: 'Activo',    nextBilling: '2024-08-05' },
];

const SYSTEM_MODULES = [
  { key: 'employees',          label: 'Directorio de Empleados' },
  { key: 'attendance',         label: 'Asistencia' },
  { key: 'leave',              label: 'Licencias y Ausencias' },
  { key: 'payslips',           label: 'Recibos de Sueldo' },
  { key: 'recruitment',        label: 'Reclutamiento' },
  { key: 'organization-chart', label: 'Organigrama' },
  { key: 'communications',     label: 'Comunicaciones' },
  { key: 'my-portal',          label: 'Portal del Empleado' },
  { key: 'community',          label: 'Comunidad' },
];

const PLAN_DEFAULTS: Record<string, string[]> = {
  starter:      ['employees', 'my-portal'],
  professional: ['employees', 'attendance', 'leave', 'payslips', 'my-portal'],
  enterprise:   SYSTEM_MODULES.map(m => m.key),
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OwnerClientsPage() {
  const [search,      setSearch]      = useState('');
  const [clients,     setClients]     = useState<Client[]>(MOCK_CLIENTS);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInvite,  setShowInvite]  = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [adminEmail,  setAdminEmail]  = useState('');
  const [plan,        setPlan]        = useState('professional');
  const [modules,     setModules]     = useState<string[]>(PLAN_DEFAULTS.professional);
  const [submitting,  setSubmitting]  = useState(false);
  const [formError,   setFormError]   = useState('');
  const [lastDevUrl,  setLastDevUrl]  = useState<string | null>(null);
  const [copied,      setCopied]      = useState(false);

  function toggleModule(key: string) {
    setModules(prev => prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]);
  }

  function onPlanChange(val: string) {
    setPlan(val);
    setModules(PLAN_DEFAULTS[val] ?? []);
  }

  function resetForm() {
    setCompanyName(''); setAdminEmail(''); setPlan('professional');
    setModules(PLAN_DEFAULTS.professional); setFormError(''); setLastDevUrl(null);
  }

  async function handleSendInvitation() {
    setFormError('');
    if (!companyName.trim()) { setFormError('Ingresá el nombre de la empresa.'); return; }
    if (!adminEmail.trim())  { setFormError('Ingresá el email del administrador.'); return; }
    if (modules.length === 0){ setFormError('Seleccioná al menos un módulo.'); return; }

    setSubmitting(true);
    try {
      const res  = await fetch('/api/owner/invite-client', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, adminEmail, plan, modules }),
      });
      const data = await res.json();

      if (!res.ok) { setFormError(data.error ?? 'Error al enviar la invitación.'); return; }

      const newInv: Invitation = {
        id:          data.id,
        companyName: companyName.trim(),
        adminEmail:  adminEmail.trim().toLowerCase(),
        plan,
        modules,
        status:      'pending',
        expiresAt:   data.expiresAt,
        createdAt:   new Date().toISOString(),
        ...(data.devUrl ? { devUrl: data.devUrl } : {}),
      };

      setInvitations(prev => [newInv, ...prev]);
      if (data.devUrl) setLastDevUrl(data.devUrl);
      resetForm();

    } catch { setFormError('Error de conexión. Intentá de nuevo.');
    } finally { setSubmitting(false); }
  }

  async function cancelInvitation(id: string) {
    await fetch(`/api/owner/invite-client?id=${id}`, { method: 'DELETE' });
    setInvitations(prev => prev.filter(i => i.id !== id));
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = invitations.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Clientes y Empresas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestiona acceso, planes y módulos. Invitá nuevos clientes por email.
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="gap-2 shrink-0">
          <PlusCircle className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Tabs defaultValue="clients">
        <TabsList>
          <TabsTrigger value="clients">Empresas activas ({clients.length})</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitaciones
            {pendingCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Active clients ─────────────────────────────────────────────── */}
        <TabsContent value="clients" className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar empresa..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Próx. Facturación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map(client => (
                    <TableRow key={client.id}>
                      <TableCell className="font-semibold">{client.name}</TableCell>
                      <TableCell><Badge variant="outline">{client.plan}</Badge></TableCell>
                      <TableCell>{client.users.toLocaleString()}</TableCell>
                      <TableCell>{client.nextBilling}</TableCell>
                      <TableCell>
                        <Badge variant={client.status === 'Activo' ? 'default' : 'destructive'}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Suspender/Activar"
                            onClick={() => setClients(prev => prev.map(c =>
                              c.id === client.id
                                ? { ...c, status: c.status === 'Activo' ? 'Suspendido' : 'Activo' }
                                : c
                            ))}
                          >
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
        </TabsContent>

        {/* ── Invitations ────────────────────────────────────────────────── */}
        <TabsContent value="invitations" className="mt-4">
          {invitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <Mail className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">
                  No hay invitaciones enviadas aún.<br />
                  Usá "Nuevo Cliente" para invitar una empresa.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {invitations.map(inv => (
                <Card key={inv.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                          inv.status === 'pending'   ? 'bg-amber-500/10 text-amber-600' :
                          inv.status === 'activated' ? 'bg-green-500/10 text-green-600' :
                                                       'bg-muted text-muted-foreground'
                        }`}>
                          {inv.status === 'activated' ? <CheckCircle2 className="h-4 w-4" /> :
                           inv.status === 'expired'   ? <XCircle className="h-4 w-4" /> :
                                                        <Clock className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm">{inv.companyName}</span>
                            <Badge variant="outline" className="text-xs py-0">{inv.plan}</Badge>
                            <Badge
                              variant={inv.status === 'activated' ? 'default' : 'secondary'}
                              className={`text-xs py-0 ${
                                inv.status === 'pending' ? 'text-amber-600' :
                                inv.status === 'expired' ? 'text-muted-foreground' : ''
                              }`}
                            >
                              {inv.status === 'pending' ? 'Pendiente' : inv.status === 'activated' ? 'Activada' : 'Expirada'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{inv.adminEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            Enviada: {fmt(inv.createdAt)} · Vence: {fmt(inv.expiresAt)}
                          </p>
                          {inv.modules.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {inv.modules.map(m => (
                                <Badge key={m} variant="secondary" className="text-[10px] py-0">{m}</Badge>
                              ))}
                            </div>
                          )}
                          {/* Dev link */}
                          {inv.devUrl && inv.status === 'pending' && (
                            <div className="mt-2 flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2.5 py-1.5">
                              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 truncate flex-1">{inv.devUrl}</span>
                              <button onClick={() => copyToClipboard(inv.devUrl!)} className="shrink-0 text-amber-600 hover:text-amber-800">
                                {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {inv.status === 'pending' && (
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => cancelInvitation(inv.id)}
                          className="text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Invitation Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showInvite} onOpenChange={open => { if (!open) resetForm(); setShowInvite(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Invitar nuevo cliente
            </DialogTitle>
            <DialogDescription>
              Se enviará un email con enlace de activación. El administrador deberá confirmarlo
              para que su empresa quede provisionada en el sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Company name */}
            <div className="space-y-1.5">
              <Label htmlFor="cname">Nombre de la empresa *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cname"
                  placeholder="Ej: Acme SA"
                  className="pl-9"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            {/* Admin email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email del administrador *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@empresa.com"
                  className="pl-9"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                La cuenta de administrador se creará con este email y el nombre de la empresa.
              </p>
            </div>

            {/* Plan */}
            <div className="space-y-1.5">
              <Label>Plan *</Label>
              <Select value={plan} onValueChange={onPlanChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter — módulos básicos</SelectItem>
                  <SelectItem value="professional">Professional — módulos intermedios</SelectItem>
                  <SelectItem value="enterprise">Enterprise — todos los módulos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Modules */}
            <div className="space-y-2">
              <Label>Módulos habilitados *</Label>
              <div className="rounded-lg border p-3 space-y-2">
                {SYSTEM_MODULES.map(mod => (
                  <div key={mod.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`mod-${mod.key}`}
                      checked={modules.includes(mod.key)}
                      onCheckedChange={() => toggleModule(mod.key)}
                    />
                    <label htmlFor={`mod-${mod.key}`} className="text-sm cursor-pointer select-none">
                      {mod.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {modules.length} módulo{modules.length !== 1 ? 's' : ''} seleccionado{modules.length !== 1 ? 's' : ''}.
                El administrador solo verá los módulos habilitados.
              </p>
            </div>

            <Separator />

            {/* Info box */}
            <div className="rounded-lg bg-muted/40 border p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">¿Cómo funciona la activación?</p>
              <p>1. Se envía un email con enlace seguro al administrador (válido 48 h).</p>
              <p>2. El administrador hace clic, establece su contraseña y activa la cuenta.</p>
              <p>3. El sistema provisiona automáticamente la empresa con los módulos seleccionados.</p>
              <p>4. En modo desarrollo el enlace aparece aquí para pruebas manuales.</p>
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowInvite(false); }}>
              Cancelar
            </Button>
            <Button onClick={handleSendInvitation} disabled={submitting} className="gap-2">
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando…</>
                : <><Send className="h-4 w-4" />Enviar invitación</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
