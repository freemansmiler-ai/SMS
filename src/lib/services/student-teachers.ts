import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface StudentTeacherFilter {
  academicYearId?: string;
  termId?: string;
  subjectId?: string;
  searchQuery?: string;
}

export interface StudentTeacherItem {
  id: string;
  teacherId: string;
  teacherName: string;
  employeeCode: string;
  department: string;
  subjects: string[];
  email?: string;
  phone?: string;
  avatarUrl?: string;
  className: string;
  academicYearName: string;
  termName: string;
  isAssigned: boolean;
}

export interface UnassignedSubjectItem {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  className: string;
  notice: string;
}

export interface StudentTeachersOverview {
  studentName: string;
  studentCode: string;
  className: string;
  academicYearName: string;
  termName: string;
  teachers: StudentTeacherItem[];
  unassignedSubjects: UnassignedSubjectItem[];
  availableAcademicYears: Array<{ id: string; name: string }>;
  availableTerms: Array<{ id: string; name: string }>;
  availableSubjects: Array<{ id: string; name: string }>;
}

export async function fetchStudentAssignedTeachers(
  filters?: StudentTeacherFilter
): Promise<StudentTeachersOverview> {
  const config = getSupabaseEnvConfig();

  // Mock Fallback for Student Teachers (Kwame Kyeremateng)
  if (config.isPlaceholder || !config.isConfigured) {
    const teachers: StudentTeacherItem[] = [
      {
        id: "t-1",
        teacherId: "tch-201",
        teacherName: "Abena Appiah",
        employeeCode: "GES-TCH-2026-001",
        department: "Mathematics & Science",
        subjects: ["Core Mathematics", "Integrated Science"],
        email: "abena.appiah@achimota.edu.gh",
        phone: "+233 24 400 1122",
        className: "Basic 8 - Section A",
        academicYearName: "2026/2027 Academic Year",
        termName: "Term 1",
        isAssigned: true,
      },
      {
        id: "t-2",
        teacherId: "tch-202",
        teacherName: "Kofi Boateng",
        employeeCode: "GES-TCH-2026-002",
        department: "Languages",
        subjects: ["Core English Language"],
        email: "kofi.boateng@achimota.edu.gh",
        phone: "+233 20 811 3344",
        className: "Basic 8 - Section A",
        academicYearName: "2026/2027 Academic Year",
        termName: "Term 1",
        isAssigned: true,
      },
    ];

    const unassignedSubjects: UnassignedSubjectItem[] = [
      {
        subjectId: "subj-ict",
        subjectCode: "ICT-101",
        subjectName: "ICT & Computing",
        className: "Basic 8 - Section A",
        notice: "No teacher has been assigned to this subject yet.",
      },
    ];

    return {
      studentName: "Kwame Kyeremateng",
      studentCode: "GES-2026-001",
      className: "Basic 8 - Section A",
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
      teachers,
      unassignedSubjects,
      availableAcademicYears: [{ id: "ay-2026", name: "2026/2027 Academic Year" }],
      availableTerms: [{ id: "t-1", name: "Term 1" }],
      availableSubjects: [
        { id: "subj-math", name: "Core Mathematics" },
        { id: "subj-sci", name: "Integrated Science" },
        { id: "subj-eng", name: "Core English Language" },
      ],
    };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("first_name, last_name, role, school_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "student") {
      throw new Error("UNAUTHORIZED: Student access required.");
    }

    const schoolId = profile.school_id;
    const studentName = `${profile.first_name || "Student"} ${profile.last_name || ""}`.trim();

    // Parallelize metadata and student record queries
    const [
      { data: studentRec },
      { data: ayData },
      { data: termsData },
      { data: subData },
    ] = await Promise.all([
      (supabase.from("students") as any).select("id, student_code").eq("profile_id", user.id).maybeSingle(),
      (supabase.from("academic_years") as any).select("id, name").eq("school_id", schoolId),
      (supabase.from("terms") as any).select("id, name").eq("school_id", schoolId),
      (supabase.from("subjects") as any).select("id, name").eq("school_id", schoolId),
    ]);

    if (!studentRec) throw new Error("Student profile record not found.");

    const studentId = studentRec.id;
    const studentCode = studentRec.student_code || "GES-STU";
    const availableAcademicYears = ayData || [{ id: "ay-1", name: "2026/2027 Academic Year" }];
    const availableTerms = termsData || [{ id: "t-1", name: "Term 1" }];
    const availableSubjects = subData || [];

    // Query most recent active enrollment for the student to determine their class.
    // Order by created_at desc so the latest enrollment is used when multiple exist.
    let enrQuery = (supabase.from("student_enrollments") as any)
      .select("class_id, academic_year_id, classes:class_id(name)")
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .eq("status", "enrolled")
      .order("created_at", { ascending: false })
      .limit(1);

    if (filters?.academicYearId) enrQuery = enrQuery.eq("academic_year_id", filters.academicYearId);
    const { data: enrRows } = await enrQuery;
    const enrData = enrRows?.[0] ?? null;

    const classId = enrData?.class_id;
    const className = enrData?.classes?.name || "Basic Class";

    if (!classId) {
      return {
        studentName,
        studentCode,
        className: "No active enrollment found.",
        academicYearName: availableAcademicYears[0]?.name || "2026/2027 Academic Year",
        termName: availableTerms[0]?.name || "Term 1",
        teachers: [],
        unassignedSubjects: [],
        availableAcademicYears,
        availableTerms,
        availableSubjects,
      };
    }

    // Step 1: Get teacher assignments for the student's class.
    // We do NOT attempt a 3-level nested join (assignments → teachers → profiles)
    // because PostgREST only reliably supports one level of embedding per query.
    // Instead we fetch assignment + teacher metadata in step 1, then resolve
    // profile details (name, email, phone, avatar) in step 2.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let asgnQuery = (supabase.from("teacher_assignments") as any)
      .select(`
        id,
        teacher_id,
        subject_id,
        class_id,
        teachers:teacher_id (
          id,
          employee_code,
          department,
          profile_id
        ),
        subjects:subject_id (id, code, name),
        classes:class_id (name)
      `)
      .eq("class_id", classId)
      .eq("school_id", schoolId);

    if (filters?.academicYearId) asgnQuery = asgnQuery.eq("academic_year_id", filters.academicYearId);
    if (filters?.termId) asgnQuery = asgnQuery.eq("term_id", filters.termId);
    if (filters?.subjectId && filters.subjectId !== "all") asgnQuery = asgnQuery.eq("subject_id", filters.subjectId);

    const { data: assignmentsData } = await asgnQuery;
    const assignments = assignmentsData || [];

    // Step 2: Collect unique profile_ids from the assignments, then fetch profiles.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileIds = [...new Set(assignments.map((a: any) => a.teachers?.profile_id).filter(Boolean))];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profileMap = new Map<string, any>();
    if (profileIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profilesData } = await (supabase.from("profiles") as any)
        .select("id, first_name, last_name, email, phone, avatar_url")
        .in("id", profileIds);

      if (profilesData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profilesData.forEach((p: any) => profileMap.set(p.id, p));
      }
    }

    // Step 3: Merge assignments → teachers → profiles and group by teacher.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teacherMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assignments.forEach((a: any) => {
      if (!a.teachers) return;
      const tid = a.teachers.id;
      if (!tid) return;

      const tProf = profileMap.get(a.teachers.profile_id);
      const tName = tProf
        ? `${tProf.first_name || ""} ${tProf.last_name || ""}`.trim()
        : "Faculty Teacher";
      const sName = a.subjects?.name || "Subject";

      if (!teacherMap.has(tid)) {
        teacherMap.set(tid, {
          id: a.id,
          teacherId: tid,
          teacherName: tName,
          employeeCode: a.teachers.employee_code || "GES-TCH",
          department: a.teachers.department || "General Curriculum",
          subjects: [sName],
          email: tProf?.email || undefined,
          phone: tProf?.phone || undefined,
          avatarUrl: tProf?.avatar_url || undefined,
          className: a.classes?.name || className,
          academicYearName: availableAcademicYears[0]?.name || "2026/2027 Academic Year",
          termName: availableTerms[0]?.name || "Term 1",
          isAssigned: true,
        });
      } else {
        const existing = teacherMap.get(tid);
        if (!existing.subjects.includes(sName)) {
          existing.subjects.push(sName);
        }
      }
    });

    let teacherList: StudentTeacherItem[] = Array.from(teacherMap.values());

    // Client-side search filtering by teacher name, subject, or department
    if (filters?.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.toLowerCase();
      teacherList = teacherList.filter(
        (t) =>
          t.teacherName.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.subjects.some((s) => s.toLowerCase().includes(q))
      );
    }

    return {
      studentName,
      studentCode,
      className,
      academicYearName: availableAcademicYears[0]?.name || "2026/2027 Academic Year",
      termName: availableTerms[0]?.name || "Term 1",
      teachers: teacherList,
      unassignedSubjects: [],
      availableAcademicYears,
      availableTerms,
      availableSubjects,
    };
  } catch {
    return {
      studentName: "Student User",
      studentCode: "GES-STU",
      className: "Basic Class",
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
      teachers: [],
      unassignedSubjects: [],
      availableAcademicYears: [],
      availableTerms: [],
      availableSubjects: [],
    };
  }
}
