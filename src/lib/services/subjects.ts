import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "./audit-logs";

export interface SubjectRecord {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  teacherCount: number;
  createdAt?: string;
}

export interface SubjectDetailRecord extends SubjectRecord {
  assignedTeachers: {
    id: string;
    teacherId: string;
    teacherName: string;
    employeeCode: string;
    department: string;
  }[];
  assignedClasses: {
    id: string;
    classId: string;
    className: string;
    gradeLevel: string;
  }[];
}

export interface CreateSubjectPayload {
  code: string;
  name: string;
  description?: string;
  status?: "active" | "inactive";
}

export async function fetchSubjects(filters?: {
  search?: string;
  status?: string;
  activeOnly?: boolean;
}): Promise<SubjectRecord[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback if config is placeholder or unconfigured
  if (config.isPlaceholder || !config.isConfigured) {
    const mockSubjects: SubjectRecord[] = [
      {
        id: "subj-math101",
        schoolId: "sch-01",
        code: "MATH-101",
        name: "Core Mathematics",
        description: "General Mathematics curriculum for JHS/SHS",
        status: "active",
        teacherCount: 3,
      },
      {
        id: "subj-sci101",
        schoolId: "sch-01",
        code: "SCI-101",
        name: "Integrated Science",
        description: "Physics, Chemistry, Biology and Environmental Science",
        status: "active",
        teacherCount: 2,
      },
      {
        id: "subj-eng101",
        schoolId: "sch-01",
        code: "ENG-101",
        name: "Core English Language",
        description: "Grammar, Comprehension, and Essay Writing",
        status: "active",
        teacherCount: 4,
      },
      {
        id: "subj-soc101",
        schoolId: "sch-01",
        code: "SOC-101",
        name: "Social Studies",
        description: "Governance, Geography, History and Social Life",
        status: "active",
        teacherCount: 2,
      },
      {
        id: "subj-ict101",
        schoolId: "sch-01",
        code: "ICT-101",
        name: "Information & Comms Tech (ICT)",
        description: "Computer Literacy, Software Tools and Computing",
        status: "active",
        teacherCount: 1,
      },
      {
        id: "subj-rme101",
        schoolId: "sch-01",
        code: "RME-101",
        name: "Religious & Moral Education (R.M.E)",
        description: "Moral Principles, Ethics and Comparative Religion",
        status: "active",
        teacherCount: 1,
      },
    ];

    let filtered = mockSubjects;
    if (filters?.activeOnly) {
      filtered = filtered.filter((s) => s.status === "active");
    }
    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((s) => s.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q))
      );
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("subjects") as any).select(`
      id,
      school_id,
      code,
      name,
      description,
      is_active,
      created_at,
      teacher_assignments ( id )
    `);

    if (filters?.activeOnly) {
      query = query.or("is_active.eq.true,is_active.is.null");
    }

    const { data, error } = await query;
    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let records: SubjectRecord[] = data.map((item: any) => ({
      id: item.id,
      schoolId: item.school_id,
      code: item.code,
      name: item.name,
      description: item.description || "",
      status: item.is_active === false ? "inactive" : "active",
      teacherCount: item.teacher_assignments ? item.teacher_assignments.length : 0,
      createdAt: item.created_at,
    }));

    if (filters?.status && filters.status !== "all") {
      records = records.filter((s) => s.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(
        (s) =>
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q))
      );
    }

    return records;
  } catch {
    return [];
  }
}

export async function fetchSubjectById(id: string): Promise<SubjectDetailRecord | null> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    const subjects = await fetchSubjects();
    const found = subjects.find((s) => s.id === id);
    if (!found) return null;
    return {
      ...found,
      assignedTeachers: [
        {
          id: "asgn-1",
          teacherId: "tch-201",
          teacherName: "Abena Appiah",
          employeeCode: "GES-TCH-2026-001",
          department: "J.H.S",
        },
      ],
      assignedClasses: [
        {
          id: "asgn-1",
          classId: "class-basic8a",
          className: "Basic 8 - Section A",
          gradeLevel: "Basic 8",
        },
      ],
    };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subjectData, error } = await (supabase.from("subjects") as any)
      .select(`
        id,
        school_id,
        code,
        name,
        description,
        is_active,
        created_at
      `)
      .eq("id", id)
      .single();

    if (error || !subjectData) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assignments } = await (supabase.from("teacher_assignments") as any)
      .select(`
        id,
        teacher_id,
        class_id,
        teachers:teacher_id (
          id,
          employee_code,
          department,
          profiles:profile_id ( first_name, last_name )
        ),
        classes:class_id ( id, name, grade_level )
      `)
      .eq("subject_id", id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignedTeachersMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignedClassesMap = new Map<string, any>();

    (assignments || []).forEach((a: any) => {
      if (a.teachers) {
        const tProfile = a.teachers.profiles;
        const name = tProfile ? `${tProfile.first_name || ""} ${tProfile.last_name || ""}`.trim() : "Teacher";
        assignedTeachersMap.set(a.teachers.id, {
          id: a.id,
          teacherId: a.teachers.id,
          teacherName: name,
          employeeCode: a.teachers.employee_code || "",
          department: a.teachers.department || "General",
        });
      }
      if (a.classes) {
        assignedClassesMap.set(a.classes.id, {
          id: a.id,
          classId: a.classes.id,
          className: a.classes.name || "",
          gradeLevel: a.classes.grade_level || "",
        });
      }
    });

    return {
      id: subjectData.id,
      schoolId: subjectData.school_id,
      code: subjectData.code,
      name: subjectData.name,
      description: subjectData.description || "",
      status: subjectData.is_active === false ? "inactive" : "active",
      teacherCount: assignedTeachersMap.size,
      createdAt: subjectData.created_at,
      assignedTeachers: Array.from(assignedTeachersMap.values()),
      assignedClasses: Array.from(assignedClassesMap.values()),
    };
  } catch {
    return null;
  }
}

