import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnvConfig } from "@/lib/supabase/config";
import { generateTemporaryPassword, CreateStudentPayload } from "@/lib/services/students";

export async function POST(request: Request) {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    const tempPassword = generateTemporaryPassword();
    return NextResponse.json({ success: true, temporaryPassword: tempPassword });
  }

  try {
    const payload: CreateStudentPayload = await request.json();

    if (!payload.email || !payload.firstName || !payload.lastName || !payload.studentCode) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: firstName, lastName, email, and studentCode are required." },
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

    if (!callerProfile || (callerProfile.role !== "administrator" && callerProfile.role !== "principal")) {
      return NextResponse.json(
        { success: false, error: "SECURITY VIOLATION: Only administrators and principals can create student accounts." },
        { status: 403 }
      );
    }

    const schoolId = callerProfile.school_id;
    const supabaseAdmin = createAdminClient();

    // 2. Duplicate student code check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingStudent } = await (supabaseAdmin.from("students") as any)
      .select("id")
      .eq("school_id", schoolId)
      .eq("student_code", payload.studentCode)
      .maybeSingle();

    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: `Student code '${payload.studentCode}' is already registered in this school.` },
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
        role: "student",
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
        // Optionally update metadata / password
        await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: "student",
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
      role: "student",
      avatar_url: payload.avatarUrl || null,
      is_active: true,
    });

    if (profileErr) {
      return NextResponse.json(
        { success: false, error: `Profile creation error: ${profileErr.message}` },
        { status: 400 }
      );
    }

    // 5. Insert Student record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newStudent, error: studentErr } = await (supabaseAdmin.from("students") as any)
      .insert({
        profile_id: authUserId,
        school_id: schoolId,
        student_code: payload.studentCode,
        date_of_birth: payload.dateOfBirth || null,
        gender: payload.gender || "Male",
        guardian_name: payload.guardianName || null,
        guardian_contact: payload.guardianContact || null,
        status: "active",
      })
      .select("id")
      .single();

    if (studentErr || !newStudent) {
      return NextResponse.json(
        { success: false, error: `Student creation error: ${studentErr?.message}` },
        { status: 400 }
      );
    }

    // 6. Optional Class Enrollment
    if (payload.classId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from("class_enrollments") as any).insert({
          school_id: schoolId,
          class_id: payload.classId,
          student_id: newStudent.id,
          academic_year_id: payload.academicYearId || null,
          status: "active",
        });
      } catch (enrollErr) {
        console.warn("Auto class enrollment failed:", enrollErr);
      }
    }

    // 7. Audit Log
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin.from("audit_logs") as any).insert({
        school_id: schoolId,
        user_id: authData.user.id,
        user_role: callerProfile.role,
        action: "STUDENT_CREATION",
        entity: "student",
        entity_id: newStudent.id,
        details: `Created student account for ${payload.firstName} ${payload.lastName} (${payload.studentCode})`,
      });
    } catch {
      // Non-blocking audit log
    }

    return NextResponse.json({
      success: true,
      temporaryPassword: tempPassword,
      studentId: newStudent.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
