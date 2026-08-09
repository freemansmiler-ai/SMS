import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface TeacherProfileInfo {
  teacherId: string;
  profileId: string;
  schoolId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  qualification: string;
  avatarUrl?: string;
}

export interface TeacherAuthorizedAssignment {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  gradeLevel: string;
  academicYearId: string;
  academicYearName: string;
  termId: string;
  termName: string;
}

export interface ClassStudentRosterItem {
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  rollNumber?: number;
}

export interface AssignedClassSummary {
  id: string;
  classId: string;
  name: string;
  className: string;
  gradeLevel: string;
  studentCount: number;
  subjectName: string;
  subjectNames: string[];
}

export interface AssignedSubjectSummary {
  id: string;
  subjectId: string;
  code: string;
  subjectCode: string;
  name: string;
  subjectName: string;
  className: string;
  classNames: string[];
  classCount: number;
  studentCount: number;
}

export interface TeacherMetrics {
  totalSubjects: number;
  totalClasses: number;
  totalStudents: number;
  attendanceSubmittedToday: boolean;
  totalAssignedClasses: number;
  totalAssignedSubjects: number;
  totalStudentsTaught: number;
}

export interface TeacherDashboardData {
  identity: TeacherProfileInfo | null;
  assignments: TeacherAuthorizedAssignment[];
  metrics: TeacherMetrics;
  classesSummary: AssignedClassSummary[];
  subjectsSummary: AssignedSubjectSummary[];
  assignedClasses: AssignedClassSummary[];
  assignedSubjects: AssignedSubjectSummary[];
}

export async function fetchCurrentTeacherIdentity(): Promise<TeacherProfileInfo | null> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return {
      teacherId: "tch-201",
      profileId: "prof-201",
      schoolId: "sch-01",
      employeeCode: "GES-TCH-2026-001",
      firstName: "Abena",
      lastName: "Appiah",
      email: "a.appiah@ghanaschools.edu.gh",
      department: "Mathematics & Science",
      qualification: "B.Ed. Mathematics",
      avatarUrl: "",
    };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("id, school_id, email, first_name, last_name, role, avatar_url")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "teacher") return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teacher } = await (supabase.from("teachers") as any)
      .select("id, employee_code, department, qualification")
      .eq("profile_id", user.id)
      .eq("school_id", profile.school_id)
      .single();

    if (!teacher) return null;

    return {
      teacherId: teacher.id,
      profileId: profile.id,
      schoolId: profile.school_id,
      employeeCode: teacher.employee_code,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      department: teacher.department || "General",
      qualification: teacher.qualification || "B.Ed",
      avatarUrl: profile.avatar_url,
    };
  } catch {
    return null;
  }
}

export async function fetchTeacherAuthorizedAssignments(): Promise<TeacherAuthorizedAssignment[]> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return [
      {
        id: "asgn-1",
        subjectId: "subj-math101",
        subjectName: "Core Mathematics",
        subjectCode: "MATH-101",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        gradeLevel: "Basic 8",
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        termId: "term-1-2026",
        termName: "Term 1",
      },
      {
        id: "asgn-2",
        subjectId: "subj-math101",
        subjectName: "Core Mathematics",
        subjectCode: "MATH-101",
        classId: "class-basic7a",
        className: "Basic 7 - Section A",
        gradeLevel: "Basic 7",
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        termId: "term-1-2026",
        termName: "Term 1",
      },
      {
        id: "asgn-3",
        subjectId: "subj-sci101",
        subjectName: "Integrated Science",
        subjectCode: "SCI-101",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        gradeLevel: "Basic 8",
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        termId: "term-1-2026",
        termName: "Term 1",
      },
    ];
  }

  const identity = await fetchCurrentTeacherIdentity();
  if (!identity) return [];

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assignments, error } = await (supabase.from("teacher_assignments") as any)
      .select(`
        id,
        subject_id,
        class_id,
        academic_year_id,
        term_id,
        subjects:subject_id ( id, name, code ),
        classes:class_id ( id, name, grade_level ),
        academic_years:academic_year_id ( id, name ),
        terms:term_id ( id, name )
      `)
      .eq("teacher_id", identity.teacherId)
      .eq("school_id", identity.schoolId);

    if (error || !assignments) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return assignments.map((a: any) => ({
      id: a.id,
      subjectId: a.subject_id,
      subjectName: a.subjects?.name || "Subject",
      subjectCode: a.subjects?.code || "SUBJ",
      classId: a.class_id,
      className: a.classes?.name || "Class",
      gradeLevel: a.classes?.grade_level || "",
      academicYearId: a.academic_year_id,
      academicYearName: a.academic_years?.name || "Academic Year",
      termId: a.term_id,
      termName: a.terms?.name || "Term",
    }));
  } catch {
    return [];
  }
}

