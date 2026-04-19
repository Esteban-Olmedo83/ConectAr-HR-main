'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, MapPin, Loader2, AlertCircle, CheckCircle2, Navigation, Clock, Building2, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  latitude: number;
  longitude: number;
}

const BRANCHES: Branch[] = [
  {
    name: 'Sede Central',
    lat: -34.6037,
    lon: -58.3816,
    address: 'Av. 9 de Julio, CABA',
  },
  {
    name: 'Sucursal Rosario',
    lat: -32.9442,
    lon: -60.6507,
    address: 'Córdoba 1080, Rosario',
  },
];

const ALLOWED_RADIUS_METERS = 100;

type GeoStatus = 'idle' | 'loading' | 'tracking' | 'error';
type ClockStatus = 'out' | 'in';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestBranch(lat: number, lon: number): { branch: Branch; distance: number } | null {
  let nearest: { branch: Branch; distance: number } | null = null;
  for (const branch of BRANCHES) {
    const distance = haversineDistance(lat, lon, branch.lat, branch.lon);
    if (!nearest || distance < nearest.distance) {
      nearest = { branch, distance };
    }
  }
  return nearest;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function AttendancePage() {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [nearest, setNearest] = useState<{ branch: Branch; distance: number } | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [clockStatus, setClockStatus] = useState<ClockStatus>('out');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const watchIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Clock tick
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

  const handleGeoError = useCallback((error: GeolocationPositionError) => {
    console.error('Geolocalización error:', error);
    setGeoStatus('error');
    toast({
      variant: 'destructive',
      title: 'Error de geolocalización',
      description: 'Activá los permisos de ubicación en tu navegador y recargá.',
    });
  }, [toast]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    // watchPosition for continuous real-time tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      updatePosition,
      handleGeoError,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [updatePosition, handleGeoError]);

  const registerEvent = (type: 'in' | 'out') => {
    if (!isWithinRange || !coords || !nearest) {
      toast({ variant: 'destructive', title: 'Fuera de rango', description: 'No estás dentro del radio de ninguna sucursal.' });
      return;
    }
    const record: AttendanceRecord = {
      type,
      time: new Date(),
      branch: nearest.branch.name,
      distance: nearest.distance,
      latitude: coords.lat,
      longitude: coords.lon,
    };
    setRecords(prev => [...prev, record]);
    setClockStatus(type === 'in' ? 'in' : 'out');
    toast({
      title: type === 'in' ? 'Entrada registrada ✓' : 'Salida registrada ✓',
      description: `${nearest.branch.name} — ${formatTime(record.time)}`,
    });
  };

  const lastIn = [...records].reverse().find(r => r.type === 'in');
  const lastOut = [...records].reverse().find(r => r.type === 'out');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Registro de Jornada</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registrá tu entrada y salida con validación de geolocalización.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs">
            {currentTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Estado de geolocalización */}
      <GeoStatusBanner status={geoStatus} nearest={nearest} isWithinRange={isWithinRange} coords={coords} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card de fichaje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Fichar Jornada
            </CardTitle>
            <CardDescription>
              {clockStatus === 'out'
                ? 'Presioná "Fichar Entrada" para iniciar tu jornada.'
                : 'Presioná "Fichar Salida" para cerrar tu jornada.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sucursal más cercana */}
            {nearest && (
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                isWithinRange
                  ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
                  : 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30'
              }`}>
                <Building2 className={`h-5 w-5 shrink-0 ${isWithinRange ? 'text-green-600' : 'text-orange-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{nearest.branch.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{nearest.branch.address}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${isWithinRange ? 'text-green-600' : 'text-orange-500'}`}>
                    {formatDistance(nearest.distance)}
                  </p>
                  <p className="text-xs text-muted-foreground">distancia</p>
                </div>
              </div>
            )}

            {/* Barra de proximidad */}
            {nearest && geoStatus === 'tracking' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Proximidad</span>
                  <span>{isWithinRange ? 'En rango ✓' : `Faltan ${formatDistance(Math.max(0, nearest.distance - ALLOWED_RADIUS_METERS))}`}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isWithinRange ? 'bg-green-500' : 'bg-orange-400'}`}
                    style={{ width: `${Math.min(100, (ALLOWED_RADIUS_METERS / Math.max(nearest.distance, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Botones de fichaje */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => registerEvent('in')}
                disabled={geoStatus !== 'tracking' || !isWithinRange || clockStatus === 'in'}
                className="w-full"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Fichar Entrada
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => registerEvent('out')}
                disabled={geoStatus !== 'tracking' || !isWithinRange || clockStatus === 'out'}
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Fichar Salida
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card resumen del día */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Resumen de Hoy
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <SummaryItem
                icon={<LogIn className="h-4 w-4 text-green-500" />}
                label="Última entrada"
                value={lastIn ? formatTime(lastIn.time) : '--:--:--'}
                sub={lastIn?.branch}
              />
              <SummaryItem
                icon={<LogOut className="h-4 w-4 text-red-500" />}
                label="Última salida"
                value={lastOut ? formatTime(lastOut.time) : '--:--:--'}
                sub={lastOut?.branch}
              />
            </div>

            {records.length > 0 ? (
              <div className="space-y-1 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Historial del día</p>
                <div className="space-y-1 max-h-48 overflow-y-auto [scrollbar-width:thin]">
                  {records.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-muted/40">
                      <div className="flex items-center gap-2">
                        {r.type === 'in'
                          ? <LogIn className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          : <LogOut className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                        <span className="font-medium">{r.type === 'in' ? 'Entrada' : 'Salida'}</span>
                        <span className="text-muted-foreground text-xs truncate hidden sm:inline">{r.branch}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold tabular-nums">{formatTime(r.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Aún no hay fichajes registrados hoy.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info de sucursales habilitadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Sucursales Habilitadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {BRANCHES.map(branch => (
              <div key={branch.name} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{branch.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{branch.address}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Radio {ALLOWED_RADIUS_METERS}m
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GeoStatusBanner({
  status,
  nearest,
  isWithinRange,
  coords,
}: {
  status: GeoStatus;
  nearest: { branch: Branch; distance: number } | null;
  isWithinRange: boolean;
  coords: { lat: number; lon: number } | null;
}) {
  if (status === 'idle' || status === 'loading') {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Obteniendo ubicación...</AlertTitle>
        <AlertDescription>
          Verificando tu posición GPS para habilitar el fichaje.
        </AlertDescription>
      </Alert>
    );
  }
  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Sin acceso a la ubicación</AlertTitle>
        <AlertDescription>
          Habilitá los permisos de geolocalización en tu navegador y recargá la página.
        </AlertDescription>
      </Alert>
    );
  }
  if (status === 'tracking' && isWithinRange && nearest) {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-400">Ubicación validada — {nearest.branch.name}</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-500">
          Estás a {formatDistance(nearest.distance)} de la sucursal. Podés fichar tu jornada.
          {coords && <span className="text-xs ml-2 opacity-70">({coords.lat.toFixed(5)}, {coords.lon.toFixed(5)})</span>}
        </AlertDescription>
      </Alert>
    );
  }
  if (status === 'tracking' && !isWithinRange) {
    return (
      <Alert variant="destructive">
        <MapPin className="h-4 w-4" />
        <AlertTitle>Fuera de rango</AlertTitle>
        <AlertDescription>
          {nearest
            ? `Estás a ${formatDistance(nearest.distance)} de ${nearest.branch.name}. Necesitás estar a menos de ${ALLOWED_RADIUS_METERS}m para fichar.`
            : 'No se encontró ninguna sucursal habilitada cercana.'}
        </AlertDescription>
      </Alert>
    );
  }
  return null;
}

function SummaryItem({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/40">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="font-mono text-lg font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}
