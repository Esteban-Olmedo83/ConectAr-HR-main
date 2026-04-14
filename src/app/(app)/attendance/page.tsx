'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Coordenadas de las sucursales (simuladas)
const branches = {
  'Sucursal Principal': { lat: -34.6037, lon: -58.3816 }, // Obelisco, Buenos Aires
  'Sucursal Externa': { lat: -32.9442, lon: -60.6507 }, // Rosario, Santa Fe
};
const ALLOWED_DISTANCE_METERS = 100; // 100 metros de radio

type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';
type ClockStatus = 'out' | 'in';

export default function AttendancePage() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<GeolocationStatus>('idle');
  const [clockStatus, setClockStatus] = useState<ClockStatus>('out');
  const [lastClockIn, setLastClockIn] = useState<Date | null>(null);
  const [lastClockOut, setLastClockOut] = useState<Date | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const { toast } = useToast();

  const getDistance = (from: GeolocationCoordinates, to: { lat: number, lon: number }) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const phi1 = from.latitude * Math.PI / 180;
    const phi2 = to.lat * Math.PI / 180;
    const deltaPhi = (to.lat - from.latitude) * Math.PI / 180;
    const deltaLambda = (to.lon - from.longitude) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // en metros
  };
  
  useEffect(() => {
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
        
        const nearbyBranch = Object.values(branches).some(branch => {
          const distance = getDistance(position.coords, branch);
          return distance <= ALLOWED_DISTANCE_METERS;
        });

        setIsWithinRange(nearbyBranch);
        setLocationStatus('success');
      },
      (error) => {
        console.error("Error de Geolocalización:", error);
        setLocationStatus('error');
        toast({
          variant: 'destructive',
          title: 'Error de Geolocalización',
          description: 'No se pudo obtener tu ubicación. Por favor, asegúrate de tener los permisos activados.',
        });
      },
      { enableHighAccuracy: true }
    );
  }, [toast]);

  const handleClockIn = () => {
    if (isWithinRange) {
      setClockStatus('in');
      setLastClockIn(new Date());
      toast({
        title: 'Fichaje de Entrada Exitoso',
        description: `Has registrado tu entrada a las ${new Date().toLocaleTimeString()}.`,
      });
    } else {
        toast({
            variant: 'destructive',
            title: 'Fuera de Rango',
            description: 'No te encuentras en una sucursal habilitada para fichar.',
        });
    }
  };

  const handleClockOut = () => {
     if (isWithinRange) {
        setClockStatus('out');
        setLastClockOut(new Date());
        toast({
            title: 'Fichaje de Salida Exitoso',
            description: `Has registrado tu salida a las ${new Date().toLocaleTimeString()}.`,
        });
    } else {
         toast({
            variant: 'destructive',
            title: 'Fuera de Rango',
            description: 'No te encuentras en una sucursal habilitada para fichar.',
        });
    }
  };

  const renderStatusAlert = () => {
      if (locationStatus === 'loading') {
          return (
             <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Obteniendo ubicación...</AlertTitle>
                <AlertDescription>
                    Por favor, espera mientras validamos tu posición para habilitar el fichaje.
                </AlertDescription>
            </Alert>
          )
      }
      if (locationStatus === 'error') {
          return (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de Ubicación</AlertTitle>
                <AlertDescription>
                    No se pudo acceder a tu ubicación. Habilita los permisos en tu navegador y recarga la página.
                </AlertDescription>
            </Alert>
          )
      }
      if (locationStatus === 'success' && !isWithinRange) {
           return (
             <Alert variant="destructive">
                <MapPin className="h-4 w-4" />
                <AlertTitle>Fuera de Rango</AlertTitle>
                <AlertDescription>
                    No te encuentras dentro del radio de ninguna sucursal habilitada para fichar.
                </AlertDescription>
            </Alert>
          )
      }
       if (locationStatus === 'success' && isWithinRange) {
           return (
             <Alert className="border-green-500 text-green-700">
                <MapPin className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-800">Ubicación Validada</AlertTitle>
                <AlertDescription>
                    Te encuentras en una sucursal. Ya puedes registrar tu jornada.
                </AlertDescription>
            </Alert>
          )
      }
      return null;
  }

  return (
    <div className="space-y-6">
       <header>
            <h1 className="text-3xl font-bold font-headline">Registro de Jornada</h1>
            <p className="text-muted-foreground mt-2">
                Registra tu hora de entrada y salida de forma rápida y sencilla.
            </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
            <Card className="flex flex-col items-center justify-center text-center">
                <CardHeader>
                    <CardTitle>Fichaje de Horario</CardTitle>
                    <CardDescription>
                        {clockStatus === 'out' ? 'Presiona para registrar tu INGRESO' : 'Presiona para registrar tu EGRESO'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center gap-6">
                    {renderStatusAlert()}
                    
                    <div className="flex gap-4">
                        <Button 
                            size="lg" 
                            onClick={handleClockIn}
                            disabled={locationStatus !== 'success' || !isWithinRange || clockStatus === 'in'}
                        >
                            <LogIn className="mr-2" />
                            Fichar Entrada
                        </Button>
                        <Button 
                            size="lg" 
                            variant="destructive"
                            onClick={handleClockOut}
                             disabled={locationStatus !== 'success' || !isWithinRange || clockStatus === 'out'}
                        >
                            <LogOut className="mr-2" />
                            Fichar Salida
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mis Fichajes de Hoy</CardTitle>
                    <CardDescription>
                       Historial de tus registros para el día actual.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <LogIn className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Última Entrada</span>
                        </div>
                        <span className="text-sm font-bold">
                            {lastClockIn ? lastClockIn.toLocaleTimeString() : '--:--:--'}
                        </span>
                    </div>
                     <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 text-red-500" />
                            <span className="font-medium">Última Salida</span>
                        </div>
                        <span className="text-sm font-bold">
                             {lastClockOut ? lastClockOut.toLocaleTimeString() : '--:--:--'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
