'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, logout } from '@/lib/session';
import {
  Building2, LayoutDashboard, CreditCard, LogOut, Menu, Cog,
  Puzzle, Zap, ShieldAlert, ChevronDown, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const LOGO_SRC = '/logo-conectar-nuevo.jpg';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: { name: string; href: string; icon: React.ElementType }[];
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard',    href: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'Clientes',     href: '/owner/clients',   icon: Building2 },
  { name: 'Facturación',  href: '/owner/billing',   icon: CreditCard },
  {
    name: 'Sistema y Desarrollo',
    href: '/owner/system-dev',
    icon: Cog,
    children: [
      { name: 'Módulos del Sistema', href: '/owner/system-dev/modules',  icon: Puzzle },
      { name: 'HotFixes',            href: '/owner/system-dev/hotfixes', icon: Zap },
      { name: 'Seguridad',           href: '/owner/system-dev/security', icon: ShieldAlert },
    ],
  },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────

function ConectArLogo({ size = 'normal' }: { size?: 'small' | 'normal' | 'large' }) {
  const sz = { small: 'w-8 h-8', normal: 'w-10 h-10', large: 'w-12 h-12' }[size];
  return (
    <div className="flex items-center gap-2">
      <div className={`${sz} rounded-xl flex items-center justify-center bg-primary shadow-lg shadow-primary/20`}>
        <span className="text-lg font-bold text-primary-foreground">C</span>
      </div>
      <div className="flex flex-col">
        <h1 className="font-headline text-base font-bold leading-tight text-foreground">
          Conect<span className="text-primary">Ar</span>
        </h1>
        <p className="text-[8px] uppercase tracking-widest text-muted-foreground">
          Portal Propietario
        </p>
      </div>
    </div>
  );
}

// ─── Nav tree ─────────────────────────────────────────────────────────────────

function NavTree({ pathname }: { pathname: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // Auto-open groups if a child route is active
    const init: Record<string, boolean> = {};
    NAV_ITEMS.forEach(item => {
      if (item.children) {
        init[item.href] = item.children.some(c => pathname.startsWith(c.href)) ||
          pathname.startsWith(item.href);
      }
    });
    return init;
  });

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map(item => {
        const isActive = !item.children && pathname.startsWith(item.href);
        const isGroupActive = item.children?.some(c => pathname.startsWith(c.href));
        const isOpen = expanded[item.href];

        if (item.children) {
          return (
            <div key={item.href}>
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [item.href]: !prev[item.href] }))}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isGroupActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.name}</span>
                {isOpen
                  ? <ChevronDown className="h-3.5 w-3.5" />
                  : <ChevronRight className="h-3.5 w-3.5" />
                }
              </button>
              {isOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                  {item.children.map(child => {
                    const childActive = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                          childActive
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <child.icon className="h-3.5 w-3.5" />
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'owner') {
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      logout();
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // continue to login regardless
    } finally {
      router.push('/login');
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="w-64 flex flex-col shadow-xl z-10 hidden md:flex border-r bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <ConectArLogo size="normal" />
        </div>
        <NavTree pathname={pathname} />
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 h-20 border-b bg-card shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 flex flex-col">
                <div className="p-4 border-b">
                  <ConectArLogo size="normal" />
                </div>
                <NavTree pathname={pathname} />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <img
                src={LOGO_SRC}
                alt="ConectAr"
                className="w-10 h-10 object-contain rounded-lg"
                style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.4))' }}
                onError={e => { (e.target as HTMLImageElement).src = 'https://avatar.iran.liara.run/public/42'; }}
              />
              <div>
                <h1 className="font-headline text-xl font-bold text-foreground">Portal Propietario</h1>
                <p className="text-xs text-muted-foreground">Administración de la plataforma</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
