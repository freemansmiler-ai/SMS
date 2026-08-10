import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnvConfig } from "@/lib/supabase/config";

export interface ProvisionAdminParams {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  schoolName?: string;
  schoolCode?: string;
}

export interface ProvisionAdminResult {
  success: boolean;
  message: string;
  adminId?: string;
  schoolId?: string;
  error?: string;
}

/**
 * SERVER-ONLY Initial Administrator Provisioning Utility.
 * Securely creates the primary Administrator user in Supabase Auth & PostgreSQL profiles.
 * MUST ONLY be executed in server-side administrative tasks.
 */
export async function provisionInitialAdministrator(
  params: ProvisionAdminParams
): Promise<ProvisionAdminResult> {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY VIOLATION: provisionInitialAdministrator() cannot be executed in browser context."
    );
  }

  const { isConfigured, isPlaceholder } = getSupabaseEnvConfig();

  if (isPlaceholder || !isConfigured) {
    return {
      success: true,
      message: "Development/Placeholder Mode: Initial Administrator profile ready.",
      adminId: "admin-demo-id",
      schoolId: "school-demo-id",
    };
  }

  try {
    const supabaseAdmin = createAdminClient();

    const schoolName = params.schoolName || "Achimota Basic School";
    const schoolCode = params.schoolCode || "ABS-2026";
    const email = params.email.trim().toLowerCase();
    const firstName = params.firstName || "System";
    const lastName = params.lastName || "Administrator";
    const password = params.password || "AdminPass123!";

    // 1. Verify or create default School record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data: schoolData } = await (supabaseAdmin.from("schools") as any)
      .select("id")
      .eq("code", schoolCode)
      .maybeSingle();

    if (!schoolData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newSchool, error: schoolErr } = await (supabaseAdmin.from("schools") as any)
        .insert({
          name: schoolName,
          code: schoolCode,
          address: "P.O. Box AH 80, Achimota, Accra, Ghana",
          phone: "+233 302 400 100",
          email: "info@achimota.edu.gh",
          is_active: true,
        })
        .select("id")
        .single();

      if (schoolErr) throw new Error(`School Creation Failed: ${schoolErr.message}`);
      schoolData = newSchool;
    }

    const schoolId = schoolData.id;

    // 2. Check if administrator profile already exists for this email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingProfile } = await (supabaseAdmin.from("profiles") as any)
      .select("id, role")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return {
        success: true,
        message: "Administrator profile already provisioned for this email.",
        adminId: existingProfile.id,
        schoolId,
      };
    }

    // 3. Create Supabase Auth User securely via Admin API
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "administrator",
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (authErr) {
      // If user already exists in auth, retrieve user id
      if (authErr.message.includes("already registered") || authErr.message.includes("already exists")) {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const found = listData.users.find((u) => u.email?.toLowerCase() === email);
        if (found) {
          // Insert profile record
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabaseAdmin.from("profiles") as any).upsert({
            id: found.id,
            school_id: schoolId,
            email,
            first_name: firstName,
            last_name: lastName,
            role: "administrator",
            is_active: true,
          });

          return {
            success: true,
            message: "Administrator account linked to existing auth user.",
            adminId: found.id,
            schoolId,
          };
        }
      }
      throw new Error(`Auth Account Creation Failed: ${authErr.message}`);
    }

    const userId = authUser.user.id;

    // 4. Create corresponding Profile record in PostgreSQL profiles table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileErr } = await (supabaseAdmin.from("profiles") as any).insert({
      id: userId,
      school_id: schoolId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: "administrator",
      is_active: true,
    });

    if (profileErr) throw new Error(`Profile Creation Failed: ${profileErr.message}`);

    return {
      success: true,
      message: "Initial Administrator account successfully provisioned.",
      adminId: userId,
      schoolId,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Provisioning failed.";
    return {
      success: false,
      message: msg,
      error: msg,
    };
  }
}
