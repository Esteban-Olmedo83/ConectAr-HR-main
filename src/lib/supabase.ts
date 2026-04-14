/**
 * Cliente de Supabase
 * Configuración e inicialización del cliente Supabase
 */

// Este archivo será completado cuando se integre Supabase
// Por ahora proporciona tipos y configuración básica

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export const supabaseConfig: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export function initSupabase(): void {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn('Advertencia: Variables de Supabase no configuradas');
  }
}

// TODO: Implementar cliente Supabase cuando se integre
// import { createClient } from '@supabase/supabase-js';
// export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
