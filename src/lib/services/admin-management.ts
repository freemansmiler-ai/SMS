import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@/types";

export interface AdministratorRecord {
  id: string;
  school_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminParams {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface CreateAdminResult {
  success: boolean;
  admin?: AdministratorRecord;
  tempPassword?: string;
  error?: string;
}

const MOCK_ADMINISTRATORS: AdministratorRecord[] = [
  {
    id: "usr_admin_01",
    school_id: "sch_01",
    email: "admin@ghanaschools.edu.gh",
    first_name: "Kofi",
    last_name: "Owusu-Ansah",
    role: "administrator",
    phone: "+233 24 412 3456",
    avatar_url: null,
    is_active: true,
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-10T08:00:00Z",
  },
  {
    id: "usr_admin_02",
    school_id: "sch_01",
    email: "kwaku.mensah@ghanaschools.edu.gh",
    first_name: "Kwaku",
    last_name: "Mensah",
    role: "administrator",
    phone: "+233 20 555 8899",
    avatar_url: null,
    is_active: true,
    created_at: "2026-02-15T09:30:00Z",
    updated_at: "2026-02-15T09:30:00Z",
  },
  {
    id: "usr_admin_03",
    school_id: "sch_01",
    email: "ama.boakye@ghanaschools.edu.gh",
    first_name: "Ama",
    last_name: "Boakye",
    role: "administrator",
    phone: "+233 27 333 1122",
    avatar_url: null,
    is_active: false,
    created_at: "2026-03-01T10:15:00Z",
    updated_at: "2026-04-10T14:20:00Z",
  },
];

function generateTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + digits + symbols;

  const arr = [
    upper.charAt(Math.floor(Math.random() * upper.length)),
    lower.charAt(Math.floor(Math.random() * lower.length)),
    digits.charAt(Math.floor(Math.random() * digits.length)),
    symbols.charAt(Math.floor(Math.random() * symbols.length)),
  ];

  for (let i = 0; i < 8; i++) {
    arr.push(all.charAt(Math.floor(Math.random() * all.length)));
  }

  return arr.sort(() => 0.5 - Math.random()).join("");
}

/**
 * Fetch all Administrators for the authenticated user's school.
 */
export async function getAdministrators(params?: {
  search?: string;
  status?: string;
}): Promise<AdministratorRecord[]> {
  const config = getSupabaseEnvConfig();

  if (!config.isConfigured || config.isPlaceholder) {
    let list = [...MOCK_ADMINISTRATORS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.first_name.toLowerCase().includes(q) ||
          a.last_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }
    if (params?.status === "active") {
      list = list.filter((a) => a.is_active);
    } else if (params?.status === "inactive") {
      list = list.filter((a) => !a.is_active);
    }
    return list;
  }

  try {
    const supabase = createBrowserClient();

    // Verify current authenticated user
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return MOCK_ADMINISTRATORS;

    // Get current administrator's profile to derive school_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", authData.user.id)
      .single();

    if (!currentProfile || currentProfile.role !== "administrator") {
      throw new Error("SECURITY VIOLATION: Only administrators can view administrator accounts.");
    }

    // Query profiles for role = 'administrator' and matching school_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("profiles") as any)
      .select("*")
      .eq("school_id", currentProfile.school_id)
      .eq("role", "administrator")
      .order("created_at", { ascending: false });

    if (params?.search) {
      query = query.or(
        `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
      );
    }

    if (params?.status === "active") {
      query = query.eq("is_active", true);
    } else if (params?.status === "inactive") {
      query = query.eq("is_active", false);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return data || [];
  } catch {
    return MOCK_ADMINISTRATORS;
  }
}

/**
 * Securely create a new Administrator account for the current school.
 * Server-derived school_id & role = 'administrator'.
 */
export async function createAdministratorAccount(
  params: CreateAdminParams
): Promise<CreateAdminResult> {
  const config = getSupabaseEnvConfig();
  const cleanEmail = params.email.trim().toLowerCase();

  if (!cleanEmail || !params.firstName || !params.lastName) {
    return { success: false, error: "First Name, Last Name, and Email are required." };
  }

  const tempPassword = generateTempPassword();

  if (!config.isConfigured || config.isPlaceholder) {
    const newAdmin: AdministratorRecord = {
      id: `usr_admin_${Date.now()}`,
      school_id: "sch_01",
      email: cleanEmail,
      first_name: params.firstName,
      last_name: params.lastName,
      role: "administrator",
      phone: params.phone || null,
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_ADMINISTRATORS.unshift(newAdmin);
    return { success: true, admin: newAdmin, tempPassword };
  }

  try {
    const res = await fetch("/api/admin/administrators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create administrator account.";
    return { success: false, error: msg };
  }
}

/**
 * Toggle Administrator account active status (Deactivate / Reactivate).
 */
export async function toggleAdministratorStatus(
  adminId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();

  if (!config.isConfigured || config.isPlaceholder) {
    const found = MOCK_ADMINISTRATORS.find((a) => a.id === adminId);
    if (found) {
      found.is_active = isActive;
      found.updated_at = new Date().toISOString();
    }
    return { success: true };
  }

  try {
    const supabase = createBrowserClient();
    const supabaseAdmin = createAdminClient();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { success: false, error: "Unauthorized." };

    if (authData.user.id === adminId && !isActive) {
      return { success: false, error: "SECURITY VIOLATION: Administrators cannot deactivate their own account." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", authData.user.id)
      .single();

    if (!currentProfile || currentProfile.role !== "administrator") {
      return { success: false, error: "SECURITY VIOLATION: Only administrators can modify account status." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.from("profiles") as any)
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", adminId)
      .eq("school_id", currentProfile.school_id);

    if (error) return { success: false, error: error.message };

    // Audit log
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin.from("audit_logs") as any).insert({
        school_id: currentProfile.school_id,
        user_id: authData.user.id,
        user_role: "administrator",
        action: isActive ? "ADMINISTRATOR_REACTIVATED" : "ADMINISTRATOR_DEACTIVATED",
        entity: "profiles",
        entity_id: adminId,
        details: { target_admin_id: adminId, is_active: isActive },
      });
    } catch {
      // Ignore
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Status update failed.";
    return { success: false, error: msg };
  }
}

/**
 * Reset Administrator Password & generate new temporary credentials.
 */
export async function resetAdministratorPassword(
  adminId: string
): Promise<{ success: boolean; tempPassword?: string; error?: string }> {
  const config = getSupabaseEnvConfig();
  const tempPassword = generateTempPassword();

  if (!config.isConfigured || config.isPlaceholder) {
    return { success: true, tempPassword };
  }

  try {
    const supabase = createBrowserClient();
    const supabaseAdmin = createAdminClient();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { success: false, error: "Unauthorized." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", authData.user.id)
      .single();

    if (!currentProfile || currentProfile.role !== "administrator") {
      return { success: false, error: "SECURITY VIOLATION: Only administrators can reset administrator credentials." };
    }

    // Verify target administrator belongs to the same school
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: targetAdmin } = await (supabase.from("profiles") as any)
      .select("id, school_id, email")
      .eq("id", adminId)
      .single();

    if (!targetAdmin || targetAdmin.school_id !== currentProfile.school_id) {
      return { success: false, error: "SECURITY VIOLATION: Target administrator does not belong to your school." };
    }

    // Reset password in Supabase Auth via Admin API
    const { error: resetErr } = await supabaseAdmin.auth.admin.updateUserById(adminId, {
      password: tempPassword,
      user_metadata: { must_change_password: true },
    });

    if (resetErr) return { success: false, error: resetErr.message };

    // Audit Log
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin.from("audit_logs") as any).insert({
        school_id: currentProfile.school_id,
        user_id: authData.user.id,
        user_role: "administrator",
        action: "ADMINISTRATOR_PASSWORD_RESET",
        entity: "profiles",
        entity_id: adminId,
        details: { target_admin_id: adminId },
      });
    } catch {
      // Ignore
    }

    return { success: true, tempPassword };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Password reset failed.";
    return { success: false, error: msg };
  }
}
