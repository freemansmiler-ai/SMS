import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnvConfig } from "@/lib/supabase/config";
import { CreateAdminParams } from "@/lib/services/admin-management";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let pass = "Adm#2026!";
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export async function POST(request: Request) {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    const tempPassword = generateTempPassword();
    return NextResponse.json({ success: true, tempPassword });
  }

  try {
    const params: CreateAdminParams = await request.json();
    const cleanEmail = params.email?.trim().toLowerCase();

    if (!cleanEmail || !params.firstName || !params.lastName) {
      return NextResponse.json(
        { success: false, error: "First Name, Last Name, and Email are required." },
        { status: 400 }
      );
    }

    // 1. Authenticate user & get caller's school_id
    const supabase = await createServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized operation." }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: callerProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", authData.user.id)
      .single();

    if (!callerProfile || callerProfile.role !== "administrator") {
      return NextResponse.json(
        { success: false, error: "SECURITY VIOLATION: Only administrators can provision administrator accounts." },
        { status: 403 }
      );
    }

    const schoolId = callerProfile.school_id;
    const tempPassword = generateTempPassword();
    const supabaseAdmin = createAdminClient();

    // 2. Create or retrieve Supabase Auth User
    let newUserId: string | null = null;
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: "administrator",
        school_id: schoolId,
        first_name: params.firstName,
        last_name: params.lastName,
        must_change_password: true,
      },
    });

    if (authErr) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const foundUser = listData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

      if (foundUser) {
        newUserId = foundUser.id;
        await supabaseAdmin.auth.admin.updateUserById(newUserId, {
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: "administrator",
            school_id: schoolId,
            first_name: params.firstName,
            last_name: params.lastName,
            must_change_password: true,
          },
        });
      } else {
        return NextResponse.json(
          { success: false, error: `Auth Account Creation Failed: ${authErr.message}` },
          { status: 400 }
        );
      }
    } else if (authUser?.user) {
      newUserId = authUser.user.id;
    }

    if (!newUserId) {
      return NextResponse.json({ success: false, error: "Failed to resolve Auth User ID." }, { status: 500 });
    }

    // 3. Create/Upsert Profile record in PostgreSQL profiles table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profileRecord, error: profileErr } = await (supabaseAdmin.from("profiles") as any)
      .upsert({
        id: newUserId,
        school_id: schoolId,
        email: cleanEmail,
        first_name: params.firstName,
        last_name: params.lastName,
        role: "administrator",
        phone: params.phone || null,
        is_active: true,
      })
      .select("*")
      .single();

    if (profileErr) {
      return NextResponse.json(
        { success: false, error: `Profile Creation Failed: ${profileErr.message}` },
        { status: 400 }
      );
    }

    // 4. Audit Log
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin.from("audit_logs") as any).insert({
        school_id: schoolId,
        user_id: authData.user.id,
        user_role: "administrator",
        action: "ADMINISTRATOR_CREATION",
        entity: "profiles",
        entity_id: newUserId,
        details: `Provisioned administrator account for ${cleanEmail}`,
      });
    } catch {
      // Non-blocking audit log
    }

    return NextResponse.json({
      success: true,
      admin: profileRecord,
      tempPassword,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
