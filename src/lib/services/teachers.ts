import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "./audit-logs";
import { requireAuthorization } from "./authorization";
import { generateTemporaryPassword } from "./students";

export interface TeacherAssignmentRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  academicYearId?: string;
  academicYearName?: string;
  termId?: string;
  termName?: string;
}

export interface TeacherRecord {
  id: string;
  profileId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  qualification: string;
  joiningDate: string;
  isActive: boolean;
  avatarUrl?: string;
  assignments: TeacherAssignmentRecord[];
}

export interface CreateTeacherPayload {
  firstName: string;
  lastName: string;
  email: string;
  employeeCode: string;
  phone?: string;
  department: string;
  qualification: string;
  joiningDate?: string;
  avatarUrl?: string;
}

export async function fetchTeachers(filters?: {
  search?: string;
  department?: string;
}): Promise<TeacherRecord[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback if config is placeholder or unconfigured
  if (config.isPlaceholder || !config.isConfigured) {
    const mockTeachers: TeacherRecord[] = [
      {
        id: "tch-201",
        profileId: "prof-tch-1",
        employeeCode: "GES-TCH-2026-001",
        firstName: "Abena",
        lastName: "Appiah",
        email: "a.appiah@ghanaschools.edu.gh",
        phone: "+233 24 345 6789",
        department: "J.H.S",
        qualification: "B.Ed Mathematics (UCC)",
        joiningDate: "2024-08-15",
        isActive: true,
        avatarUrl: "",
        assignments: [
          {
            id: "asgn-1",
            subjectId: "subj-math101",
            subjectName: "Core Mathematics",
            subjectCode: "MATH-101",
            classId: "class-basic8a",
            className: "Basic 8 - Section A",
          },
          {
            id: "asgn-2",
            subjectId: "subj-sci101",
            subjectName: "Integrated Science",
            subjectCode: "SCI-101",
            classId: "class-basic9b",
            className: "Basic 9 - Section B",
          },
        ],
      },
      {
        id: "tch-202",
        profileId: "prof-tch-2",
        employeeCode: "GES-TCH-2026-002",
        firstName: "Kofi",
        lastName: "Acheampong",
        email: "k.acheampong@ghanaschools.edu.gh",
        phone: "+233 20 987 6543",
        department: "Upper Primary",
        qualification: "B.A. English & Linguistics (Legon)",
        joiningDate: "2023-01-10",
        isActive: true,
        avatarUrl: "",
        assignments: [
          {
            id: "asgn-3",
            subjectId: "subj-eng101",
            subjectName: "Core English Language",
            subjectCode: "ENG-101",
            classId: "class-basic7a",
            className: "Basic 7 - Section A",
          },
        ],
      },
      {
        id: "tch-203",
        profileId: "prof-tch-3",
        employeeCode: "GES-TCH-2026-003",
        firstName: "Ama",
        lastName: "Osei",
        email: "a.osei@ghanaschools.edu.gh",
        phone: "+233 55 654 3210",
        department: "Early Grade",
        qualification: "B.Sc. Early Childhood Education (UEW)",
        joiningDate: "2025-06-01",
        isActive: false,
        avatarUrl: "",
        assignments: [],
      },
    ];

    let filtered = mockTeachers;
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.firstName.toLowerCase().includes(q) ||
          t.lastName.toLowerCase().includes(q) ||
          t.employeeCode.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q)
      );
    }
    if (filters?.department && filters.department !== "all") {
      filtered = filtered.filter((t) => t.department === filters.department);
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("teachers") as any).select(`
      id,
      profile_id,
      employee_code,
      department,
      qualification,
      joining_date,
      profiles:profile_id (
        first_name,
        last_name,
        email,
        phone,
        is_active,
        avatar_url
      ),
      teacher_assignments (
        id,
        subject_id,
        class_id,
        academic_year_id,
        term_id,
        subjects:subject_id ( code, name ),
        classes:class_id ( name, grade_level, section ),
        academic_years:academic_year_id ( name ),
        terms:term_id ( name )
      )
    `);

    if (filters?.department && filters.department !== "all") {
      query = query.eq("department", filters.department);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let records: TeacherRecord[] = data.map((item: any) => ({
      id: item.id,
      profileId: item.profile_id,
      employeeCode: item.employee_code,
      firstName: item.profiles?.first_name || "",
      lastName: item.profiles?.last_name || "",
      email: item.profiles?.email || "",
      phone: item.profiles?.phone || "",
      department: item.department || "General",
      qualification: item.qualification || "",
      joiningDate: item.joining_date,
      isActive: item.profiles?.is_active ?? true,
      avatarUrl: item.profiles?.avatar_url || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assignments: (item.teacher_assignments || []).map((asgn: any) => ({
        id: asgn.id,
        subjectId: asgn.subject_id,
        subjectName: asgn.subjects?.name || "Subject",
        subjectCode: asgn.subjects?.code || "SUBJ",
        classId: asgn.class_id,
        className: asgn.classes?.name || "Class Section",
        academicYearId: asgn.academic_year_id,
        academicYearName: asgn.academic_years?.name,
        termId: asgn.term_id,
        termName: asgn.terms?.name,
      })),
    }));

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(
        (t) =>
          t.firstName.toLowerCase().includes(q) ||
          t.lastName.toLowerCase().includes(q) ||
          t.employeeCode.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q)
      );
    }

    return records;
  } catch {
    return [];
  }
}

