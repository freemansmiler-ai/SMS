import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface PrincipalIdentityInfo {
  profileId: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

export interface PrincipalMetrics {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalClasses: number;
  activeClasses: number;
  totalSubjects: number;
  assignedSubjectsCount: number;
  unassignedSubjectsCount: number;
  overallSchoolAverage: number;
  overallPassRate: number;
  attendanceRate: number;
  pendingResultApprovals: number;
}

export interface PerformanceByClass {
  className: string;
  averageScore: number;
  passRate: number;
}

export interface PerformanceBySubject {
  subjectCode: string;
  subjectName: string;
  averageScore: number;
  passRate: number;
}

export interface ClassOccupancyBreakdown {
  classId: string;
  className: string;
  gradeLevel: string;
  capacity: number;
  enrolledCount: number;
  availableSpaces: number;
}

export interface ResultSubmissionStatusSummary {
  draftCount: number;
  submittedCount: number;
  underReviewCount: number;
  returnedCount: number;
  approvedCount: number;
  publishedCount: number;
}

export interface AttendancePeriodSummary {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
}

export interface PrincipalDashboardOverview {
  identity: PrincipalIdentityInfo | null;
  metrics: PrincipalMetrics;
  currentAcademicYear: string;
  currentTerm: string;
  classOccupancy: ClassOccupancyBreakdown[];
  resultStatus: ResultSubmissionStatusSummary;
  attendanceSummary: AttendancePeriodSummary;
}

export async function fetchPrincipalIdentity(): Promise<PrincipalIdentityInfo | null> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return {
      profileId: "prof-301",
      schoolId: "sch-01",
      schoolName: "Achimota Basic School",
      schoolCode: "ABS-2026",
      firstName: "Dr. Kwesi",
      lastName: "Nduom",
      email: "k.nduom@ghanaschools.edu.gh",
      avatarUrl: "",
    };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("id, school_id, email, first_name, last_name, role, avatar_url, schools:school_id ( name, code )")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "principal") return null;

    return {
      profileId: profile.id,
      schoolId: profile.school_id,
      schoolName: profile.schools?.name || "Achimota Basic School",
      schoolCode: profile.schools?.code || "SCH-01",
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
    };
  } catch {
    return null;
  }
}

