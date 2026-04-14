import type { ReactNode } from 'react';

/**
 * @fileOverview Layout para el grupo de rutas (auth).
 * Sin fondo adicional - usa el del layout global.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {children}
    </div>
  );
}
