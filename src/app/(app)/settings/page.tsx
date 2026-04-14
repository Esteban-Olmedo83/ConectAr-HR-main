
'use client';

import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Palette, Monitor, Sun, Moon, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme, mode, setMode } = useTheme();

  const themes = [
    { name: 'oceano', label: 'Océano', color: 'bg-blue-600' },
    { name: 'zinc', label: 'Zinc', color: 'bg-zinc-500' },
    { name: 'rose', label: 'Rosa', color: 'bg-rose-500' },
    { name: 'blue', label: 'Azul', color: 'bg-blue-500' },
    { name: 'green', label: 'Verde', color: 'bg-green-500' },
    { name: 'orange', label: 'Naranja', color: 'bg-orange-500' },
    { name: 'violet', label: 'Violeta', color: 'bg-violet-500' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza la apariencia y el comportamiento de la aplicación.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Apariencia</CardTitle>
          <CardDescription>
            Personaliza la interfaz para que se adapte a tu gusto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Paleta de Colores
            </h3>
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <Button
                  key={t.name}
                  variant="outline"
                  className={cn(
                    'justify-start',
                    theme === t.name && 'border-2 border-primary'
                  )}
                  onClick={() => setTheme(t.name as any)}
                >
                  <span
                    className={cn(
                      'mr-2 rounded-full w-4 h-4',
                      t.color
                    )}
                  />
                  {t.label}
                  {theme === t.name && <Check className="ml-2 h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Modo de Interfaz
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={mode === 'light' ? 'default' : 'outline'}
                onClick={() => setMode('light')}
              >
                <Sun className="mr-2" />
                Claro
              </Button>
              <Button
                variant={mode === 'dark' ? 'default' : 'outline'}
                onClick={() => setMode('dark')}
              >
                <Moon className="mr-2" />
                Oscuro
              </Button>
              <Button
                variant={mode === 'matrix' ? 'default' : 'outline'}
                onClick={() => setMode('matrix')}
              >
                <Laptop className="mr-2" />
                Matrix
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
