'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, logout } from '@/lib/session';
import Image from 'next/image';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Building2, LayoutDashboard, CreditCard, LogOut, Cog,
  Puzzle, Zap, ShieldAlert, ChevronDown,
  Users, Clock, CalendarOff, Banknote, Briefcase,
  Network, MessageSquare, User, Globe,
} from 'lucide-react';

const LOGO_ICON_SRC     = '/marca-conectar-transparent.png';
const LOGO_WORDMARK_SRC = '/logotipo-conectar-transparent.png';

// ─── Nav items ────────────────────────────────────────────────────────────────

const OWNER_ITEMS = [
  { name: 'Dashboard',   href: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'Clientes',    href: '/owner/clients',   icon: Building2 },
  { name: 'Facturación', href: '/owner/billing',   icon: CreditCard },
];

const SYSTEM_PARENT   = { name: 'Sistema y Desarrollo', href: '/owner/system-dev', icon: Cog };
const SYSTEM_CHILDREN = [
  { name: 'Módulos del Sistema', href: '/owner/system-dev/modules',  icon: Puzzle },
  { name: 'HotFixes',            href: '/owner/system-dev/hotfixes', icon: Zap },
  { name: 'Seguridad',           href: '/owner/system-dev/security', icon: ShieldAlert },
];

// Sandbox module routes — all inside /owner/sandbox/* so the owner layout persists
const MODULE_ITEMS = [
  { name: 'Dashboard',      href: '/owner/sandbox/dashboard',          icon: LayoutDashboard },
  { name: 'Empleados',      href: '/owner/sandbox/employees',          icon: Users },
  { name: 'Asistencia',     href: '/owner/sandbox/attendance',         icon: Clock },
  { name: 'Licencias',      href: '/owner/sandbox/leave',              icon: CalendarOff },
  { name: 'Recibos',        href: '/owner/sandbox/payslips',           icon: Banknote },
  { name: 'Reclutamiento',  href: '/owner/sandbox/recruitment',        icon: Briefcase },
  { name: 'Organigrama',    href: '/owner/sandbox/organization-chart', icon: Network },
  { name: 'Comunicaciones', href: '/owner/sandbox/communications',     icon: MessageSquare },
  { name: 'Portal Emp.',    href: '/owner/sandbox/my-portal',                   icon: User },
  { name: '— Mi Perfil',   href: '/owner/sandbox/my-portal/my-file',           icon: User },
  { name: '— Asistencia',  href: '/owner/sandbox/my-portal/attendance',        icon: Clock },
  { name: '— Licencias',   href: '/owner/sandbox/my-portal/leaves',            icon: CalendarOff },
  { name: '— Recibos',     href: '/owner/sandbox/my-portal/payslips',          icon: Banknote },
  { name: 'Comunidad',      href: '/owner/sandbox/my-portal/community',         icon: Globe },
];

// ─── Inner nav — needs useSidebar ─────────────────────────────────────────────

