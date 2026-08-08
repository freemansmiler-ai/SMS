import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { StudentRecord } from "@/lib/services/students";

export async function fetchTeacherStudents(filters?: {
  search?: string;
  classId?: string;
}): Promise<StudentRecord[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback for Teacher View (Filtered strictly to Abena Appiah's assigned classes: Basic 8 - Section A & Basic 9 - Section B)
  if (config.isPlaceholder || !config.isConfigured) {
    const mockTeacherStudents: StudentRecord[] = [
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
        id: "stu-104",
        profileId: "prof-104",
        studentCode: "GES-2026-004",
        firstName: "Esi",
        lastName: "Boateng",
        email: "e.boateng@student.ghanaschools.edu.gh",
        dateOfBirth: "2009-11-05",
        gender: "Female",
        guardianName: "Kwaku Boateng",
        guardianContact: "+233 24 999 8877",
        status: "active",
        enrollmentDate: "2026-09-01",
        className: "Basic 9 - Section B",
        classId: "class-basic9b",
        gradeLevel: "Basic 9",
        avatarUrl: "",
      },
    ];

    let filtered = mockTeacherStudents;
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
    if (filters?.classId && filters.classId !== "all") {
      filtered = filtered.filter((s) => s.classId === filters.classId);
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Fetch teacher record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teacherRec } = await (supabase.from("teachers") as any)
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!teacherRec) return [];

    // 2. Fetch assigned class IDs for this teacher
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assignments } = await (supabase.from("teacher_assignments") as any)
      .select("class_id")
      .eq("teacher_id", teacherRec.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignedClassIds = (assignments || []).map((a: any) => a.class_id);
    if (assignedClassIds.length === 0) return [];

    // 3. Query students enrolled in assigned classes (Enforced by RLS & Explicit Join)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("student_enrollments") as any)
      .select(`
        student_id,
        students:student_id (
          id,
          profile_id,
          student_code,
          date_of_birth,
          gender,
          guardian_name,
          guardian_contact,
          status,
          enrollment_date,
          profiles:profile_id (first_name, last_name, email, avatar_url)
        ),
        classes:class_id (name, grade_level)
      `)
      .in("class_id", assignedClassIds);

    const { data, error } = await query;
    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => ({
      id: item.students?.id,
      profileId: item.students?.profile_id,
      studentCode: item.students?.student_code,
      firstName: item.students?.profiles?.first_name || "",
      lastName: item.students?.profiles?.last_name || "",
      email: item.students?.profiles?.email || "",
      dateOfBirth: item.students?.date_of_birth,
      gender: item.students?.gender,
      guardianName: item.students?.guardian_name,
      guardianContact: item.students?.guardian_contact,
      status: item.students?.status || "active",
      enrollmentDate: item.students?.enrollment_date,
      avatarUrl: item.students?.profiles?.avatar_url || "",
      className: item.classes?.name || "Assigned Class",
    }));
  } catch {
    return [];
  }
}

export async function fetchTeacherStudentById(id: string): Promise<StudentRecord | null> {
  const students = await fetchTeacherStudents({});
  const found = students.find((s) => s.id === id);
  return found || null;
}
