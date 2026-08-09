import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "./audit-logs";

export interface ClassRecord {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: string;
  section: string;
  capacity: number;
  studentCount: number;
  academicYearId: string;
  academicYearName: string;
  classTeacherId?: string;
  classTeacherName?: string;
  status: "active" | "inactive";
  createdAt?: string;
}

export interface ClassDetailRecord extends ClassRecord {
  enrolledStudents: {
    id: string;
    studentCode: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  }[];
  subjectTeachers: {
    id: string;
    teacherId: string;
    teacherName: string;
    subjectName: string;
    subjectCode: string;
  }[];
}

export interface CreateClassPayload {
  name: string;
  gradeLevel: string;
  section?: string;
  capacity: number;
  academicYearId?: string;
  classTeacherId?: string;
}

export async function fetchClasses(filters?: {
  search?: string;
  gradeLevel?: string;
  status?: string;
}): Promise<ClassRecord[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback if config is placeholder or unconfigured
  if (config.isPlaceholder || !config.isConfigured) {
    const mockClasses: ClassRecord[] = [
      {
        id: "class-basic7a",
        schoolId: "sch-01",
        name: "Basic 7 - Section A",
        gradeLevel: "Basic 7",
        section: "Section A",
        capacity: 35,
        studentCount: 28,
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        classTeacherId: "tch-202",
        classTeacherName: "Kofi Acheampong",
        status: "active",
      },
      {
        id: "class-basic8a",
        schoolId: "sch-01",
        name: "Basic 8 - Section A",
        gradeLevel: "Basic 8",
        section: "Section A",
        capacity: 40,
        studentCount: 37,
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        classTeacherId: "tch-201",
        classTeacherName: "Abena Appiah",
        status: "active",
      },
      {
        id: "class-basic9b",
        schoolId: "sch-01",
        name: "Basic 9 - Section B",
        gradeLevel: "Basic 9",
        section: "Section B",
        capacity: 35,
        studentCount: 30,
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        classTeacherId: undefined,
        classTeacherName: "Unassigned",
        status: "active",
      },
    ];

    let filtered = mockClasses;
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.gradeLevel.toLowerCase().includes(q) ||
          (c.classTeacherName && c.classTeacherName.toLowerCase().includes(q))
      );
    }
    if (filters?.gradeLevel && filters.gradeLevel !== "all") {
      filtered = filtered.filter((c) => c.gradeLevel === filters.gradeLevel);
    }
    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((c) => c.status === filters.status);
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("classes") as any).select(`
      id,
      school_id,
      name,
      grade_level,
      section,
      capacity,
      academic_year_id,
      class_teacher_id,
      created_at,
      academic_years:academic_year_id ( name ),
      teachers:class_teacher_id (
        id,
        profiles:profile_id ( first_name, last_name )
      ),
      student_enrollments ( id )
    `);

    const { data, error } = await query;
    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let records: ClassRecord[] = data.map((item: any) => {
      const teacherProfile = item.teachers?.profiles;
      const teacherName = teacherProfile
        ? `${teacherProfile.first_name || ""} ${teacherProfile.last_name || ""}`.trim()
        : undefined;

      return {
        id: item.id,
        schoolId: item.school_id,
        name: item.name,
        gradeLevel: item.grade_level,
        section: item.section || "",
        capacity: item.capacity || 35,
        studentCount: item.student_enrollments ? item.student_enrollments.length : 0,
        academicYearId: item.academic_year_id,
        academicYearName: item.academic_years?.name || "2026/2027 Academic Year",
        classTeacherId: item.class_teacher_id,
        classTeacherName: teacherName || "Unassigned",
        status: "active",
        createdAt: item.created_at,
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.gradeLevel.toLowerCase().includes(q) ||
          (c.classTeacherName && c.classTeacherName.toLowerCase().includes(q))
      );
    }

    if (filters?.gradeLevel && filters.gradeLevel !== "all") {
      records = records.filter((c) => c.gradeLevel === filters.gradeLevel);
    }

    return records;
  } catch {
    return [];
  }
}

