'use client';

import { useState, useMemo } from 'react';
import {
  ShieldAlert, ShieldCheck, ShieldOff, AlertTriangle, Lock,
  Search, Filter, RefreshCw, Ban, CheckCircle2, Clock,
  Globe, User, FileText, Wifi, Zap, Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType =
  | 'rate_limit_exceeded'
  | 'failed_login'
  | 'invalid_session'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'path_traversal_attempt'
  | 'unauthorized_access'
  | 'suspicious_ip'
  | 'csrf_violation'
  | 'session_hijack_attempt';

interface SecurityEvent {
  id: string;
  eventType: EventType;
  ip: string;
  userAgent: string;
  pathname: string;
  userId?: string;
  tenantId?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  resolved: boolean;
  createdAt: string;
  payload?: Record<string, unknown>;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EVENTS: SecurityEvent[] = [
  { id: 'ev-001', eventType: 'sql_injection_attempt', ip: '185.220.101.45', userAgent: 'sqlmap/1.7', pathname: '/api/employees', severity: 5, resolved: false, createdAt: '2026-04-19T08:12:33Z', payload: { param: 'search', value: "' OR 1=1--" } },
  { id: 'ev-002', eventType: 'rate_limit_exceeded',   ip: '203.0.113.12',   userAgent: 'python-requests/2.31', pathname: '/api/auth/login', severity: 4, resolved: false, createdAt: '2026-04-19T08:05:10Z', payload: { count: 47, window: '15min' } },
  { id: 'ev-003', eventType: 'xss_attempt',           ip: '198.51.100.8',   userAgent: 'Mozilla/5.0 (X11; Linux)', pathname: '/api/employees', severity: 4, resolved: true,  createdAt: '2026-04-19T07:44:22Z', payload: { param: 'name', value: '<script>alert(1)</script>' } },
  { id: 'ev-004', eventType: 'failed_login',          ip: '192.0.2.55',     userAgent: 'Mozilla/5.0 (Windows NT)', pathname: '/api/auth/login', severity: 2, resolved: true,  createdAt: '2026-04-19T07:30:05Z', payload: { email: 'admin@company.com', attempts: 4 } },
  { id: 'ev-005', eventType: 'path_traversal_attempt',ip: '203.0.113.77',   userAgent: 'curl/7.88.1', pathname: '/api/files', severity: 4, resolved: false, createdAt: '2026-04-19T07:15:18Z', payload: { param: 'path', value: '../../etc/passwd' } },
  { id: 'ev-006', eventType: 'unauthorized_access',   ip: '198.51.100.22',  userAgent: 'Mozilla/5.0 (Macintosh)', pathname: '/owner/dashboard', severity: 3, resolved: true,  createdAt: '2026-04-18T22:10:45Z', payload: { role: 'employee', required: 'owner' } },
  { id: 'ev-007', eventType: 'invalid_session',       ip: '192.0.2.100',    userAgent: 'Mozilla/5.0 (iPhone)', pathname: '/dashboard', severity: 1, resolved: true,  createdAt: '2026-04-18T20:55:30Z', payload: { reason: 'malformed_base64' } },
  { id: 'ev-008', eventType: 'suspicious_ip',         ip: '185.220.101.99', userAgent: 'Go-http-client/2.0', pathname: '/api/owner/modules', severity: 3, resolved: false, createdAt: '2026-04-18T18:30:00Z', payload: { reason: 'tor_exit_node' } },
  { id: 'ev-009', eventType: 'csrf_violation',        ip: '203.0.113.45',   userAgent: 'Mozilla/5.0 (Windows NT)', pathname: '/api/payslips', severity: 3, resolved: false, createdAt: '2026-04-18T16:20:15Z', payload: { origin: 'https://evil.example.com' } },
  { id: 'ev-010', eventType: 'rate_limit_exceeded',   ip: '192.0.2.200',    userAgent: 'Scrapy/2.7', pathname: '/api/employees', severity: 2, resolved: true,  createdAt: '2026-04-18T14:05:55Z', payload: { count: 520, window: '1min' } },
];

const BLOCKED_IPS = ['185.220.101.45', '203.0.113.12'];

// ─── Config ───────────────────────────────────────────────────────────────────

const EVENT_CONFIG: Record<EventType, { label: string; icon: React.ElementType; color: string }> = {
  rate_limit_exceeded:    { label: 'Rate Limit',      icon: Zap,          color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  failed_login:           { label: 'Login Fallido',   icon: Lock,         color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  invalid_session:        { label: 'Sesión Inválida', icon: ShieldOff,    color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
  sql_injection_attempt:  { label: 'SQL Injection',   icon: AlertTriangle,color: 'bg-red-500/10 text-red-700 border-red-200' },
  xss_attempt:            { label: 'XSS',             icon: FileText,     color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  path_traversal_attempt: { label: 'Path Traversal',  icon: Globe,        color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  unauthorized_access:    { label: 'Acceso No Auth',  icon: ShieldAlert,  color: 'bg-red-500/10 text-red-600 border-red-200' },
  suspicious_ip:          { label: 'IP Sospechosa',   icon: Eye,          color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  csrf_violation:         { label: 'CSRF',            icon: Wifi,         color: 'bg-pink-500/10 text-pink-600 border-pink-200' },
  session_hijack_attempt: { label: 'Session Hijack',  icon: User,         color: 'bg-red-600/10 text-red-700 border-red-300' },
};

const SEVERITY_LABELS = ['', 'Bajo', 'Medio', 'Alto', 'Crítico', 'Severo'];
const SEVERITY_COLORS = ['', 'text-green-600', 'text-blue-600', 'text-yellow-600', 'text-orange-600', 'text-red-600'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  const [events, setEvents]         = useState<SecurityEvent[]>(MOCK_EVENTS);
  const [blockedIPs, setBlockedIPs] = useState<string[]>(BLOCKED_IPS);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatus]   = useState<string>('all');
  const [blockTarget, setBlockTarget] = useState<string | null>(null);
  const [detailEvent, setDetail]    = useState<SecurityEvent | null>(null);

  const filtered = useMemo(() => events.filter(ev => {
    const matchSearch = !search || ev.ip.includes(search) || ev.pathname.includes(search) || ev.eventType.includes(search);
    const matchType   = typeFilter === 'all' || ev.eventType === typeFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'open' ? !ev.resolved : ev.resolved);
    return matchSearch && matchType && matchStatus;
  }), [events, search, typeFilter, statusFilter]);

  const unresolvedCount = events.filter(e => !e.resolved).length;
  const criticalCount   = events.filter(e => e.severity >= 4 && !e.resolved).length;

  function resolveEvent(id: string) {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
  }

  function blockIP(ip: string) {
    setBlockedIPs(prev => [...new Set([...prev, ip])]);
    setBlockTarget(null);
  }

  function unblockIP(ip: string) {
    setBlockedIPs(prev => prev.filter(b => b !== ip));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Centro de Seguridad
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitoreo en tiempo real de eventos de seguridad, intentos de intrusión y actividad sospechosa.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEvents([...MOCK_EVENTS])} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">Críticos abiertos</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">{unresolvedCount}</p>
            <p className="text-xs text-muted-foreground">Sin resolver</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{events.length}</p>
            <p className="text-xs text-muted-foreground">Total 24h</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{blockedIPs.length}</p>
            <p className="text-xs text-muted-foreground">IPs bloqueadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Blocked IPs */}
      {blockedIPs.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <Ban className="h-4 w-4" /> IPs Bloqueadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {blockedIPs.map(ip => (
                <div key={ip} className="flex items-center gap-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-3 py-1 text-xs font-mono font-medium">
                  {ip}
                  <button onClick={() => unblockIP(ip)} className="hover:opacity-70 transition-opacity ml-1">×</button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por IP, ruta o tipo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Tipo de evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(EVENT_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Sin resolver</SelectItem>
            <SelectItem value="resolved">Resueltos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No se encontraron eventos con los filtros aplicados.</p>
          </div>
        )}
        {filtered.map(ev => {
          const cfg     = EVENT_CONFIG[ev.eventType];
          const isBlocked = blockedIPs.includes(ev.ip);

          return (
            <Card key={ev.id} className={`border-border/40 transition-colors ${!ev.resolved ? 'bg-destructive/[0.02] border-l-2 border-l-destructive/40' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Type badge */}
                    <div className={`mt-0.5 p-1.5 rounded-md border flex-shrink-0 ${cfg.color}`}>
                      <cfg.icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{cfg.label}</span>
                        <Badge variant="outline" className={`text-xs py-0 font-medium ${SEVERITY_COLORS[ev.severity]}`}>
                          Sev. {SEVERITY_LABELS[ev.severity]}
                        </Badge>
                        {ev.resolved
                          ? <Badge variant="secondary" className="text-xs py-0 text-green-600"><CheckCircle2 className="h-2.5 w-2.5 mr-1" />Resuelto</Badge>
                          : <Badge variant="secondary" className="text-xs py-0 text-orange-600"><Clock className="h-2.5 w-2.5 mr-1" />Abierto</Badge>
                        }
                        {isBlocked && <Badge variant="destructive" className="text-xs py-0"><Ban className="h-2.5 w-2.5 mr-1" />IP Bloqueada</Badge>}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">{ev.ip}</span>
                        <span>{ev.pathname}</span>
                        <span>{formatDate(ev.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setDetail(ev)} className="h-7 w-7 p-0">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {!ev.resolved && (
                      <Button variant="ghost" size="sm" onClick={() => resolveEvent(ev.id)} className="h-7 w-7 p-0 text-green-600 hover:text-green-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {!isBlocked && (
                      <Button variant="ghost" size="sm" onClick={() => setBlockTarget(ev.ip)} className="h-7 w-7 p-0 text-destructive hover:text-destructive/80">
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail modal */}
      <Dialog open={!!detailEvent} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailEvent && (() => {
                const cfg = EVENT_CONFIG[detailEvent.eventType];
                return <><cfg.icon className="h-4 w-4" />{cfg.label}</>;
              })()}
            </DialogTitle>
          </DialogHeader>
          {detailEvent && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">IP</p><p className="font-mono font-medium">{detailEvent.ip}</p></div>
                <div><p className="text-xs text-muted-foreground">Severidad</p><p className={`font-medium ${SEVERITY_COLORS[detailEvent.severity]}`}>{SEVERITY_LABELS[detailEvent.severity]}</p></div>
                <div><p className="text-xs text-muted-foreground">Ruta</p><p className="font-mono text-xs">{detailEvent.pathname}</p></div>
                <div><p className="text-xs text-muted-foreground">Fecha</p><p>{formatDate(detailEvent.createdAt)}</p></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                <p className="font-mono text-xs bg-muted rounded p-2 break-all">{detailEvent.userAgent}</p>
              </div>
              {detailEvent.payload && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payload</p>
                  <pre className="font-mono text-xs bg-muted rounded p-2 whitespace-pre-wrap overflow-auto max-h-40">
                    {JSON.stringify(detailEvent.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {detailEvent && !blockedIPs.includes(detailEvent.ip) && (
              <Button variant="destructive" size="sm" onClick={() => { setBlockTarget(detailEvent.ip); setDetail(null); }}>
                <Ban className="h-3.5 w-3.5 mr-2" /> Bloquear IP
              </Button>
            )}
            {detailEvent && !detailEvent.resolved && (
              <Button size="sm" onClick={() => { resolveEvent(detailEvent.id); setDetail(null); }}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Marcar resuelto
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block IP confirm */}
      <Dialog open={!!blockTarget} onOpenChange={() => setBlockTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><Ban className="h-4 w-4" />Bloquear IP</DialogTitle>
            <DialogDescription>
              ¿Bloquear permanentemente la IP <span className="font-mono font-bold">{blockTarget}</span>? Esta acción se puede deshacer desde el panel de IPs bloqueadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => blockTarget && blockIP(blockTarget)}>
              <Ban className="h-4 w-4 mr-2" /> Bloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
