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
import { LogOut, Settings, User, Bell, Search, ChevronDown, Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getSession, logout, Session } from '@/lib/session';
import { mockEmployees } from '@/lib/mock-data';
import { MainNav } from '@/components/main-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useSessionValidation } from '@/hooks/useSessionValidation';

// Logo desde public folder
const LOGO_WORDMARK_SRC = '/logotipo-conectar-transparent.png';
const LOGO_ICON_SRC = '/marca-conectar-transparent.png';

export function AppShell({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Validate local session state every 30 s; redirect to /login on desync
  useSessionValidation();

  const isGeneralManager = useMemo(() => {
    if (!session || session.role !== 'manager') return false;
    const currentUser = mockEmployees.find(e => e.id === session.userId);
    return currentUser?.reportaA === null;
  }, [session]);

  useEffect(() => {
    const sessionData = getSession();
    if (!sessionData || sessionData.role === 'guest' || !sessionData.userId) {
      // Sesión inválida, limpiar y redirigir a login
      localStorage.removeItem('conectar_session');
      router.replace('/login');
    } else {
      setSession(sessionData);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Cargando sesión...
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
    if (session.role === 'admin') return 'Administrador';
    if (isGeneralManager) return 'Gerente General';
    if (session.role === 'manager') return 'Manager';
    return 'Empleado';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full max-w-none overflow-x-hidden bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
          <div className="flex flex-col h-full">
            <SidebarHeader className="border-b border-sidebar-border px-3 py-2">
              <Link href="/dashboard" className="flex h-[96px] w-full items-center justify-center overflow-visible">
                <Image
                  src={LOGO_ICON_SRC}
                  alt="Marca ConectAr"
                  width={245}
                  height={245}
                  className="my-[-70px] h-auto w-[245px] object-contain"
                  style={{
                    filter:
                      'drop-shadow(0 0 1.5px rgba(255,255,255,0.95)) drop-shadow(0 0 3px rgba(255,255,255,0.88)) drop-shadow(0 8px 14px rgba(53,127,220,0.38))',
                  }}
                  priority
                />
              </Link>
            </SidebarHeader>
            <SidebarContent className="flex-1 p-2">
              <MainNav />
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-primary/30">
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
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </SidebarFooter>
          </div>
        </Sidebar>

        <SidebarInset className="flex w-full min-w-0 flex-1 flex-col">
          {/* Header Superior */}
          <header className="flex h-20 w-full items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
            <div className="flex min-w-0 items-center gap-4">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-[96px] items-center justify-center overflow-visible border-b px-3 py-2">
                    <Image
                      src={LOGO_ICON_SRC}
                      alt="Marca ConectAr"
                      width={245}
                      height={245}
                      className="my-[-70px] h-auto w-[245px] object-contain"
                      style={{
                        filter:
                          'drop-shadow(0 0 1.5px rgba(255,255,255,0.95)) drop-shadow(0 0 3px rgba(255,255,255,0.88)) drop-shadow(0 8px 14px rgba(53,127,220,0.38))',
                      }}
                    />
                  </div>
                  <nav className="p-2">
                    <MainNav />
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Logo + Título */}
              <div className="flex min-w-0 items-center gap-3">
                <Image
                  src={LOGO_WORDMARK_SRC}
                  alt="ConectAr"
                  width={148}
                  height={50}
                  className="h-auto w-[108px] object-contain"
                />
                <div className="min-w-0">
                  <h1 className="truncate font-headline text-xl font-bold text-foreground">
                    {pathname === '/dashboard' && 'Dashboard'}
                    {pathname === '/employees' && 'Empleados'}
                    {pathname === '/leave' && 'Ausencias'}
                    {pathname === '/payslips' && 'Nómina'}
                    {pathname === '/recruitment' && 'Reclutamiento'}
                    {pathname === '/organization-chart' && 'Organigrama'}
                    {pathname === '/my-portal' && 'Mi Portal'}
                    {!['/dashboard', '/employees', '/leave', '/payslips', '/recruitment', '/organization-chart', '/my-portal'].includes(pathname) && 'ConectAr'}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Gestión humana, conectada
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones derechas */}
            <div className="flex items-center gap-4 pl-2">
              {/* Búsqueda Desktop */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9 w-64"
                />
              </div>

              {/* Notificaciones */}
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificaciones</span>
              </Button>

              {/* Perfil Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-primary/30">
                      <AvatarImage src="https://placehold.co/40x40.png" alt={session.userName || 'Usuario'} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {session.userName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground">{session.userName}</span>
                      <span className="text-xs text-muted-foreground">{getRoleDisplayName()}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-56">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/employees?id=${session.userId}`)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Contenido Principal */}
          <main className="flex w-full min-w-0 flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
            <div className="w-full min-w-0 rounded-2xl border bg-card p-6 shadow-sm">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
