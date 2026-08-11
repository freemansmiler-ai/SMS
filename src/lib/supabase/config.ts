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
  // Always prefer the JWT anon key — the Supabase SSR client requires a valid JWT.
  // NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is a non-JWT key and cannot authenticate
  // requests or be used with createBrowserClient / createServerClient.
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const isConfigured = Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("your-project-id") &&
      !supabaseUrl.includes("placeholder-project") &&
      !supabaseAnonKey.includes("your-anon-key") &&
      !supabaseAnonKey.includes("your-publishable-key")
  );

  const isPlaceholder = !isConfigured;

  return {
    supabaseUrl,
    supabaseAnonKey,
    serviceRoleKey,
    isConfigured,
    isPlaceholder,
  };
}
