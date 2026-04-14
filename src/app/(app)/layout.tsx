'use client';

import { AppShell } from '@/components/layout/app-shell';

/**
 * @fileOverview Layout para el grupo de rutas (app).
 * Aplica el AppShell corporativo automáticamente.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
