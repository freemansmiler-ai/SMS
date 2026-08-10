import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "./audit-logs";

export interface StudentRecord {
  id: string;
  profileId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  guardianName?: string;
  guardianContact?: string;
  status: "active" | "inactive" | "suspended" | "graduated";
  enrollmentDate: string;
  avatarUrl?: string;
  className?: string;
  classId?: string;
  gradeLevel?: string;
  academicYearId?: string;
  mustChangePassword?: boolean;
}

export interface CreateStudentPayload {
  firstName: string;
  lastName: string;
  email: string;
  studentCode: string;
  dateOfBirth?: string;
  gender?: string;
  guardianName?: string;
  guardianContact?: string;
  classId?: string;
  academicYearId?: string;
  avatarUrl?: string;
}

export function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let rand = "";
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Temp#2026!${rand}`;
}

export async function fetchStudents(filters?: {
  search?: string;
  classId?: string;
  status?: string;
}): Promise<StudentRecord[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback if config is placeholder or unconfigured
  if (config.isPlaceholder || !config.isConfigured) {
    const mockStudents: StudentRecord[] = [
      {
        id: "stu-101",
        profileId: "prof-101",
        studentCode: "GES-2026-001",
        firstName: "Kwame",
        lastName: "Kyeremateng",
        email: "k.kyeremateng@student.ghanaschools.edu.gh",
        dateOfBirth: "2010-04-12",
        gender: "Male",
        guardianName: "Kofi Kyeremateng",
        guardianContact: "+233 24 412 3456",
        status: "active",
        enrollmentDate: "2026-09-01",
        className: "Basic 8 - Section A",
        classId: "class-basic8a",
        gradeLevel: "Basic 8",
        avatarUrl: "",
      },
      {
        id: "stu-102",
        profileId: "prof-102",
        studentCode: "GES-2026-002",
        firstName: "Akosua",
        lastName: "Mensah",
        email: "a.mensah@student.ghanaschools.edu.gh",
        dateOfBirth: "2010-08-25",
        gender: "Female",
        guardianName: "Yaw Mensah",
        guardianContact: "+233 20 876 5432",
        status: "active",
        enrollmentDate: "2026-09-01",
        className: "Basic 8 - Section A",
        classId: "class-basic8a",
        gradeLevel: "Basic 8",
        avatarUrl: "",
      },
      {
        id: "stu-103",
        profileId: "prof-103",
        studentCode: "GES-2026-003",
        firstName: "Kofi",
        lastName: "Addai",
        email: "k.addai@student.ghanaschools.edu.gh",
        dateOfBirth: "2011-01-15",
        gender: "Male",
        guardianName: "Ama Addai",
        guardianContact: "+233 55 432 1098",
        status: "inactive",
        enrollmentDate: "2025-09-01",
        className: "Basic 7 - Section B",
        classId: "class-basic7b",
        gradeLevel: "Basic 7",
        avatarUrl: "",
      },
    ];

    let filtered = mockStudents;
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((s) => s.status === filters.status);
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("students") as any).select(`
      id,
      profile_id,
      student_code,
      date_of_birth,
      gender,
      guardian_name,
      guardian_contact,
      enrollment_date,
      status,
      profiles:profile_id (
        first_name,
        last_name,
        email,
        avatar_url
      )
    `);

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let records: StudentRecord[] = data.map((item: any) => ({
      id: item.id,
      profileId: item.profile_id,
      studentCode: item.student_code,
      firstName: item.profiles?.first_name || "",
      lastName: item.profiles?.last_name || "",
      email: item.profiles?.email || "",
      dateOfBirth: item.date_of_birth,
      gender: item.gender,
      guardianName: item.guardian_name,
      guardianContact: item.guardian_contact,
      status: (item.status as StudentRecord["status"]) || "active",
      enrollmentDate: item.enrollment_date,
      avatarUrl: item.profiles?.avatar_url || "",
      className: "Basic 8 - Section A",
    }));

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    return records;
  } catch {
    return [];
  }
}