export async function createSubject(payload: CreateSubjectPayload): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required to create subjects." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can create subjects." };
    }

    const schoolId = adminProfile?.school_id;
    if (!schoolId) return { success: false, error: "Administrator school context missing." };

    // Duplicate check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingSubj } = await (supabase.from("subjects") as any)
      .select("id")
      .eq("school_id", schoolId)
      .eq("code", payload.code.trim().toUpperCase())
      .maybeSingle();

    if (existingSubj) {
      return { success: false, error: `Subject code '${payload.code}' already exists in your school curriculum.` };
    }

    // Insert record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newSubj, error: insertErr } = await (supabase.from("subjects") as any)
      .insert({
        school_id: schoolId,
        code: payload.code.trim().toUpperCase(),
        name: payload.name.trim(),
        description: payload.description || null,
        is_active: payload.status !== "inactive",
      })
      .select("id")
      .single();

    if (insertErr || !newSubj) {
      return { success: false, error: insertErr?.message || "Failed to create subject record." };
    }

    // Audit log
    await recordAuditLog(
      "SUBJECT_CREATION",
      "subjects",
      newSubj.id,
      `Administrator (${user.id}) created curriculum subject '${payload.code} - ${payload.name}' in school ${schoolId}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Subject creation failed.";
    return { success: false, error: msg };
  }
}

export async function updateSubject(id: string, payload: Partial<CreateSubjectPayload>): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can update subjects." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("subjects") as any)
      .update({
        code: payload.code ? payload.code.trim().toUpperCase() : undefined,
        name: payload.name ? payload.name.trim() : undefined,
        description: payload.description,
        is_active: payload.status !== undefined ? payload.status === "active" : undefined,
      })
      .eq("id", id)
      .eq("school_id", adminProfile.school_id);

    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "SUBJECT_MODIFICATION",
      "subjects",
      id,
      `Administrator (${user.id}) updated subject ID ${id} in school ${adminProfile.school_id}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed.";
    return { success: false, error: msg };
  }
}

export async function deactivateSubject(id: string): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can deactivate subjects." };
    }

    // Soft-deactivate by setting is_active = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("subjects") as any)
      .update({ is_active: false })
      .eq("id", id)
      .eq("school_id", adminProfile.school_id);

    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "SUBJECT_MODIFICATION",
      "subjects",
      id,
      `Administrator (${user.id}) soft-deactivated subject ID ${id} in school ${adminProfile.school_id} with historical record preservation.`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Deactivation failed.";
    return { success: false, error: msg };
  }
}

export async function reactivateSubject(id: string): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can reactivate subjects." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("subjects") as any)
      .update({ is_active: true })
      .eq("id", id)
      .eq("school_id", adminProfile.school_id);

    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "SUBJECT_MODIFICATION",
      "subjects",
      id,
      `Administrator (${user.id}) reactivated subject ID ${id} in school ${adminProfile.school_id}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Reactivation failed.";
    return { success: false, error: msg };
  }
}

export async function deleteSubject(id: string): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can delete subjects." };
    }

    // Check if subject is assigned in teacher_assignments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assignments } = await (supabase.from("teacher_assignments") as any)
      .select("id")
      .eq("subject_id", id)
      .limit(1);

    if (assignments && assignments.length > 0) {
      return {
        success: false,
        error: "Cannot delete subject because it is currently assigned to one or more faculty members. Soft-deactivate it instead to preserve historical records.",
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("subjects") as any)
      .delete()
      .eq("id", id)
      .eq("school_id", adminProfile.school_id);

    if (error) return { success: false, error: error.message };

    await recordAuditLog(
      "SUBJECT_DELETION",
      "subjects",
      id,
      `Administrator (${user.id}) deleted subject ID ${id} in school ${adminProfile.school_id}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Deletion failed.";
    return { success: false, error: msg };
  }
}
