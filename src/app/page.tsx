
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/session';

/**
 * ORQUESTADOR DE ENTRADA CANÓNICO (Raíz única)
 * Gestiona el flujo inicial de usuario evitando colisiones de rutas paralelas.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session || session.role === 'guest') {
      router.replace('/login');
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse font-headline uppercase tracking-widest">
          Iniciando ConectAr RRHH...
        </p>
      </div>
    </div>
  );
}