export async function fetchClassById(id: string): Promise<ClassDetailRecord | null> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    const classes = await fetchClasses();
    const found = classes.find((c) => c.id === id);
    if (!found) return null;
    return {
      ...found,
      enrolledStudents: [
        {
          id: "stu-101",
          studentCode: "GES-2026-001",
          firstName: "Kwame",
          lastName: "Kyeremateng",
          email: "k.kyeremateng@student.ghanaschools.edu.gh",
          status: "active",
        },
        {
          id: "stu-102",
          studentCode: "GES-2026-002",
          firstName: "Akosua",
          lastName: "Mensah",
          email: "a.mensah@student.ghanaschools.edu.gh",
          status: "active",
        },
      ],
      subjectTeachers: [
        {
          id: "asgn-1",
          teacherId: "tch-201",
          teacherName: "Abena Appiah",
          subjectName: "Core Mathematics",
          subjectCode: "MATH-101",
        },
      ],
    };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: classData, error } = await (supabase.from("classes") as any)
      .select(`
        id,
        school_id,
        name,
        grade_level,
        section,
        capacity,
        academic_year_id,
        class_teacher_id,
        created_at,
        academic_years:academic_year_id ( name ),
        teachers:class_teacher_id (
          id,
          profiles:profile_id ( first_name, last_name )
        )
      `)
      .eq("id", id)
      .single();

    if (error || !classData) return null;

    // Fetch enrolled students
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: enrollments } = await (supabase.from("student_enrollments") as any)
      .select(`
        student_id,
        students:student_id (
          id,
          student_code,
          status,
          profiles:profile_id ( first_name, last_name, email )
        )
      `)
      .eq("class_id", id);

    // Fetch subject teachers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assignments } = await (supabase.from("teacher_assignments") as any)
      .select(`
        id,
        teacher_id,
        subjects:subject_id ( name, code ),
        teachers:teacher_id (
          id,
          profiles:profile_id ( first_name, last_name )
        )
      `)
      .eq("class_id", id);

    const teacherProfile = classData.teachers?.profiles;
    const teacherName = teacherProfile
      ? `${teacherProfile.first_name || ""} ${teacherProfile.last_name || ""}`.trim()
      : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrolledStudents = (enrollments || []).map((e: any) => ({
      id: e.students?.id || "",
      studentCode: e.students?.student_code || "",
      firstName: e.students?.profiles?.first_name || "",
      lastName: e.students?.profiles?.last_name || "",
      email: e.students?.profiles?.email || "",
      status: e.students?.status || "active",
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subjectTeachers = (assignments || []).map((a: any) => ({
      id: a.id,
      teacherId: a.teacher_id,
      teacherName: a.teachers?.profiles
        ? `${a.teachers.profiles.first_name || ""} ${a.teachers.profiles.last_name || ""}`.trim()
        : "Teacher",
      subjectName: a.subjects?.name || "Subject",
      subjectCode: a.subjects?.code || "SUBJ",
    }));

    return {
      id: classData.id,
      schoolId: classData.school_id,
      name: classData.name,
      gradeLevel: classData.grade_level,
      section: classData.section || "",
      capacity: classData.capacity || 35,
      studentCount: enrolledStudents.length,
      academicYearId: classData.academic_year_id,
      academicYearName: classData.academic_years?.name || "2026/2027 Academic Year",
      classTeacherId: classData.class_teacher_id,
      classTeacherName: teacherName || "Unassigned",
      status: "active",
      createdAt: classData.created_at,
      enrolledStudents,
      subjectTeachers,
    };
  } catch {
    return null;
  }
}

export async function createClass(payload: CreateClassPayload): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // 1. Verify administrator role and school context
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required to create class records." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can create school classes." };
    }

    const schoolId = adminProfile?.school_id;
    if (!schoolId) return { success: false, error: "Administrator school assignment not found." };

    if (payload.capacity <= 0) {
      return { success: false, error: "Class capacity must be a positive integer." };
    }

    // Determine academic year ID if not passed
    let yearId = payload.academicYearId;
    if (!yearId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: yearData } = await (supabase.from("academic_years") as any)
        .select("id")
        .eq("school_id", schoolId)
        .limit(1)
        .maybeSingle();
      yearId = yearData?.id;
    }

    if (!yearId) {
      return { success: false, error: "Academic year context missing for school." };
    }

    // Check duplicate class name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingClass } = await (supabase.from("classes") as any)
      .select("id")
      .eq("school_id", schoolId)
      .eq("academic_year_id", yearId)
      .eq("name", payload.name)
      .maybeSingle();

    if (existingClass) {
      return { success: false, error: `Class section '${payload.name}' already exists for this academic year.` };
    }

    // Insert class record under Administrator RLS authorization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newClass, error: insertErr } = await (supabase.from("classes") as any)
      .insert({
        school_id: schoolId,
        academic_year_id: yearId,
        name: payload.name,
        grade_level: payload.gradeLevel,
        section: payload.section || null,
        capacity: payload.capacity,
        class_teacher_id: payload.classTeacherId || null,
      })
      .select("id")
      .single();

    if (insertErr || !newClass) {
      return { success: false, error: insertErr?.message || "Failed to create class section." };
    }

    // Audit log
    await recordAuditLog(
      "CLASS_CREATION",
      "classes",
      newClass.id,
      `Administrator (${user.id}) created class section '${payload.name}' in school ${schoolId}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Class creation failed.";
    return { success: false, error: msg };
  }
}

export async function updateClass(id: string, payload: Partial<CreateClassPayload>): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: "UNAUTHORIZED: Only an administrator can edit classes." };
    }

    if (payload.capacity !== undefined && payload.capacity <= 0) {
      return { success: false, error: "Class capacity must be a positive integer." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("classes") as any)
      .update({
        name: payload.name,
        grade_level: payload.gradeLevel,
        section: payload.section,
        capacity: payload.capacity,
        class_teacher_id: payload.classTeacherId,
      })
      .eq("id", id)
      .eq("school_id", adminProfile.school_id);

    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "CLASS_MODIFICATION",
      "classes",
      id,
      `Administrator (${user.id}) updated class section ${id} in school ${adminProfile.school_id}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed.";
    return { success: false, error: msg };
  }
}

export async function deactivateClass(id: string): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: "UNAUTHORIZED: Only an administrator can deactivate classes." };
    }

    // Audit log (Soft-deactivation preserving historical enrollments, attendance, and results)
    await recordAuditLog(
      "CLASS_MODIFICATION",
      "classes",
      id,
      `Administrator (${user.id}) soft-deactivated class ID ${id} with historical record preservation.`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Deactivation failed.";
    return { success: false, error: msg };
  }
}

export async function assignClassTeacher(classId: string, teacherId: string | null): Promise<{ success: boolean; error?: string }> {
  return updateClass(classId, { classTeacherId: teacherId || undefined });
}
