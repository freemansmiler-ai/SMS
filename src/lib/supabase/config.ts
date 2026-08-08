/**
 * Supabase Secure Environment Configuration
 *
 * Exposes environment variables for:
 * - Public Client: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - Server Admin: SUPABASE_SERVICE_ROLE_KEY
 */

export interface SupabaseEnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  serviceRoleKey?: string;
  isConfigured: boolean;
  isPlaceholder: boolean;
}

export function getSupabaseEnvConfig(): SupabaseEnvConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const isConfigured = Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("placeholder-project") &&
      !supabaseAnonKey.includes("your-anon-key")
  );

  const isPlaceholder = Boolean(
    supabaseUrl.includes("placeholder") || supabaseAnonKey.includes("placeholder")
  );

  return {
    supabaseUrl,
    supabaseAnonKey,
    serviceRoleKey,
    isConfigured,
    isPlaceholder,
  };
}
