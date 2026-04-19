'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, MapPin, Loader2, AlertCircle, CheckCircle2, Navigation, Clock, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getSession } from '@/lib/session';

interface Branch {
  name: string;
  lat: number;
  lon: number;
  address: string;
}

interface AttendanceRecord {
  type: 'in' | 'out';
  time: Date;
  branch: string;
  distance: number;
}

const BRANCHES: Branch[] = [
  { name: 'Sede Central Buenos Aires', lat: -34.6037, lon: -58.3816, address: 'Av. Corrientes 1234, CABA' },
  { name: 'Sucursal Rosario', lat: -32.9442, lon: -60.6507, address: 'Córdoba 1080, Rosario' },
  { name: 'Sucursal Córdoba', lat: -31.4135, lon: -64.1811, address: 'Hipólito Yrigoyen 220, Córdoba' },
];
const ALLOWED_RADIUS_METERS = 100;

type GeoStatus = 'idle' | 'loading' | 'tracking' | 'error';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestBranch(lat: number, lon: number) {
  let nearest: { branch: Branch; distance: number } | null = null;
  for (const branch of BRANCHES) {
    const distance = haversineDistance(lat, lon, branch.lat, branch.lon);
    if (!nearest || distance < nearest.distance) nearest = { branch, distance };
  }
  return nearest;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export default function MyAttendancePage() {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [nearest, setNearest] = useState<{ branch: Branch; distance: number } | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [clockStatus, setClockStatus] = useState<'out' | 'in'>('out');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const watchIdRef = useRef<number | null>(null);
  const { toast } = useToast();
  const session = getSession();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const updatePosition = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    setCoords({ lat: latitude, lon: longitude });
    const near = getNearestBranch(latitude, longitude);
    setNearest(near);
    setIsWithinRange(!!near && near.distance <= ALLOWED_RADIUS_METERS);
    setGeoStatus('tracking');
  }, []);

  const handleGeoError = useCallback(() => {
    setGeoStatus('error');
    toast({ variant: 'destructive', title: 'Error de geolocalización', description: 'Activá los permisos de ubicación en tu navegador.' });
  }, [toast]);

  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    setGeoStatus('loading');
    watchIdRef.current = navigator.geolocation.watchPosition(updatePosition, handleGeoError, { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 });
    return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, [updatePosition, handleGeoError]);

  const registerEvent = (type: 'in' | 'out') => {
    if (!isWithinRange || !nearest) {
      toast({ variant: 'destructive', title: 'Fuera de rango', description: 'No estás dentro del radio de ninguna sucursal.' });
      return;
    }
    const record: AttendanceRecord = { type, time: new Date(), branch: nearest.branch.name, distance: nearest.distance };
    setRecords(prev => [...prev, record]);
    setClockStatus(type === 'in' ? 'in' : 'out');
    toast({ title: type === 'in' ? '✓ Entrada registrada' : '✓ Salida registrada', description: `${nearest.branch.name} — ${formatTime(record.time)}` });
  };

  const lastIn = [...records].reverse().find(r => r.type === 'in');
  const lastOut = [...records].reverse().find(r => r.type === 'out');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Mi Asistencia</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hola <span className="font-semibold text-foreground">{session?.userName}</span> — registrá tu entrada y salida con validación GPS.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
          <Clock className="h-4 w-4" />
          <span className="font-mono font-bold text-foreground tabular-nums">{formatTime(currentTime)}</span>
          <span className="text-xs hidden sm:inline">
            {currentTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Status GPS */}
      {geoStatus === 'loading' && (
        <Alert><Loader2 className="h-4 w-4 animate-spin" /><AlertTitle>Obteniendo ubicación...</AlertTitle><AlertDescription>Verificando tu posición GPS.</AlertDescription></Alert>
      )}
      {geoStatus === 'error' && (
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Sin acceso a ubicación</AlertTitle><AlertDescription>Habilitá los permisos de geolocalización en tu navegador.</AlertDescription></Alert>
      )}
      {geoStatus === 'tracking' && isWithinRange && nearest && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-400">Ubicación validada — {nearest.branch.name}</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-500">Estás a {formatDistance(nearest.distance)} de la sucursal. Podés fichar.</AlertDescription>
        </Alert>
      )}
      {geoStatus === 'tracking' && !isWithinRange && nearest && (
        <Alert variant="destructive">
          <MapPin className="h-4 w-4" />
          <AlertTitle>Fuera de rango</AlertTitle>
          <AlertDescription>Estás a {formatDistance(nearest.distance)} de {nearest.branch.name}. Necesitás estar a menos de {ALLOWED_RADIUS_METERS}m.</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card fichaje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Navigation className="h-5 w-5 text-primary" />Fichar Jornada</CardTitle>
            <CardDescription>{clockStatus === 'out' ? 'Registrá tu ingreso al trabajo.' : 'Registrá tu egreso del trabajo.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nearest && geoStatus === 'tracking' && (
              <>
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isWithinRange ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30' : 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30'}`}>
                  <Building2 className={`h-5 w-5 shrink-0 ${isWithinRange ? 'text-green-600' : 'text-orange-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{nearest.branch.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{nearest.branch.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isWithinRange ? 'text-green-600' : 'text-orange-500'}`}>{formatDistance(nearest.distance)}</p>
                    <p className="text-xs text-muted-foreground">distancia</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Proximidad</span>
                    <span>{isWithinRange ? 'En rango ✓' : `Faltan ${formatDistance(Math.max(0, nearest.distance - ALLOWED_RADIUS_METERS))}`}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${isWithinRange ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${Math.min(100, (ALLOWED_RADIUS_METERS / Math.max(nearest.distance, 1)) * 100)}%` }} />
                  </div>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button size="lg" onClick={() => registerEvent('in')} disabled={geoStatus !== 'tracking' || !isWithinRange || clockStatus === 'in'} className="w-full">
                <LogIn className="mr-2 h-4 w-4" />Fichar Entrada
              </Button>
              <Button size="lg" variant="destructive" onClick={() => registerEvent('out')} disabled={geoStatus !== 'tracking' || !isWithinRange || clockStatus === 'out'} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />Fichar Salida
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card resumen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Mi Jornada de Hoy</CardTitle>
            <CardDescription>{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2"><LogIn className="h-4 w-4 text-green-500" /><span className="text-xs text-muted-foreground">Última entrada</span></div>
                <p className="font-mono text-lg font-bold tabular-nums">{lastIn ? formatTime(lastIn.time) : '--:--:--'}</p>
                {lastIn && <p className="text-xs text-muted-foreground truncate">{lastIn.branch}</p>}
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2"><LogOut className="h-4 w-4 text-red-500" /><span className="text-xs text-muted-foreground">Última salida</span></div>
                <p className="font-mono text-lg font-bold tabular-nums">{lastOut ? formatTime(lastOut.time) : '--:--:--'}</p>
                {lastOut && <p className="text-xs text-muted-foreground truncate">{lastOut.branch}</p>}
              </div>
            </div>
            {records.length > 0 ? (
              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Historial del día</p>
                <div className="space-y-1 max-h-44 overflow-y-auto [scrollbar-width:thin]">
                  {records.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-muted/40">
                      <div className="flex items-center gap-2">
                        {r.type === 'in' ? <LogIn className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <LogOut className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                        <span className="font-medium">{r.type === 'in' ? 'Entrada' : 'Salida'}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold tabular-nums">{formatTime(r.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Sin fichajes registrados hoy.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sucursales habilitadas */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Sucursales Habilitadas</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            {BRANCHES.map(b => (
              <div key={b.name} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.address}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
