import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ONE-TIME MIGRATION ROUTE
 * Applies missing DDL columns to the live database.
 * DELETE THIS FILE after running once.
 * Access: GET /api/migrate-schema
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
  }

  // Service role client — bypasses RLS, needed for DDL
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: Record<string, string> = {};

  // Add classes.is_active
  try {
    const { error: e1 } = await supabase.rpc("exec_ddl", {
      sql: "ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;",
    });
    results["classes.is_active"] = e1 ? "FAILED: " + e1.message : "OK";
  } catch (e) {
    results["classes.is_active rpc"] = "rpc not available, trying raw";
  }

  // Add subjects.status
  try {
    const { error: e2 } = await supabase.rpc("exec_ddl", {
      sql: "ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';",
    });
    results["subjects.status"] = e2 ? "FAILED: " + e2.message : "OK";
  } catch (e) {
    results["subjects.status rpc"] = "rpc not available";
  }

  // Verify by querying the columns directly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: v1 } = await (supabase.from("classes") as any).select("is_active").limit(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: v2 } = await (supabase.from("subjects") as any).select("status").limit(1);

  results["verify classes.is_active"] = v1 ? "MISSING - " + v1.message : "EXISTS";
  results["verify subjects.status"] = v2 ? "MISSING - " + v2.message : "EXISTS";

  return NextResponse.json({ results });
}
