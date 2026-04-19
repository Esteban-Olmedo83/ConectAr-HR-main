'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlaskConical, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_COMPANY = {
  name: 'ConectAr Demo S.A.',
  id:   'c0nec7ar-0001-0001-0001-000000000001',
  plan: 'Enterprise',
};

const MODULE_LABEL: Record<string, string> = {
  'dashboard':          'Dashboard',
  'employees':          'Directorio de Empleados',
  'attendance':         'Asistencia',
  'leave':              'Licencias y Ausencias',
  'payslips':           'Recibos de Sueldo',
  'recruitment':        'Reclutamiento',
  'organization-chart': 'Organigrama',
  'communications':     'Comunicaciones',
  'my-portal':          'Portal del Empleado',
  'community':          'Comunidad',
};

function SandboxBanner() {
  const pathname = usePathname();
  // Derive current module from path: /owner/sandbox/employees → employees
  const segment = pathname.split('/')[3] ?? '';
  const sub     = pathname.split('/')[4] ?? '';
  const module  = MODULE_LABEL[sub] ?? MODULE_LABEL[segment] ?? 'Módulo';

  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-600 dark:text-amber-400">
          <FlaskConical className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Banco de Pruebas — Vista de Módulo
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-amber-800 dark:text-amber-300">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="font-semibold">{DEMO_COMPANY.name}</span>
            <span className="text-amber-500">·</span>
            <span className="text-xs opacity-80">{DEMO_COMPANY.plan}</span>
            <span className="text-amber-500">·</span>
            <span className="font-medium">{module}</span>
          </div>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/40">
        <Link href="/owner/dashboard">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Volver al Portal
        </Link>
      </Button>
    </div>
  );
}

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0">
      <SandboxBanner />
      {children}
    </div>
  );
}