export async function fetchTeacherById(id: string): Promise<TeacherRecord | null> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    const teachers = await fetchTeachers({ search: "" });
    const found = teachers.find((t: TeacherRecord) => t.id === id);
    return found || null;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("teachers") as any)
      .select(`
        id,
        profile_id,
        employee_code,
        department,
        qualification,
        joining_date,
        profiles:profile_id (
          first_name,
          last_name,
          email,
          phone,
          is_active,
          avatar_url
        ),
        teacher_assignments (
          id,
          subject_id,
          class_id,
          academic_year_id,
          term_id,
          subjects:subject_id ( code, name ),
          classes:class_id ( name, grade_level, section ),
          academic_years:academic_year_id ( name ),
          terms:term_id ( name )
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      profileId: data.profile_id,
      employeeCode: data.employee_code,
      firstName: data.profiles?.first_name || "",
      lastName: data.profiles?.last_name || "",
      email: data.profiles?.email || "",
      phone: data.profiles?.phone || "",
      department: data.department || "General",
      qualification: data.qualification || "",
      joiningDate: data.joining_date,
      isActive: data.profiles?.is_active ?? true,
      avatarUrl: data.profiles?.avatar_url || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assignments: (data.teacher_assignments || []).map((asgn: any) => ({
        id: asgn.id,
        subjectId: asgn.subject_id,
        subjectName: asgn.subjects?.name || "Subject",
        subjectCode: asgn.subjects?.code || "SUBJ",
        classId: asgn.class_id,
        className: asgn.classes?.name || "Class Section",
        academicYearId: asgn.academic_year_id,
        academicYearName: asgn.academic_years?.name,
        termId: asgn.term_id,
        termName: asgn.terms?.name,
      })),
    };
  } catch {
    return null;
  }
}

export async function createTeacher(payload: CreateTeacherPayload): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> {
  const tempPassword = generateTemporaryPassword();
  const config = getSupabaseEnvConfig();

  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true, temporaryPassword: tempPassword };
  }

  const supabase = createBrowserClient();
  try {
    // 1. Check administrator authentication and school scoping
    const authRes = await requireAuthorization(["administrator"]);
    if (!authRes.authorized || !authRes.schoolId) {
      return { success: false, error: authRes.error || "UNAUTHORIZED: Only an administrator can create teacher accounts." };
    }
    const schoolId = authRes.schoolId;

    // 2. Duplicate employee code check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingTeacher } = await (supabase.from("teachers") as any)
      .select("id")
      .eq("school_id", schoolId)
      .eq("employee_code", payload.employeeCode)
      .maybeSingle();

    if (existingTeacher) {
      return { success: false, error: `Employee code '${payload.employeeCode}' is already registered in this school.` };
    }

    // 3. Create profile
    const profileId = crypto.randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileErr } = await (supabase.from("profiles") as any).insert({
      id: profileId,
      school_id: schoolId,
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      role: "teacher",
      phone: payload.phone || null,
      avatar_url: payload.avatarUrl || null,
      is_active: true,
    });

    if (profileErr) {
      return { success: false, error: `Profile creation error: ${profileErr.message}` };
    }

    // 4. Create teacher record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newTeacher, error: teacherErr } = await (supabase.from("teachers") as any)
      .insert({
        profile_id: profileId,
        school_id: schoolId,
        employee_code: payload.employeeCode,
        department: payload.department || "General",
        qualification: payload.qualification || null,
        joining_date: payload.joiningDate || new Date().toISOString().split("T")[0],
      })
      .select("id")
      .single();

    if (teacherErr || !newTeacher) {
      return { success: false, error: `Teacher registration error: ${teacherErr?.message}` };
    }

    // 5. Audit log (NEVER log passwords)
    await recordAuditLog(
      "TEACHER_CREATION",
      "teacher",
      newTeacher.id,
      `Administrator created faculty account for ${payload.firstName} ${payload.lastName} (${payload.employeeCode})`
    );

    return { success: true, temporaryPassword: tempPassword };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Teacher creation failed";
    return { success: false, error: msg };
  }
}

export async function updateTeacher(id: string, payload: Partial<CreateTeacherPayload>): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teacherData } = await (supabase.from("teachers") as any).select("profile_id").eq("id", id).single();
    if (teacherData?.profile_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("profiles") as any).update({
        first_name: payload.firstName,
        last_name: payload.lastName,
        phone: payload.phone,
        avatar_url: payload.avatarUrl,
      }).eq("id", teacherData.profile_id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("teachers") as any).update({
      department: payload.department,
      qualification: payload.qualification,
    }).eq("id", id);

    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "TEACHER_MODIFICATION",
      "teacher",
      id,
      `Updated faculty profile for ${payload.firstName || ""} ${payload.lastName || ""}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return { success: false, error: msg };
  }
}

