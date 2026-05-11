/**
 * Supabase client — browser-safe entry point.
 * Re-exports from supabase-server for backward compatibility.
 * Server-only features (admin client) are only accessible server-side.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  !supabaseUrl.includes('TU_PROYECTO') &&
  supabaseAnon.length > 0;

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export const supabaseConfig: SupabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnon,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