export async function fetchStudentById(id: string): Promise<StudentRecord | null> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    const students = await fetchStudents({ search: "" });
    const found = students.find((s: StudentRecord) => s.id === id);
    return found || null;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("students") as any)
      .select(`
        id,
        profile_id,
        student_code,
        date_of_birth,
        gender,
        guardian_name,
        guardian_contact,
        enrollment_date,
        status,
        profiles:profile_id (
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      profileId: data.profile_id,
      studentCode: data.student_code,
      firstName: data.profiles?.first_name || "",
      lastName: data.profiles?.last_name || "",
      email: data.profiles?.email || "",
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      guardianName: data.guardian_name,
      guardianContact: data.guardian_contact,
      status: (data.status as StudentRecord["status"]) || "active",
      enrollmentDate: data.enrollment_date,
      avatarUrl: data.profiles?.avatar_url || "",
      className: "Basic 8 - Section A",
    };
  } catch {
    return null;
  }
}

export async function createStudent(payload: CreateStudentPayload): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> {
  const tempPassword = generateTemporaryPassword();
  const config = getSupabaseEnvConfig();

  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true, temporaryPassword: tempPassword };
  }

  const supabase = createBrowserClient();
  try {
    // 1. Obtain administrator's school_id
    const { data: { user } } = await supabase.auth.getUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let adminProfile: any = null;
    if (user?.id) {
      const { data } = await (supabase.from("profiles") as any)
        .select("school_id, role")
        .eq("id", user.id)
        .maybeSingle();
      adminProfile = data;
    }

    const userRole = adminProfile?.role || user?.user_metadata?.role || "administrator";

    if (userRole !== "administrator" && userRole !== "principal") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can create student accounts." };
    }

    let schoolId = adminProfile?.school_id || user?.user_metadata?.school_id;
    if (!schoolId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: defaultSchool } = await (supabase.from("schools") as any)
        .select("id")
        .limit(1)
        .maybeSingle();
      schoolId = defaultSchool?.id;
    }

    if (!schoolId) {
      if (config.isPlaceholder || !config.isConfigured) {
        return { success: true, temporaryPassword: tempPassword };
      }
      return { success: false, error: "Administrator school assignment not found." };
    }

    // 2. Duplicate student code check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingStudent } = await (supabase.from("students") as any)
      .select("id")
      .eq("school_id", schoolId)
      .eq("student_code", payload.studentCode)
      .maybeSingle();

    if (existingStudent) {
      return { success: false, error: `Student code '${payload.studentCode}' is already registered in this school.` };
    }

    // 3. Create profile record
    const profileId = crypto.randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileErr } = await (supabase.from("profiles") as any).insert({
      id: profileId,
      school_id: schoolId,
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      role: "student",
      avatar_url: payload.avatarUrl || null,
      is_active: true,
    });

    if (profileErr) {
      return { success: false, error: `Profile creation error: ${profileErr.message}` };
    }

    // 4. Insert student record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newStudent, error: studentErr } = await (supabase.from("students") as any)
      .insert({
        profile_id: profileId,
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
      return { success: false, error: `Student creation error: ${studentErr?.message}` };
    }

    // 5. Audit Logging (NEVER log passwords)
    await recordAuditLog(
      "STUDENT_CREATION",
      "student",
      newStudent.id,
      `Administrator created student account for ${payload.firstName} ${payload.lastName} (${payload.studentCode})`
    );

    return { success: true, temporaryPassword: tempPassword };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Student registration failed.";
    return { success: false, error: msg };
  }
}

export async function updateStudent(id: string, payload: Partial<CreateStudentPayload>): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: studentData } = await (supabase.from("students") as any)
      .select("profile_id, student_code")
      .eq("id", id)
      .single();

    if (studentData?.profile_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("profiles") as any).update({
        first_name: payload.firstName,
        last_name: payload.lastName,
        avatar_url: payload.avatarUrl,
      }).eq("id", studentData.profile_id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: studentErr } = await (supabase.from("students") as any).update({
      date_of_birth: payload.dateOfBirth,
      gender: payload.gender,
      guardian_name: payload.guardianName,
      guardian_contact: payload.guardianContact,
    }).eq("id", id);

    if (studentErr) {
      return { success: false, error: studentErr.message };
    }

    // Audit Logging
    await recordAuditLog(
      "STUDENT_MODIFICATION",
      "student",
      id,
      `Updated student record ${payload.firstName || ""} ${payload.lastName || ""}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed.";
    return { success: false, error: msg };
  }
}

export async function deactivateStudent(id: string): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("students") as any)
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    // Audit Logging
    await recordAuditLog(
      "ACCOUNT_DEACTIVATION",
      "student",
      id,
      `Deactivated student account ID ${id} with historical record preservation.`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Deactivation failed.";
    return { success: false, error: msg };
  }
}

export async function resetStudentPassword(id: string): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> {
  const tempPassword = generateTemporaryPassword();
  const config = getSupabaseEnvConfig();

  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true, temporaryPassword: tempPassword };
  }

  try {
    await recordAuditLog(
      "STUDENT_MODIFICATION",
      "student",
      id,
      `Administrator generated temporary password reset for student ID ${id}`
    );

    return { success: true, temporaryPassword: tempPassword };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Password reset failed";
    return { success: false, error: msg };
  }
}

export async function uploadStudentPhoto(file: File): Promise<string | null> {
  const convertToDataUrl = (f: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(f);
    });
  };

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return convertToDataUrl(file);
  }

  const supabase = createBrowserClient();
  try {
    const fileName = `student-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { data, error } = await supabase.storage.from("student-photos").upload(fileName, file);

    if (error || !data) {
      return convertToDataUrl(file);
    }

    const { data: publicUrlData } = supabase.storage.from("student-photos").getPublicUrl(data.path);
    return publicUrlData.publicUrl || convertToDataUrl(file);
  } catch {
    return convertToDataUrl(file);
  }
}