export async function deactivateTeacher(id: string): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teacherData } = await (supabase.from("teachers") as any).select("profile_id").eq("id", id).single();
    if (teacherData?.profile_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("profiles") as any).update({ is_active: false }).eq("id", teacherData.profile_id);
    }

    // Audit log
    await recordAuditLog(
      "ACCOUNT_DEACTIVATION",
      "teacher",
      id,
      `Deactivated faculty account ID ${id} with historical record preservation.`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Deactivation failed";
    return { success: false, error: msg };
  }
}

export async function resetTeacherPassword(id: string): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> {
  const tempPassword = generateTemporaryPassword();
  const config = getSupabaseEnvConfig();

  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true, temporaryPassword: tempPassword };
  }

  try {
    await recordAuditLog(
      "TEACHER_MODIFICATION",
      "teacher",
      id,
      `Administrator generated temporary password reset for teacher ID ${id}`
    );

    return { success: true, temporaryPassword: tempPassword };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Password reset failed";
    return { success: false, error: msg };
  }
}

export async function assignTeacherToSubjectAndClass(
  teacherId: string,
  assignment: { subjectId: string; classId: string; academicYearId?: string; termId?: string }
): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Authentication required." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can create teacher assignments." };
    }

    const schoolId = adminProfile?.school_id;
    if (!schoolId) {
      return { success: false, error: "Administrator school authorization context missing." };
    }

    let yearId = assignment.academicYearId;
    let termId = assignment.termId;

    if (!yearId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: yearData } = await (supabase.from("academic_years") as any)
        .select("id")
        .eq("school_id", schoolId)
        .limit(1)
        .maybeSingle();
      yearId = yearData?.id;
    }

    if (!termId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: termData } = await (supabase.from("terms") as any)
        .select("id")
        .eq("school_id", schoolId)
        .limit(1)
        .maybeSingle();
      termId = termData?.id;
    }

    if (!yearId || !termId) {
      return { success: false, error: "Academic session or term not found for school." };
    }

    // Prevent duplicate assignment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingAsgn } = await (supabase.from("teacher_assignments") as any)
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("subject_id", assignment.subjectId)
      .eq("class_id", assignment.classId)
      .eq("academic_year_id", yearId)
      .eq("term_id", termId)
      .maybeSingle();

    if (existingAsgn) {
      return { success: false, error: "Teacher is already assigned to this subject and class for the selected term." };
    }

    // Insert under Administrator RLS authorization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newAsgn, error } = await (supabase.from("teacher_assignments") as any)
      .insert({
        school_id: schoolId,
        teacher_id: teacherId,
        subject_id: assignment.subjectId,
        class_id: assignment.classId,
        academic_year_id: yearId,
        term_id: termId,
      })
      .select("id")
      .single();

    if (error || !newAsgn) return { success: false, error: error?.message || "Assignment creation failed." };

    // Audit log with acting administrator context
    await recordAuditLog(
      "TEACHER_MODIFICATION",
      "teacher_assignments",
      newAsgn.id,
      `Administrator (${user.id}) created assignment ${newAsgn.id} for teacher ${teacherId} in school ${schoolId}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Assignment failed";
    return { success: false, error: msg };
  }
}

export async function removeTeacherAssignment(assignmentId: string): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Authentication required." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can remove teacher assignments." };
    }

    // Delete under Administrator RLS authorization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("teacher_assignments") as any)
      .delete()
      .eq("id", assignmentId)
      .eq("school_id", adminProfile.school_id);

    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "TEACHER_MODIFICATION",
      "teacher_assignments",
      assignmentId,
      `Administrator (${user.id}) removed assignment ${assignmentId} in school ${adminProfile.school_id}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Removal failed";
    return { success: false, error: msg };
  }
}
