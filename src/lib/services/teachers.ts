import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface TeacherAssignmentRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
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

export async function fetchTeachers(filters?: { search?: string; department?: string }) {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback for Ghana GES Curriculum Structure
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
    const { data, error } = await (supabase.from("teachers") as any).select(`
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
      )
    `);

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => ({
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
      assignments: [],
    }));
  } catch {
    return [];
  }
}

export async function fetchTeacherById(id: string): Promise<TeacherRecord | null> {
  const teachers = await fetchTeachers({ search: "" });
  const found = teachers.find((t: TeacherRecord) => t.id === id);
  return found || null;
}

export async function createTeacher(payload: CreateTeacherPayload): Promise<{ success: boolean; error?: string }> {
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
        role: "teacher",
        phone: payload.phone,
        avatar_url: payload.avatarUrl,
      })
      .select("id")
      .single();

    if (profileErr || !profileData) {
      return { success: false, error: profileErr?.message || "Failed to create teacher profile" };
    }

    const { error: teacherErr } = await (supabase.from("teachers") as any).insert({
      profile_id: profileData.id,
      employee_code: payload.employeeCode,
      department: payload.department,
      qualification: payload.qualification,
      joining_date: payload.joiningDate || new Date().toISOString().split("T")[0],
    });

    if (teacherErr) return { success: false, error: teacherErr.message };
    return { success: true };
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
    const { data: teacherData } = await (supabase.from("teachers") as any).select("profile_id").eq("id", id).single();
    if (teacherData) {
      await (supabase.from("profiles") as any).update({
        first_name: payload.firstName,
        last_name: payload.lastName,
        phone: payload.phone,
        avatar_url: payload.avatarUrl,
      }).eq("id", teacherData.profile_id);
    }

    await (supabase.from("teachers") as any).update({
      department: payload.department,
      qualification: payload.qualification,
    }).eq("id", id);

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
    const { data: teacherData } = await (supabase.from("teachers") as any).select("profile_id").eq("id", id).single();
    if (teacherData) {
      await (supabase.from("profiles") as any).update({ is_active: false }).eq("id", teacherData.profile_id);
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Deactivation failed";
    return { success: false, error: msg };
  }
}

export async function assignTeacherToSubjectAndClass(
  teacherId: string,
  assignment: { subjectId: string; subjectName: string; subjectCode: string; classId: string; className: string }
): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: schoolData } = await (supabase.from("schools") as any).select("id").limit(1).single();
    const { data: termData } = await (supabase.from("terms") as any).select("id").limit(1).single();

    if (!schoolData || !termData) {
      return { success: false, error: "School or term context missing for relational assignment." };
    }

    const { error } = await (supabase.from("teacher_assignments") as any).insert({
      school_id: schoolData.id,
      teacher_id: teacherId,
      subject_id: assignment.subjectId,
      class_id: assignment.classId,
      term_id: termData.id,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Assignment failed";
    return { success: false, error: msg };
  }
}