function OwnerNav() {
  const pathname = usePathname();
  const { setOpenMobile, state } = useSidebar();

  const isSystemActive = pathname.startsWith(SYSTEM_PARENT.href);
  const [systemOpen, setSystemOpen] = useState(isSystemActive);
  const [modulesOpen, setModulesOpen] = useState(
    MODULE_ITEMS.some(m => pathname.startsWith(m.href))
  );

  useEffect(() => { if (isSystemActive) setSystemOpen(true); }, [isSystemActive]);

  const nav = () => setOpenMobile(false);

  return (
    <>
      {/* ── Portal Propietario ──────────────────────────────────────────── */}
      <SidebarGroup>
        <SidebarGroupLabel>Portal Propietario</SidebarGroupLabel>
        <SidebarMenu>
          {OWNER_ITEMS.map(item => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} onClick={nav}>
                <SidebarMenuButton
                  isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                  tooltip={{ children: item.name }}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}

          {/* Sistema y Desarrollo — collapsible */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isSystemActive}
              tooltip={{ children: SYSTEM_PARENT.name }}
              onClick={() => setSystemOpen(o => !o)}
              className="cursor-pointer"
            >
              <SYSTEM_PARENT.icon className="h-4 w-4" />
              <span>{SYSTEM_PARENT.name}</span>
              {state === 'expanded' && (
                <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform duration-200 ${systemOpen ? 'rotate-180' : ''}`} />
              )}
            </SidebarMenuButton>

            {systemOpen && state === 'expanded' && (
              <SidebarMenuSub>
                {SYSTEM_CHILDREN.map(child => (
                  <SidebarMenuSubItem key={child.href}>
                    <Link href={child.href} onClick={nav}>
                      <SidebarMenuSubButton isActive={pathname.startsWith(child.href)}>
                        <child.icon className="h-3.5 w-3.5" />
                        <span>{child.name}</span>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarSeparator className="my-1" />

      {/* ── Vista de Módulos ────────────────────────────────────────────── */}
      <SidebarGroup>
        <SidebarGroupLabel>Vista de Módulos</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={MODULE_ITEMS.some(m => pathname.startsWith(m.href))}
              tooltip={{ children: 'Ver módulos del sistema' }}
              onClick={() => setModulesOpen(o => !o)}
              className="cursor-pointer"
            >
              <Puzzle className="h-4 w-4" />
              <span>Módulos del Sistema</span>
              {state === 'expanded' && (
                <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform duration-200 ${modulesOpen ? 'rotate-180' : ''}`} />
              )}
            </SidebarMenuButton>

            {modulesOpen && state === 'expanded' && (
              <SidebarMenuSub>
                {MODULE_ITEMS.map(item => (
                  <SidebarMenuSubItem key={item.href}>
                    <Link href={item.href} onClick={nav}>
                      <SidebarMenuSubButton isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/my-portal')}>
                        <item.icon className="h-3.5 w-3.5" />
                        <span>{item.name}</span>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [ownerName, setOwnerName]       = useState('Propietario');

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'owner') {
      router.replace('/login');
    } else {
      setIsAuthorized(true);
      setOwnerName(session.userName ?? 'Propietario');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      logout();
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* continue */ } finally {
      window.location.href = '/login';
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const getPageTitle = () => {
    if (pathname === '/owner/dashboard')                    return 'Dashboard';
    if (pathname.startsWith('/owner/clients'))              return 'Clientes';
    if (pathname.startsWith('/owner/billing'))              return 'Facturación';
    if (pathname.startsWith('/owner/system-dev/modules'))   return 'Módulos del Sistema';
    if (pathname.startsWith('/owner/system-dev/hotfixes'))  return 'HotFixes';
    if (pathname.startsWith('/owner/system-dev/security'))  return 'Seguridad';
    if (pathname.startsWith('/owner/system-dev'))           return 'Sistema y Desarrollo';
    if (pathname.startsWith('/owner/sandbox/dashboard'))          return 'Dashboard — Banco de Pruebas';
    if (pathname.startsWith('/owner/sandbox/employees'))          return 'Empleados — Banco de Pruebas';
    if (pathname.startsWith('/owner/sandbox/attendance'))         return 'Asistencia — Banco de Pruebas';
    if (pathname.startsWith('/owner/sandbox/leave'))              return 'Licencias — Banco de Pruebas';
    if (pathname.startsWith('/owner/sandbox/payslips'))           return 'Recibos — Banco de Pruebas';
    if (pathname.startsWith('/owner/sandbox/recruitment'))        return 'Reclutamiento — Banco de Pruebas';
    if (pathname.startsWith('/owner/sandbox/organization-chart')) return 'Organigrama — Banco de Pruebas';
    if (pathname.startsWith('/owner/sandbox/communications'))     return 'Comunicaciones — Banco de Pruebas';
    if (pathname.startsWith('/owner/sandbox/my-portal'))          return 'Portal Empleado — Banco de Pruebas';
    return 'Portal Propietario';
  };

  return (
    <SidebarProvider>
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <Sidebar className="border-r border-sidebar-border bg-sidebar">
        <div className="flex flex-col h-full">
          <SidebarHeader className="border-b border-sidebar-border px-3 py-3 shrink-0">
            <Link href="/owner/dashboard" className="flex w-full items-center justify-center py-1">
              <Image
                src={LOGO_ICON_SRC}
                alt="ConectAr"
                width={120}
                height={120}
                className="h-auto w-[120px] object-contain"
                style={{
                  filter:
                    'drop-shadow(0 0 1.5px rgba(255,255,255,0.95)) drop-shadow(0 0 3px rgba(255,255,255,0.88)) drop-shadow(0 8px 14px rgba(53,127,220,0.38))',
                }}
                priority
              />
            </Link>
          </SidebarHeader>

          <SidebarContent className="flex-1 p-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <OwnerNav />
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-sidebar-border shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-primary/30 shrink-0">
                <AvatarImage src="https://placehold.co/40x40.png" alt={ownerName} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {ownerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{ownerName}</p>
                <p className="text-xs text-muted-foreground">Propietario</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </div>
      </Sidebar>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 w-full shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src={LOGO_WORDMARK_SRC}
                alt="ConectAr"
                width={148}
                height={50}
                className="h-auto w-[90px] object-contain md:w-[108px]"
              />
              <div className="min-w-0 hidden sm:block">
                <h1 className="truncate font-headline text-lg font-bold text-foreground leading-tight">
                  {getPageTitle()}
                </h1>
                <p className="text-xs text-muted-foreground leading-tight">Portal Propietario</p>
              </div>
            </div>
          </div>

          <Button variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="w-full rounded-2xl border bg-card p-4 md:p-6 shadow-sm">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
