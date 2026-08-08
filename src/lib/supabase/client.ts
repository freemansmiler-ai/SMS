import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";
import { getSupabaseEnvConfig } from "./config";

let cachedClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Creates or reuses a singleton Supabase client for use in Client Components (Browser).
 * Uses public NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createClient() {
  if (cachedClient) return cachedClient;
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnvConfig();
  cachedClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}
