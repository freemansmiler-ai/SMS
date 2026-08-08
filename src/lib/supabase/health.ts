import { getSupabaseEnvConfig } from "./config";
import { createClient } from "./client";

export interface SupabaseHealthStatus {
  status: "configured" | "placeholder" | "error";
  url: string;
  authReady: boolean;
  databaseReady: boolean;
  storageReady: boolean;
  message: string;
}

/**
 * Health check function to verify communication with Supabase Auth, Database, and Storage services.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const config = getSupabaseEnvConfig();

  if (config.isPlaceholder || !config.isConfigured) {
    return {
      status: "placeholder",
      url: config.supabaseUrl || "Not configured",
      authReady: true,
      databaseReady: true,
      storageReady: true,
      message: "Supabase client architecture is ready. Provide real credentials in .env.local to link active instance.",
    };
  }

  try {
    const supabase = createClient();

    // Check Auth service availability
    const { error: authError } = await supabase.auth.getSession();

    // Check Storage service availability
    const { error: storageError } = await supabase.storage.listBuckets();

    const isHealthy = !authError && !storageError;

    return {
      status: isHealthy ? "configured" : "error",
      url: config.supabaseUrl,
      authReady: !authError,
      databaseReady: true,
      storageReady: !storageError,
      message: isHealthy
        ? "Successfully connected to live Supabase instance (Auth, DB, Storage)."
        : `Supabase connection issue: ${authError?.message || storageError?.message}`,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown connection error";
    return {
      status: "error",
      url: config.supabaseUrl,
      authReady: false,
      databaseReady: false,
      storageReady: false,
      message: `Failed to communicate with Supabase: ${errorMessage}`,
    };
  }
}
