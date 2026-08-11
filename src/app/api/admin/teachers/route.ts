import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnvConfig } from "@/lib/supabase/config";
import { generateTemporaryPassword, CreateTeacherPayload } from "@/lib/services/teachers";

export async function POST(request: Request) {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    const tempPassword = generateTemporaryPassword();
    return NextResponse.json({ success: true, temporaryPassword: tempPassword });
  }

  try {
    const payload: CreateTeacherPayload = await request.json();

    if (!payload.email || !payload.firstName || !payload.lastName || !payload.employeeCode) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: firstName, lastName, email, and employeeCode are required." },
        { status: 400 }
      );
    }

    const cleanEmail = payload.email.trim().toLowerCase();

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
        { success: false, error: "SECURITY VIOLATION: Only administrators can create teacher accounts." },
        { status: 403 }
      );
    }

    const schoolId = callerProfile.school_id;
    const supabaseAdmin = createAdminClient();

    // 2. Duplicate employee code check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingTeacher } = await (supabaseAdmin.from("teachers") as any)
      .select("id")
      .eq("school_id", schoolId)
      .eq("employee_code", payload.employeeCode)
      .maybeSingle();

    if (existingTeacher) {
      return NextResponse.json(
        { success: false, error: `Employee code '${payload.employeeCode}' is already registered in this school.` },
        { status: 400 }
      );
    }

    const tempPassword = generateTemporaryPassword();

    // 3. Create or retrieve Supabase Auth User
    let authUserId: string | null = null;
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: "teacher",
        school_id: schoolId,
        first_name: payload.firstName,
        last_name: payload.lastName,
      },
    });

    if (authErr) {
      // Check if user already exists in auth
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const foundUser = listData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

      if (foundUser) {
        authUserId = foundUser.id;
        // Update user password / metadata
        await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: "teacher",
            school_id: schoolId,
            first_name: payload.firstName,
            last_name: payload.lastName,
          },
        });
      } else {
        return NextResponse.json(
          { success: false, error: `Auth account creation failed: ${authErr.message}` },
          { status: 400 }
        );
      }
    } else if (authUser?.user) {
      authUserId = authUser.user.id;
    }

    if (!authUserId) {
      return NextResponse.json({ success: false, error: "Failed to resolve Auth User ID." }, { status: 500 });
    }

    // 4. Create or update Profile record in PostgreSQL profiles table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileErr } = await (supabaseAdmin.from("profiles") as any).upsert({
      id: authUserId,
      school_id: schoolId,
      email: cleanEmail,
      first_name: payload.firstName,
      last_name: payload.lastName,
      role: "teacher",
      phone: payload.phone || null,
      avatar_url: payload.avatarUrl || null,
      is_active: true,
    });

    if (profileErr) {
      return NextResponse.json(
        { success: false, error: `Profile creation error: ${profileErr.message}` },
        { status: 400 }
      );
    }

    // 5. Insert Teacher record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newTeacher, error: teacherErr } = await (supabaseAdmin.from("teachers") as any)
      .insert({
        profile_id: authUserId,
        school_id: schoolId,
        employee_code: payload.employeeCode,
        department: payload.department || "General",
        qualification: payload.qualification || null,
        joining_date: payload.joiningDate || new Date().toISOString().split("T")[0],
      })
      .select("id")
      .single();

    if (teacherErr || !newTeacher) {
      return NextResponse.json(
        { success: false, error: `Teacher creation error: ${teacherErr?.message}` },
        { status: 400 }
      );
    }

    // 6. Audit Log
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin.from("audit_logs") as any).insert({
        school_id: schoolId,
        user_id: authData.user.id,
        user_role: callerProfile.role,
        action: "TEACHER_CREATION",
        entity: "teacher",
        entity_id: newTeacher.id,
        details: `Created faculty account for ${payload.firstName} ${payload.lastName} (${payload.employeeCode})`,
      });
    } catch {
      // Non-blocking audit log
    }

    return NextResponse.json({
      success: true,
      temporaryPassword: tempPassword,
      teacherId: newTeacher.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
