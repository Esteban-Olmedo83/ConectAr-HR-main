'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, MapPin, Building2, Clock, CheckCircle2, XCircle,
  AlertTriangle, Search, Edit2, Trash2, Plus, CalendarDays,
  LogIn, LogOut, TrendingUp
} from 'lucide-react';

// ─── Datos Mock ───────────────────────────────────────────────────────────────

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lon: number;
  radius: number;
  status: 'active' | 'inactive';
}

interface AttendanceRecord {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  branch: string;
  status: 'present' | 'absent' | 'late' | 'early_out';
  lateMinutes: number;
  hoursWorked: number | null;
}

const MOCK_BRANCHES: Branch[] = [
  { id: '1', name: 'Sede Central Buenos Aires', address: 'Av. Corrientes 1234, Piso 8', city: 'CABA', lat: -34.6037, lon: -58.3816, radius: 150, status: 'active' },
  { id: '2', name: 'Sucursal Rosario', address: 'Córdoba 1080, Piso 3', city: 'Rosario', lat: -32.9442, lon: -60.6507, radius: 100, status: 'active' },
  { id: '3', name: 'Sucursal Córdoba', address: 'Hipólito Yrigoyen 220', city: 'Córdoba', lat: -31.4135, lon: -64.1811, radius: 100, status: 'active' },
];

const TODAY = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const TODAY_ISO = new Date().toISOString().split('T')[0];

const MOCK_TODAY: AttendanceRecord[] = [
  { id: '1', employeeName: 'María Elena González', employeeCode: 'EMP-002', department: 'Recursos Humanos', date: TODAY_ISO, checkIn: '08:58', checkOut: null, branch: 'Sede Central', status: 'present', lateMinutes: 0, hoursWorked: null },
  { id: '2', employeeName: 'Juan Pablo Fernández', employeeCode: 'EMP-003', department: 'Tecnología', date: TODAY_ISO, checkIn: '09:12', checkOut: null, branch: 'Sede Central', status: 'late', lateMinutes: 12, hoursWorked: null },
  { id: '3', employeeName: 'Laura Rodríguez', employeeCode: 'EMP-004', department: 'Ventas', date: TODAY_ISO, checkIn: '09:01', checkOut: null, branch: 'Sede Central', status: 'present', lateMinutes: 0, hoursWorked: null },
  { id: '4', employeeName: 'Carlos Martínez', employeeCode: 'EMP-005', department: 'Tecnología', date: TODAY_ISO, checkIn: '09:00', checkOut: null, branch: 'Sede Central', status: 'present', lateMinutes: 0, hoursWorked: null },
  { id: '5', employeeName: 'Analía López', employeeCode: 'EMP-006', department: 'Recursos Humanos', date: TODAY_ISO, checkIn: null, checkOut: null, branch: '-', status: 'absent', lateMinutes: 0, hoursWorked: null },
  { id: '6', employeeName: 'Diego Pérez', employeeCode: 'EMP-007', department: 'Ventas', date: TODAY_ISO, checkIn: '09:05', checkOut: null, branch: 'Sede Central', status: 'present', lateMinutes: 0, hoursWorked: null },
  { id: '7', employeeName: 'Valentina Sánchez', employeeCode: 'EMP-008', department: 'Tecnología', date: TODAY_ISO, checkIn: '08:55', checkOut: null, branch: 'Sucursal Rosario', status: 'present', lateMinutes: 0, hoursWorked: null },
  { id: '8', employeeName: 'Ricardo Morales', employeeCode: 'EMP-009', department: 'Administración', date: TODAY_ISO, checkIn: '09:00', checkOut: null, branch: 'Sucursal Córdoba', status: 'present', lateMinutes: 0, hoursWorked: null },
];