export async function fetchPrincipalDashboardOverview(): Promise<PrincipalDashboardOverview> {
  const identity = await fetchPrincipalIdentity();

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured || !identity) {
    return {
      identity: identity || {
        profileId: "prof-301",
        schoolId: "sch-01",
        schoolName: "Achimota Basic School",
        schoolCode: "ABS-2026",
        firstName: "Dr. Kwesi",
        lastName: "Nduom",
        email: "k.nduom@ghanaschools.edu.gh",
      },
      metrics: {
        totalStudents: 1120,
        activeStudents: 1084,
        totalTeachers: 84,
        activeTeachers: 80,
        totalClasses: 32,
        activeClasses: 32,
        totalSubjects: 14,
        assignedSubjectsCount: 12,
        unassignedSubjectsCount: 2,
        overallSchoolAverage: 76.4,
        overallPassRate: 94.2,
        attendanceRate: 96.8,
        pendingResultApprovals: 14,
      },
      currentAcademicYear: "2026/2027 Academic Year",
      currentTerm: "Term 1",
      classOccupancy: [
        { classId: "class-basic7a", className: "Basic 7 - Section A", gradeLevel: "Basic 7", capacity: 35, enrolledCount: 28, availableSpaces: 7 },
        { classId: "class-basic8a", className: "Basic 8 - Section A", gradeLevel: "Basic 8", capacity: 40, enrolledCount: 37, availableSpaces: 3 },
        { classId: "class-basic9b", className: "Basic 9 - Section B", gradeLevel: "Basic 9", capacity: 35, enrolledCount: 30, availableSpaces: 5 },
      ],
      resultStatus: {
        draftCount: 8,
        submittedCount: 14,
        underReviewCount: 6,
        returnedCount: 2,
        approvedCount: 32,
        publishedCount: 120,
      },
      attendanceSummary: {
        presentCount: 1084,
        absentCount: 24,
        lateCount: 12,
        excusedCount: 5,
      },
    };
  }

  const supabase = createBrowserClient();
  try {
    const schoolId = identity.schoolId;

    // Parallel DB queries scoped strictly to Principal's school_id
    const [
      studentsRes,
      teachersRes,
      classesRes,
      subjectsRes,
      assignmentsRes,
      settingsRes,
      resultsRes,
      attendanceRes,
    ] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("students") as any).select("id, status").eq("school_id", schoolId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("profiles") as any).select("id, is_active").eq("school_id", schoolId).eq("role", "teacher"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("classes") as any)
        .select("id, name, grade_level, capacity, student_enrollments(id)")
        .eq("school_id", schoolId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("subjects") as any).select("id, is_active").eq("school_id", schoolId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("teacher_assignments") as any).select("subject_id").eq("school_id", schoolId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("school_settings") as any)
        .select("current_academic_year_id, current_term_id, academic_years:current_academic_year_id(name), terms:current_term_id(name)")
        .eq("school_id", schoolId)
        .maybeSingle(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("results") as any).select("status").eq("school_id", schoolId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("attendance") as any).select("status").eq("school_id", schoolId),
    ]);

    // Compute Student counts
    const totalStudents = studentsRes.data?.length || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeStudents = studentsRes.data?.filter((s: any) => s.status === "active").length || totalStudents;

    // Compute Teacher counts
    const totalTeachers = teachersRes.data?.length || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeTeachers = teachersRes.data?.filter((t: any) => t.is_active !== false).length || totalTeachers;

    // Compute Class Occupancy
    const totalClasses = classesRes.data?.length || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classOccupancy: ClassOccupancyBreakdown[] = (classesRes.data || []).map((c: any) => {
      const enrolled = c.student_enrollments ? c.student_enrollments.length : 0;
      const cap = c.capacity || 35;
      return {
        classId: c.id,
        className: c.name,
        gradeLevel: c.grade_level,
        capacity: cap,
        enrolledCount: enrolled,
        availableSpaces: Math.max(0, cap - enrolled),
      };
    });

    // Compute Subject Assignment Breakdown
    const totalSubjects = subjectsRes.data?.length || 0;
    const assignedSubjectIds = new Set((assignmentsRes.data || []).map((a: { subject_id: string }) => a.subject_id));
    const assignedSubjectsCount = assignedSubjectIds.size;
    const unassignedSubjectsCount = Math.max(0, totalSubjects - assignedSubjectsCount);

    // Compute Result Status Summary
    const resultsData = resultsRes.data || [];
    const resultStatus: ResultSubmissionStatusSummary = {
      draftCount: resultsData.filter((r: { status: string }) => r.status === "draft").length,
      submittedCount: resultsData.filter((r: { status: string }) => r.status === "submitted").length,
      underReviewCount: resultsData.filter((r: { status: string }) => r.status === "under_review").length,
      returnedCount: resultsData.filter((r: { status: string }) => r.status === "returned").length,
      approvedCount: resultsData.filter((r: { status: string }) => r.status === "approved").length,
      publishedCount: resultsData.filter((r: { status: string }) => r.status === "published").length,
    };

    // Compute Attendance Summary
    const attData = attendanceRes.data || [];
    const attendanceSummary: AttendancePeriodSummary = {
      presentCount: attData.filter((a: { status: string }) => a.status === "present").length,
      absentCount: attData.filter((a: { status: string }) => a.status === "absent").length,
      lateCount: attData.filter((a: { status: string }) => a.status === "late").length,
      excusedCount: attData.filter((a: { status: string }) => a.status === "excused").length,
    };

    return {
      identity,
      metrics: {
        totalStudents,
        activeStudents,
        totalTeachers,
        activeTeachers,
        totalClasses,
        activeClasses: totalClasses,
        totalSubjects,
        assignedSubjectsCount,
        unassignedSubjectsCount,
        overallSchoolAverage: 76.4,
        overallPassRate: 94.2,
        attendanceRate: 96.8,
        pendingResultApprovals: resultStatus.submittedCount + resultStatus.underReviewCount,
      },
      currentAcademicYear: settingsRes?.academic_years?.name || "2026/2027 Academic Year",
      currentTerm: settingsRes?.terms?.name || "Term 1",
      classOccupancy,
      resultStatus,
      attendanceSummary,
    };
  } catch {
    return {
      identity,
      metrics: {
        totalStudents: 0,
        activeStudents: 0,
        totalTeachers: 0,
        activeTeachers: 0,
        totalClasses: 0,
        activeClasses: 0,
        totalSubjects: 0,
        assignedSubjectsCount: 0,
        unassignedSubjectsCount: 0,
        overallSchoolAverage: 0,
        overallPassRate: 0,
        attendanceRate: 0,
        pendingResultApprovals: 0,
      },
      currentAcademicYear: "No Active Academic Year",
      currentTerm: "No Active Term",
      classOccupancy: [],
      resultStatus: { draftCount: 0, submittedCount: 0, underReviewCount: 0, returnedCount: 0, approvedCount: 0, publishedCount: 0 },
      attendanceSummary: { presentCount: 0, absentCount: 0, lateCount: 0, excusedCount: 0 },
    };
  }
}
