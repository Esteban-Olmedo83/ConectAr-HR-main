'use client';

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import type { ReactNode } from 'react';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Settings, User, Bell, Search, ChevronDown, Palette } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getSession, logout, Session, sessionManager } from '@/lib/session';
import { mockEmployees } from '@/lib/mock-data';
import { MainNav } from '@/components/main-nav';
import { useSessionValidation } from '@/hooks/useSessionValidation';
import { useTheme, VisualTheme } from '@/hooks/use-theme';
import { useLocale } from '@/hooks/use-locale';

// Logo desde public folder
const LOGO_WORDMARK_SRC = '/logotipo-conectar-transparent.png';
const LOGO_ICON_SRC = '/marca-conectar-transparent.png';

const THEME_CYCLE: VisualTheme[] = ['clasico', 'dark', 'purpura', 'esmeralda', 'sunset'];

function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
      title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      className="text-muted-foreground hover:text-foreground"
    >
      <span className="text-base" role="img" aria-label={locale === 'es' ? 'Argentina flag' : 'US flag'}>
        {locale === 'es' ? '🇦🇷' : '🇺🇸'}
      </span>
    </Button>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const currentIndex = THEME_CYCLE.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex]);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={`Cambiar tema (actual: ${theme})`}
      className="text-muted-foreground hover:text-foreground"
    >
      <Palette className="h-5 w-5" />
    </Button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();

  // Validate local session state every 30 s; redirect to /login on desync
  useSessionValidation();

  const isGeneralManager = useMemo(() => {
    if (!session || session.role !== 'manager') return false;
    const currentUser = mockEmployees.find(e => e.id === session.userId);
    return currentUser?.reportaA === null;
  }, [session]);

  useEffect(() => {
    const sessionData = getSession();

    if (sessionData && sessionData.userId) {
      // Sesión válida en sessionStorage — camino rápido
      setSession(sessionData);
      setLoading(false);
      return;
    }

    // sessionStorage vacío (refresh de página, nueva pestaña, nuevo deploy).
    // Intentar restaurar la sesión desde la cookie HttpOnly del servidor
    // antes de redirigir a login, para evitar el bucle:
    //   AppShell → /login → middleware redirige a /dashboard → AppShell → …
    fetch('/api/auth/refresh-session', { method: 'POST' })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.session) {
            const restoredSession: Session = {
              userId: data.session.userId,
              userName: data.session.userName,
              role: data.session.role,
              isManager: data.session.role === 'admin' || data.session.role === 'manager',
              expiresAt: new Date(data.session.expiresAt),
            };
            sessionManager.setSession(restoredSession);
            setSession(restoredSession);
            setLoading(false);
          } else {
            router.replace('/login');
          }
        } else {
          router.replace('/login');
        }
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {t.common.loading}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    console.log('[AppShell] Iniciando logout...');

    try {
      // 1. Limpiar sessionStorage del lado del cliente inmediatamente
      console.log('[AppShell] Limpiando sessionStorage...');
      logout();
      console.log('[AppShell] SessionStorage limpiado');

      // 2. Llamar al API para eliminar la cookie HttpOnly del servidor
      console.log('[AppShell] Llamando API logout...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('[AppShell] Logout API retornó status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.warn('[AppShell] Logout API error:', response.status, errorData);
      } else {
        const responseData = await response.json().catch(() => ({}));
        console.log('[AppShell] Logout API exitosa:', responseData);
      }

      // 3. Hard redirect via window.location para garantizar que:
      //    a) El browser envíe una nueva solicitud HTTP real (no client-side navigation)
      //    b) El middleware reciba la solicitud SIN la cookie (ya eliminada por el Set-Cookie)
      //    c) Se evita la race condition donde router.push() podría ejecutarse antes
      //       de que el Set-Cookie del response del API sea procesado por el browser
      console.log('[AppShell] Redirigiendo a /login...');
      window.location.href = '/login';

    } catch (error) {
      console.error('[AppShell] Error en logout:', error instanceof Error ? error.message : String(error));
      console.error('[AppShell] Stack trace:', error instanceof Error ? error.stack : 'N/A');

      // Fallback: aunque falle el API, forzar hard redirect para limpiar estado
      console.log('[AppShell] Forzando logout local y redirección a login');
      logout();
      window.location.href = '/login';
    }
  };

  const getRoleDisplayName = () => {
    if (session.role === 'admin') return t.common.admin;
    if (isGeneralManager) return t.common.generalManager;
    if (session.role === 'manager') return t.common.manager;
    return t.common.employee;
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard') return t.nav.dashboard;
    if (pathname === '/employees') return t.nav.employees;
    if (pathname === '/leave') return t.nav.leave;
    if (pathname === '/payslips') return t.nav.payslips;
    if (pathname === '/recruitment') return t.nav.recruitment;
    if (pathname === '/organization-chart') return t.nav.orgChart;
    if (pathname === '/my-portal') return t.nav.myPortal;
    return 'ConectAr';
  };

  return (
    <SidebarProvider>
      {/* Sidebar: en desktop fijo a la izquierda, en mobile se abre como Sheet via SidebarTrigger */}
      <Sidebar className="border-r border-sidebar-border bg-sidebar">
        <div className="flex flex-col h-full">
          <SidebarHeader className="border-b border-sidebar-border px-3 py-3 shrink-0">
            <Link href="/dashboard" className="flex w-full items-center justify-center py-1">
              <Image
                src={LOGO_ICON_SRC}
                alt="Marca ConectAr"
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
            <MainNav />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-primary/30 shrink-0">
                <AvatarImage src="https://placehold.co/40x40.png" alt={session.userName || 'Usuario'} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {session.userName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                  {session.userName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getRoleDisplayName()}
                </p>
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

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* Header Superior */}
        <header className="flex h-16 w-full shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* Trigger mobile: abre el Sidebar como Sheet. MainNav ya llama setOpenMobile(false) al navegar */}
            <SidebarTrigger className="md:hidden -ml-1" />

            {/* Logo + Título */}
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
                <p className="text-xs text-muted-foreground leading-tight">
                  {t.common.hrSystem}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones derechas */}
          <div className="flex items-center gap-1 pl-2">
            {/* Búsqueda Desktop */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.common.search}
                className="pl-9 w-56"
              />
            </div>

            <LanguageToggle />
            <ThemeToggle />

            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="sr-only">{t.common.notifications}</span>
            </Button>

            {/* Perfil Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8 border border-primary/30">
                    <AvatarImage src="https://placehold.co/40x40.png" alt={session.userName || 'Usuario'} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {session.userName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground leading-tight">{session.userName}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{getRoleDisplayName()}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/employees?id=${session.userId}`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t.common.profile}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t.nav.settings}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.common.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Contenido Principal — scrollable */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="w-full rounded-2xl border bg-card p-4 md:p-6 shadow-sm">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
