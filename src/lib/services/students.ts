import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

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

export async function fetchStudents(filters?: {
  search?: string;
  classId?: string;
  status?: string;
}) {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback for Ghana GES Curriculum Structure
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
    // Query database with joins
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
    return data.map((item: any) => ({
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
      status: item.status || "active",
      enrollmentDate: item.enrollment_date,
      avatarUrl: item.profiles?.avatar_url || "",
      className: "Basic 8 - Section A",
    }));
  } catch {
    return [];
  }
}

export async function fetchStudentById(id: string): Promise<StudentRecord | null> {
  const students = await fetchStudents({ search: "" });
  const found = students.find((s: StudentRecord) => s.id === id);
  return found || null;
}

export async function createStudent(payload: CreateStudentPayload): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: profileData, error: profileErr } = await (supabase.from("profiles") as any)
      .insert({
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
        role: "student",
        avatar_url: payload.avatarUrl,
      })
      .select("id")
      .single();

    if (profileErr || !profileData) {
      return { success: false, error: profileErr?.message || "Failed to create user profile" };
    }

    const { error: studentErr } = await (supabase.from("students") as any).insert({
      profile_id: profileData.id,
      student_code: payload.studentCode,
      date_of_birth: payload.dateOfBirth,
      gender: payload.gender,
      guardian_name: payload.guardianName,
      guardian_contact: payload.guardianContact,
      status: "active",
    });

    if (studentErr) {
      return { success: false, error: studentErr.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Student creation failed";
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
    const { data: studentData } = await (supabase.from("students") as any).select("profile_id").eq("id", id).single();
    if (studentData) {
      await (supabase.from("profiles") as any).update({
        first_name: payload.firstName,
        last_name: payload.lastName,
        avatar_url: payload.avatarUrl,
      }).eq("id", studentData.profile_id);
    }

    await (supabase.from("students") as any).update({
      date_of_birth: payload.dateOfBirth,
      gender: payload.gender,
      guardian_name: payload.guardianName,
      guardian_contact: payload.guardianContact,
    }).eq("id", id);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed";
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
    const { error } = await (supabase.from("students") as any)
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Deactivation failed";
    return { success: false, error: msg };
  }
}

export async function uploadStudentPhoto(file: File): Promise<string | null> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return URL.createObjectURL(file);
  }

  const supabase = createBrowserClient();
  try {
    const fileName = `student-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("student-photos").upload(fileName, file);

    if (error || !data) return null;

    const { data: publicUrlData } = supabase.storage.from("student-photos").getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch {
    return null;
  }
}
