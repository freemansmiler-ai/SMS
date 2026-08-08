import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { getSupabaseEnvConfig } from "./config";

/**
 * Creates a Supabase Admin client with Service Role privileges.
 * WARNING: This client bypasses Row Level Security (RLS).
 * MUST ONLY be called on the server side in secure admin operations.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY VIOLATION: createAdminClient() cannot be invoked in the browser."
    );
  }

  const { supabaseUrl, serviceRoleKey } = getSupabaseEnvConfig();

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY environment variable is missing on the server."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