const MOCK_HISTORY: AttendanceRecord[] = [
  { id: 'h1', employeeName: 'María Elena González', employeeCode: 'EMP-002', department: 'Recursos Humanos', date: '2026-04-18', checkIn: '08:58', checkOut: '18:05', branch: 'Sede Central', status: 'present', lateMinutes: 0, hoursWorked: 8.1 },
  { id: 'h2', employeeName: 'Juan Pablo Fernández', employeeCode: 'EMP-003', department: 'Tecnología', date: '2026-04-18', checkIn: '09:15', checkOut: '18:10', branch: 'Sede Central', status: 'late', lateMinutes: 15, hoursWorked: 7.9 },
  { id: 'h3', employeeName: 'Carlos Martínez', employeeCode: 'EMP-005', department: 'Tecnología', date: '2026-04-18', checkIn: '09:00', checkOut: '18:00', branch: 'Sede Central', status: 'present', lateMinutes: 0, hoursWorked: 8.0 },
  { id: 'h4', employeeName: 'Analía López', employeeCode: 'EMP-006', department: 'Recursos Humanos', date: '2026-04-18', checkIn: null, checkOut: null, branch: '-', status: 'absent', lateMinutes: 0, hoursWorked: null },
  { id: 'h5', employeeName: 'Valentina Sánchez', employeeCode: 'EMP-008', department: 'Tecnología', date: '2026-04-18', checkIn: '08:50', checkOut: '17:55', branch: 'Sucursal Rosario', status: 'present', lateMinutes: 0, hoursWorked: 8.1 },
  { id: 'h6', employeeName: 'Laura Rodríguez', employeeCode: 'EMP-004', department: 'Ventas', date: '2026-04-17', checkIn: '09:02', checkOut: '18:03', branch: 'Sede Central', status: 'present', lateMinutes: 0, hoursWorked: 8.0 },
  { id: 'h7', employeeName: 'Diego Pérez', employeeCode: 'EMP-007', department: 'Ventas', date: '2026-04-17', checkIn: '09:00', checkOut: '17:45', branch: 'Sede Central', status: 'early_out', lateMinutes: 0, hoursWorked: 7.7 },
  { id: 'h8', employeeName: 'Ricardo Morales', employeeCode: 'EMP-009', department: 'Administración', date: '2026-04-17', checkIn: '09:00', checkOut: '18:00', branch: 'Sucursal Córdoba', status: 'present', lateMinutes: 0, hoursWorked: 8.0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  present: 'Presente',
  absent: 'Ausente',
  late: 'Tarde',
  early_out: 'Salida anticipada',
};

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    early_out: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[status] || ''}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', address: '', city: '', lat: '', lon: '', radius: '100' });

  const todayFiltered = MOCK_TODAY.filter(r =>
    r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    r.department.toLowerCase().includes(search.toLowerCase())
  );

  const historyFiltered = MOCK_HISTORY.filter(r =>
    r.employeeName.toLowerCase().includes(historySearch.toLowerCase()) ||
    r.department.toLowerCase().includes(historySearch.toLowerCase())
  );

  const present = MOCK_TODAY.filter(r => r.status === 'present').length;
  const late = MOCK_TODAY.filter(r => r.status === 'late').length;
  const absent = MOCK_TODAY.filter(r => r.status === 'absent').length;
  const total = MOCK_TODAY.length;

  const handleDeleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveBranch = () => {
    if (!newBranch.name || !newBranch.lat || !newBranch.lon) return;
    const branch: Branch = {
      id: Date.now().toString(),
      name: newBranch.name,
      address: newBranch.address,
      city: newBranch.city,
      lat: parseFloat(newBranch.lat),
      lon: parseFloat(newBranch.lon),
      radius: parseInt(newBranch.radius) || 100,
      status: 'active',
    };
    setBranches(prev => [...prev, branch]);
    setNewBranch({ name: '', address: '', city: '', lat: '', lon: '', radius: '100' });
    setShowBranchForm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Gestión de Asistencia</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Control de fichajes, historial por empleado y configuración de sucursales.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-xs text-muted-foreground">Presentes</p><p className="text-2xl font-bold">{present}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30"><AlertTriangle className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-xs text-muted-foreground">Con retraso</p><p className="text-2xl font-bold">{late}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><XCircle className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-xs text-muted-foreground">Ausentes</p><p className="text-2xl font-bold">{absent}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Asistencia</p><p className="text-2xl font-bold">{Math.round(((present + late) / total) * 100)}%</p></div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="today">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Fichajes de Hoy</span>
            <span className="sm:hidden">Hoy</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Historial</span>
            <span className="sm:hidden">Historial</span>
          </TabsTrigger>
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Sucursales</span>
            <span className="sm:hidden">Sucursales</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Fichajes de hoy */}
        <TabsContent value="today" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground font-medium">{TODAY} — {total} empleados</p>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar empleado o área..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-semibold text-muted-foreground">Empleado</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground hidden md:table-cell">Área</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Entrada</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground hidden sm:table-cell">Sucursal</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {todayFiltered.map(r => (
                    <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{r.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{r.employeeCode}</p>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{r.department}</td>
                      <td className="p-3">
                        {r.checkIn ? (
                          <div className="flex items-center gap-1.5">
                            <LogIn className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            <span className="font-mono font-semibold">{r.checkIn}</span>
                            {r.lateMinutes > 0 && <span className="text-xs text-yellow-600">+{r.lateMinutes}min</span>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Sin registro</span>
                        )}
                      </td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs">{r.branch}</td>
                      <td className="p-3"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {todayFiltered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">Sin resultados para "{search}"</div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: Historial */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground font-medium">Últimos registros</p>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar empleado o área..." className="pl-9" value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
            </div>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-semibold text-muted-foreground">Empleado</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground hidden md:table-cell">Fecha</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Entrada</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground hidden sm:table-cell">Salida</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground hidden lg:table-cell">Hs.</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historyFiltered.map(r => (
                    <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{r.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{r.date}</p>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{new Date(r.date).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</td>
                      <td className="p-3">
                        {r.checkIn ? <span className="font-mono font-semibold">{r.checkIn}</span> : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        {r.checkOut ? <span className="font-mono font-semibold">{r.checkOut}</span> : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">
                        {r.hoursWorked ? `${r.hoursWorked}h` : '—'}
                      </td>
                      <td className="p-3"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {historyFiltered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">Sin resultados</div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: Sucursales */}
        <TabsContent value="branches" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">{branches.length} sucursales configuradas</p>
            <Button size="sm" onClick={() => setShowBranchForm(!showBranchForm)}>
              <Plus className="h-4 w-4 mr-2" />Nueva Sucursal
            </Button>
          </div>

          {/* Formulario nueva sucursal */}
          {showBranchForm && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Agregar Nueva Sucursal</CardTitle>
                <CardDescription>Ingresá las coordenadas GPS exactas para la validación de geolocalización.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Nombre *</label>
                    <Input placeholder="Ej: Sucursal Mendoza" value={newBranch.name} onChange={e => setNewBranch(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Ciudad</label>
                    <Input placeholder="Ej: Mendoza" value={newBranch.city} onChange={e => setNewBranch(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Dirección</label>
                    <Input placeholder="Ej: San Martín 456, Piso 2" value={newBranch.address} onChange={e => setNewBranch(p => ({ ...p, address: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Latitud * <span className="font-normal text-muted-foreground">(ej: -34.6037)</span></label>
                    <Input placeholder="-34.6037" value={newBranch.lat} onChange={e => setNewBranch(p => ({ ...p, lat: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Longitud * <span className="font-normal text-muted-foreground">(ej: -58.3816)</span></label>
                    <Input placeholder="-58.3816" value={newBranch.lon} onChange={e => setNewBranch(p => ({ ...p, lon: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Radio permitido (metros)</label>
                    <Input type="number" placeholder="100" value={newBranch.radius} onChange={e => setNewBranch(p => ({ ...p, radius: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSaveBranch} disabled={!newBranch.name || !newBranch.lat || !newBranch.lon}>Guardar Sucursal</Button>
                  <Button variant="outline" onClick={() => setShowBranchForm(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Listado de sucursales */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map(branch => (
              <Card key={branch.id} className="relative">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">{branch.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{branch.city}</p>
                      </div>
                    </div>
                    <Badge variant={branch.status === 'active' ? 'default' : 'secondary'} className="shrink-0 text-xs">
                      {branch.status === 'active' ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-primary font-semibold">GPS</span>
                      <span>{branch.lat.toFixed(4)}, {branch.lon.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">Radio:</span>
                      <span>{branch.radius}m</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingBranch(branch)}>
                      <Edit2 className="h-3.5 w-3.5 mr-1.5" />Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBranch(branch.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  <strong>¿Cómo obtener coordenadas GPS?</strong> Buscá la dirección en Google Maps, hacé clic derecho sobre el punto exacto y copiá las coordenadas que aparecen (Latitud, Longitud).
                </span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
