/**
 * Client-safe Supabase exports.
 * For server components, Server Actions, or API Routes, import directly from '@/lib/supabase/server' or '@/lib/supabase/admin'.
 */

export { getSupabaseEnvConfig } from "./supabase/config";
export { createClient as createBrowserClient } from "./supabase/client";
export { checkSupabaseHealth } from "./supabase/health";
