'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Calendar, Receipt, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MyPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Resumen', href: '/my-portal', icon: LayoutDashboard },
    { name: 'Mi Legajo', href: '/my-portal/my-file', icon: User },
    { name: 'Mis Licencias', href: '/my-portal/leaves', icon: Calendar },
    { name: 'Mis Recibos', href: '/my-portal/payslips', icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Mi Portal</h1>
        <p className="text-muted-foreground mt-2">Gestiona tu información personal, laboral y solicitudes.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap',
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
