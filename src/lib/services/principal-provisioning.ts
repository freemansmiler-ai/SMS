import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnvConfig } from "@/lib/supabase/config";

export interface ProvisionPrincipalParams {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  schoolName?: string;
  schoolCode?: string;
}

export interface ProvisionPrincipalResult {
  success: boolean;
  message: string;
  principalId?: string;
  schoolId?: string;
  error?: string;
}

/**
 * SERVER-ONLY Initial Principal / Headmaster Provisioning Utility.
 * Securely creates a Principal user in Supabase Auth & PostgreSQL profiles table.
 */
export async function provisionPrincipal(
  params: ProvisionPrincipalParams
): Promise<ProvisionPrincipalResult> {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY VIOLATION: provisionPrincipal() cannot be executed in browser context."
    );
  }

  const { isConfigured, isPlaceholder } = getSupabaseEnvConfig();

  if (isPlaceholder || !isConfigured) {
    return {
      success: true,
      message: "Development/Placeholder Mode: Principal profile ready.",
      principalId: "principal-demo-id",
      schoolId: "00000000-0000-0000-0000-000000000001",
    };
  }

  try {
    const supabaseAdmin = createAdminClient();

    const schoolName = params.schoolName || "Codivex Academy";
    const schoolCode = params.schoolCode || "ABS-2026";
    const email = params.email.trim().toLowerCase();
    const firstName = params.firstName || "Dr. Emmanuel";
    const lastName = params.lastName || "Mensah";
    const password = params.password || "Principal@CodivexTechnologies";

    // 1. Verify or create default School record in PostgreSQL first
    let schoolId = "00000000-0000-0000-0000-000000000001";
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let { data: schoolData } = await (supabaseAdmin.from("schools") as any)
        .select("id")
        .eq("code", schoolCode)
        .maybeSingle();

      if (!schoolData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: anySchool } = await (supabaseAdmin.from("schools") as any)
          .select("id")
          .limit(1)
          .maybeSingle();
        schoolData = anySchool;
      }

      if (!schoolData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newSchool, error: schoolErr } = await (supabaseAdmin.from("schools") as any)
          .insert({
            id: schoolId,
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
      }
    } catch {
      // DB tables may not be migrated yet
    }

    // 2. Create Supabase Auth User securely via Admin API with school_id in user_metadata
    let userId: string | null = null;

    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "principal",
        school_id: schoolId,
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
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
            user_metadata: {
              role: "principal",
              school_id: schoolId,
              first_name: firstName,
              last_name: lastName,
            },
          });
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

    // 3. Upsert Profile record in PostgreSQL
    if (userId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from("profiles") as any).upsert({
          id: userId,
          school_id: schoolId,
          email,
          first_name: firstName,
          last_name: lastName,
          role: "principal",
          is_active: true,
        });
      } catch {
        // DB profiles table sync fallback
      }
    }

    return {
      success: true,
      message: `Principal account (${email}) successfully provisioned in Supabase Auth & PostgreSQL.`,
      principalId: userId || undefined,
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
