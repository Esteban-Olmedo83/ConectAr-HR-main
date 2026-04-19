import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Middleware de Protección de Rutas — ConectAr HR
 * 
 * PROTEGE:
 *  - Rutas de aplicación contra acceso no autenticado
 *  - Rutas de owner contra roles no autorizados
 *  - Rutas de auth contra usuarios ya logueados
 * 
 * PERMITE:
 *  - /login y /signup sin autenticación
 *  - Redirección inteligente según el rol del usuario
 */

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = ['/login', '/signup'];

// Rutas del portal Owner (solo rol 'owner')
const OWNER_ROUTES = ['/owner'];

// Rutas de la aplicación (requieren autenticación)
const APP_ROUTES = ['/dashboard', '/employees', '/attendance', '/leave', '/payslips', '/recruitment', '/organization-chart', '/my-portal', '/communications'];

// Ruta de login por defecto
const DEFAULT_LOGIN = '/login';

// Rutas de redirección por rol
const ROLE_REDIRECTS: Record<string, string> = {
  owner: '/owner/dashboard',
  admin: '/dashboard',
  manager: '/dashboard',
  employee: '/dashboard',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Rutas de API - permitir siempre (son manejadas internamente)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Obtener sesión desde las cookies
  const sessionCookie = request.cookies.get('conectar_session');
  let hasSession = !!sessionCookie;

  let sessionData: any = null;
  if (hasSession && sessionCookie) {
    try {
      // La cookie está codificada en Base64, primero decodificar antes de parsear JSON
      console.log('[Middleware] Cookie recibida, longitud:', sessionCookie.value.length);
      const decodedValue = atob(sessionCookie.value);
      console.log('[Middleware] Cookie decodificada desde Base64');
      sessionData = JSON.parse(decodedValue);
      console.log('[Middleware] Cookie parseada como JSON, role:', sessionData?.role);
    } catch (error) {
      // Cookie corrupta, tratar como sin sesión
      console.warn('[Middleware] Error al decodificar/parsear cookie:', error instanceof Error ? error.message : String(error));
      hasSession = false;
    }
  }

  const userRole = sessionData?.role || 'guest';
  const isSessionExpired = sessionData?.expiresAt
    ? new Date(sessionData.expiresAt) < new Date()
    : true;

  // 1. Rutas públicas - permitir acceso siempre
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // Si ya tiene sesión válida, redirigir al dashboard correspondiente
    if (hasSession && !isSessionExpired && userRole !== 'guest') {
      const redirectPath = ROLE_REDIRECTS[userRole] || '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  // 2. Rutas del Owner - solo rol 'owner'
  if (OWNER_ROUTES.some(route => pathname.startsWith(route))) {
    if (!hasSession || isSessionExpired || userRole !== 'owner') {
      // No autorizado - redirigir a login con retorno
      const loginUrl = new URL(DEFAULT_LOGIN, request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Rutas de la aplicación - requieren autenticación
  if (APP_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/') {
    if (!hasSession || isSessionExpired || userRole === 'guest') {
      // No autenticado - redirigir a login con retorno
      const loginUrl = new URL(DEFAULT_LOGIN, request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      loginUrl.searchParams.set('error', 'authentication_required');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Otras rutas - permitir acceso (assets, APIs, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match todas las rutas excepto:
     * - Archivos estáticos (/favicon.ico, /images/, etc.)
     * - APIs (/api/*)
     * - Next.js internals
     */
    '/((?!_next/static|_next/image|favicon.ico|images|assets|api/).*)',
  ],
};
