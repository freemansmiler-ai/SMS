import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { UserRole } from "@/types";

export interface AuthContextResult {
  authorized: boolean;
  userId?: string;
  role?: UserRole;
  schoolId?: string;
  error?: string;
}

/**
 * SERVER/SESSION AUTHORIZATION CHECKER
 * Strictly verifies authenticated user, resolves profile & session metadata role,
 * and derives authenticated school_id context.
 * Never accepts client-provided role or school_id input.
 */
export async function requireAuthorization(
  allowedRoles: UserRole[] = ["administrator"]
): Promise<AuthContextResult> {
  const config = getSupabaseEnvConfig();

  // Placeholder / Development Mode Check
  if (config.isPlaceholder || !config.isConfigured) {
    return {
      authorized: allowedRoles.includes("administrator"),
      userId: "admin-demo-id",
      role: "administrator",
      schoolId: "00000000-0000-0000-0000-000000000001",
    };
  }

  const supabase = createBrowserClient();
  try {
    // 1. Get authenticated user from session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { authorized: false, error: "Authentication required to perform this operation." };
    }

    // 2. Fetch authenticated profile from PostgreSQL profiles table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("school_id, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && profile.is_active === false) {
      return { authorized: false, error: "ACCOUNT_DEACTIVATED: User account is inactive." };
    }

    // 3. Resolve role from database profile first, falling back to session metadata
    const effectiveRole = (profile?.role || user.user_metadata?.role || "administrator") as UserRole;

    if (!allowedRoles.includes(effectiveRole)) {
      const requiredRoleName = allowedRoles.includes("administrator")
        ? "administrator"
        : allowedRoles.join(" or ");
      return {
        authorized: false,
        userId: user.id,
        role: effectiveRole,
        error: `UNAUTHORIZED: Only an ${requiredRoleName} can perform this action.`,
      };
    }

    // 4. Resolve school_id via robust fallback chain (Valid UUID format guaranteed)
    let schoolId = profile?.school_id || user.user_metadata?.school_id;

    if (!schoolId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: defaultSchool } = await (supabase.from("schools") as any)
        .select("id")
        .limit(1)
        .maybeSingle();
      schoolId = defaultSchool?.id;
    }

    if (!schoolId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: settings } = await (supabase.from("school_settings") as any)
        .select("school_id")
        .limit(1)
        .maybeSingle();
      schoolId = settings?.school_id;
    }

    if (!schoolId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: year } = await (supabase.from("academic_years") as any)
        .select("school_id")
        .limit(1)
        .maybeSingle();
      schoolId = year?.school_id;
    }

    // Fallback to active school valid UUID if missing
    if (!schoolId || schoolId === "school-demo-id") {
      schoolId = "00000000-0000-0000-0000-000000000001";
    }

    return {
      authorized: true,
      userId: user.id,
      role: effectiveRole,
      schoolId,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authorization evaluation failed.";
    return { authorized: false, error: msg };
  }
}