export async function fetchAuthorizedClassRoster(
  classId: string,
  academicYearId: string,
  subjectId: string
): Promise<ClassStudentRosterItem[]> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return [
      {
        studentId: "stu-101",
        studentCode: "GES-2026-001",
        firstName: "Kwame",
        lastName: "Kyeremateng",
        email: "k.kyeremateng@student.ghanaschools.edu.gh",
        status: "enrolled",
        rollNumber: 1,
      },
      {
        studentId: "stu-102",
        studentCode: "GES-2026-002",
        firstName: "Akosua",
        lastName: "Mensah",
        email: "a.mensah@student.ghanaschools.edu.gh",
        status: "enrolled",
        rollNumber: 2,
      },
      {
        studentId: "stu-103",
        studentCode: "GES-2026-003",
        firstName: "Kofi",
        lastName: "Osei",
        email: "k.osei@student.ghanaschools.edu.gh",
        status: "enrolled",
        rollNumber: 3,
      },
    ];
  }

  const assignments = await fetchTeacherAuthorizedAssignments();
  const isAuthorized = assignments.some(
    (a) =>
      a.classId === classId &&
      a.subjectId === subjectId &&
      a.academicYearId === academicYearId
  );

  if (!isAuthorized) {
    return []; // Denied
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: enrollments, error } = await (supabase.from("student_enrollments") as any)
      .select(`
        id,
        roll_number,
        status,
        students:student_id (
          id,
          student_code,
          profiles:profile_id ( first_name, last_name, email )
        )
      `)
      .eq("class_id", classId)
      .eq("academic_year_id", academicYearId);

    if (error || !enrollments) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return enrollments.map((e: any) => ({
      studentId: e.students?.id || "",
      studentCode: e.students?.student_code || "",
      firstName: e.students?.profiles?.first_name || "",
      lastName: e.students?.profiles?.last_name || "",
      email: e.students?.profiles?.email || "",
      status: e.status || "enrolled",
      rollNumber: e.roll_number,
    }));
  } catch {
    return [];
  }
}

export async function fetchTeacherDashboardData(): Promise<TeacherDashboardData> {
  const identity = await fetchCurrentTeacherIdentity();
  const assignments = await fetchTeacherAuthorizedAssignments();

  const classMap = new Map<string, AssignedClassSummary>();
  const subjectMap = new Map<string, AssignedSubjectSummary>();

  assignments.forEach((a) => {
    if (!classMap.has(a.classId)) {
      classMap.set(a.classId, {
        id: a.classId,
        classId: a.classId,
        name: a.className,
        className: a.className,
        gradeLevel: a.gradeLevel,
        studentCount: 30,
        subjectName: a.subjectName,
        subjectNames: [a.subjectName],
      });
    } else {
      const existing = classMap.get(a.classId)!;
      if (!existing.subjectNames.includes(a.subjectName)) {
        existing.subjectNames.push(a.subjectName);
      }
    }

    if (!subjectMap.has(a.subjectId)) {
      subjectMap.set(a.subjectId, {
        id: a.subjectId,
        subjectId: a.subjectId,
        code: a.subjectCode,
        subjectCode: a.subjectCode,
        name: a.subjectName,
        subjectName: a.subjectName,
        className: a.className,
        classNames: [a.className],
        classCount: 1,
        studentCount: 30,
      });
    } else {
      const existing = subjectMap.get(a.subjectId)!;
      if (!existing.classNames.includes(a.className)) {
        existing.classNames.push(a.className);
        existing.classCount++;
      }
    }
  });

  const classesSummary = Array.from(classMap.values());
  const subjectsSummary = Array.from(subjectMap.values());

  const totalStudents = classesSummary.reduce((acc, c) => acc + c.studentCount, 0);

  return {
    identity,
    assignments,
    metrics: {
      totalSubjects: subjectMap.size,
      totalClasses: classMap.size,
      totalStudents,
      attendanceSubmittedToday: false,
      totalAssignedClasses: classMap.size,
      totalAssignedSubjects: subjectMap.size,
      totalStudentsTaught: totalStudents,
    },
    classesSummary,
    subjectsSummary,
    assignedClasses: classesSummary,
    assignedSubjects: subjectsSummary,
  };
}
