'use client';

import { usePathname } from 'next/navigation';
import { AppShell } from './app-shell';

/**
 * @fileOverview Wrapper condicional para el AppShell.
 * Orquesta la visualización del AppShell según la ruta activa.
 */
export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // No envolver en AppShell si es la página de login o raíz de orquestación
  if (pathname === '/login' || pathname === '/') {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return <AppShell>{children}</AppShell>;
}
