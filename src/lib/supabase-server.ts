/**
 * @fileOverview Cliente Supabase para Server Components y API Routes — ConectAr HR
 *
 * IMPORTANTE:
 *  - Este módulo NUNCA se importa en componentes cliente ('use client').
 *  - Usa la service_role key solo en contextos server-side seguros.
 *  - La anon key se usa para operaciones con RLS activo.
 *
 * CONFIGURACIÓN requerida en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
 *   SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role   ← solo server-side
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  !supabaseUrl.includes('TU_PROYECTO') &&
  supabaseAnonKey.length > 0;

// ============================================================================
// CLIENTE ANON (con RLS activo) — para operaciones autenticadas normales
// ============================================================================

let _anonClient: SupabaseClient<Database> | null = null;

/**
 * Retorna el cliente Supabase con la anon key (RLS activo).
 * Retorna null si Supabase no está configurado.
 */
export function getSupabaseAnonClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;
  if (!_anonClient) {
    _anonClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _anonClient;
}

// ============================================================================
// CLIENTE ADMIN (service_role, sin RLS) — para operaciones administrativas
// ============================================================================

let _adminClient: SupabaseClient<Database> | null = null;

/**
 * Retorna el cliente Supabase con la service_role key (sin RLS).
 * SOLO usar en contextos server-side de confianza (API Routes, Server Actions).
 * Retorna null si la key de servicio no está configurada.
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured || !supabaseServiceKey) return null;
  if (!_adminClient) {
    _adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _adminClient;
}

// ============================================================================
// CLIENTE CON TOKEN DE USUARIO (para RLS con contexto de sesión)
// ============================================================================

/**
 * Crea un cliente temporal con el token de sesión del usuario.
 * Permite que RLS evalúe políticas con el userId correcto.
 *
 * @param accessToken - Token de acceso del usuario autenticado
 */
export function createSupabaseClientWithToken(
  accessToken: string
): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ============================================================================
// HELPERS DE QUERY
// ============================================================================

/**
 * Agrega filtros de paginación y orden a una query Supabase.
 * @param query - Query builder de Supabase
 * @param page - Número de página (base 1)
 * @param perPage - Registros por página
 * @param sortBy - Campo por el que ordenar
 * @param order - Dirección del orden
 */
export function applyPagination<T>(
  query: ReturnType<SupabaseClient<Database>['from']>['select'],
  page = 1,
  perPage = 20,
  sortBy = 'created_at',
  order: 'asc' | 'desc' = 'desc'
) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  return (query as any).order(sortBy, { ascending: order === 'asc' }).range(from, to);
}

/**
 * Maneja errores de Supabase de manera uniforme.
 * Lanza un Error con mensaje descriptivo.
 */
export function handleSupabaseError(error: { message: string; code?: string }): never {
  const message = `[Supabase] ${error.message}${error.code ? ` (code: ${error.code})` : ''}`;
  throw new Error(message);
}
