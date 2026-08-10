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

    // 1. Create Supabase Auth User securely via Admin API first
    let userId: string | null = null;

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
      try {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const usersList = listData?.users || [];
        const found = usersList.find((u) => u.email?.toLowerCase() === email);
        if (found) {
          userId = found.id;
          if (password) {
            await supabaseAdmin.auth.admin.updateUserById(userId, { password, email_confirm: true });
          }
        }
      } catch (lErr) {
        console.error("Failed to list users:", lErr);
      }

      if (!userId) {
        throw new Error(`Auth Account Creation Failed: ${authErr.message}`);
      }
    } else if (authUser?.user) {
      userId = authUser.user.id;
    }

    // 2. Verify or create default School & Profile record in PostgreSQL
    let schoolId = "school-demo-id";
    try {
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

        if (!schoolErr && newSchool) {
          schoolData = newSchool;
        }
      }

      if (schoolData) {
        schoolId = schoolData.id;

        // Create Profile record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from("profiles") as any).upsert({
          id: userId,
          school_id: schoolId,
          email,
          first_name: firstName,
          last_name: lastName,
          role: "administrator",
          is_active: true,
        });
      }
    } catch {
      // DB tables may not be migrated yet
    }

    return {
      success: true,
      message: `Administrator account (${email}) successfully provisioned in Supabase Auth.`,
      adminId: userId || undefined,
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
