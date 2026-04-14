import { redirect } from 'next/navigation';
import { parseSessionCookie } from '@/lib/session';
import { cookies } from 'next/headers';

/**
 * ORQUESTADOR DE ENTRADA CANÓNICO (Raíz única)
 * Server-side redirect para evitar 404 en Vercel
 */
export default async function RootPage() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('conectar_session');
    const session = sessionCookie?.value ? parseSessionCookie(sessionCookie.value) : null;

    if (!session) {
      redirect('/login');
    } else if (session.role === 'owner') {
      redirect('/owner/dashboard');
    } else {
      redirect('/dashboard');
    }
  } catch {
    // Si hay error, redirigir a login de forma segura
    redirect('/login');
  }

  // Esto nunca se ejecutará porque redirect arriba
  return null;
}
