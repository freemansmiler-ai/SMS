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
  const config = getSupabaseEnvConfig();

  if (config.isPlaceholder || !config.isConfigured) {
    // Fetch identity for mock path — still needed for the return value
    const identity = await fetchPrincipalIdentity();
    return {
      identity: identity || {
        profileId: "prof-301",
        schoolId: "sch-01",
        schoolName: "Achimota Basic School",
        schoolCode: "ABS-2026",
        firstName: "Headmaster",
        lastName: "Principal",
        email: "principal@codivex.tech",
      },
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
      currentAcademicYear: "2026/2027 Academic Year",
      currentTerm: "Term 1",
      classOccupancy: [],
      resultStatus: {
        draftCount: 0,
        submittedCount: 0,
        underReviewCount: 0,
        returnedCount: 0,
        approvedCount: 0,
        publishedCount: 0,
      },
      attendanceSummary: {
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
      },
    };
  }

  const supabase = createBrowserClient();
  try {
    // Resolve identity inline — avoids the separate sequential fetchPrincipalIdentity call
    // that previously caused a full extra auth + profiles round trip before any DB queries ran.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        identity: null,
        metrics: { totalStudents: 0, activeStudents: 0, totalTeachers: 0, activeTeachers: 0, totalClasses: 0, activeClasses: 0, totalSubjects: 0, assignedSubjectsCount: 0, unassignedSubjectsCount: 0, overallSchoolAverage: 0, overallPassRate: 0, attendanceRate: 0, pendingResultApprovals: 0 },
        currentAcademicYear: "No Active Academic Year", currentTerm: "No Active Term",
        classOccupancy: [], resultStatus: { draftCount: 0, submittedCount: 0, underReviewCount: 0, returnedCount: 0, approvedCount: 0, publishedCount: 0 },
        attendanceSummary: { presentCount: 0, absentCount: 0, lateCount: 0, excusedCount: 0 },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("id, school_id, email, first_name, last_name, role, avatar_url, schools:school_id ( name, code )")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "principal") {
      return {
        identity: null,
        metrics: { totalStudents: 0, activeStudents: 0, totalTeachers: 0, activeTeachers: 0, totalClasses: 0, activeClasses: 0, totalSubjects: 0, assignedSubjectsCount: 0, unassignedSubjectsCount: 0, overallSchoolAverage: 0, overallPassRate: 0, attendanceRate: 0, pendingResultApprovals: 0 },
        currentAcademicYear: "No Active Academic Year", currentTerm: "No Active Term",
        classOccupancy: [], resultStatus: { draftCount: 0, submittedCount: 0, underReviewCount: 0, returnedCount: 0, approvedCount: 0, publishedCount: 0 },
        attendanceSummary: { presentCount: 0, absentCount: 0, lateCount: 0, excusedCount: 0 },
      };
    }

    const identity: PrincipalIdentityInfo = {
      profileId: profile.id,
      schoolId: profile.school_id,
      schoolName: profile.schools?.name || "Achimota Basic School",
      schoolCode: profile.schools?.code || "SCH-01",
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
    };

    const schoolId = identity.schoolId;

    // All queries run in parallel — server-side COUNT queries replace full-row fetches
    // that were previously loading every row into JS memory just to call .filter().length.
    const [
      totalStudentsRes,
      activeStudentsRes,
      totalTeachersRes,
      activeTeachersRes,
      classesRes,
      subjectsRes,
      assignmentsRes,
      settingsRes,
      draftResultsRes,
      submittedResultsRes,
      underReviewResultsRes,
      returnedResultsRes,
      approvedResultsRes,
      publishedResultsRes,
      presentAttRes,
      absentAttRes,
      lateAttRes,
      excusedAttRes,
    ] = await Promise.all([
      // Student counts — server-side, no rows transferred
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("students") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("students") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "active"),
      // Teacher counts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("profiles") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "teacher"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("profiles") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "teacher").eq("is_active", true),
      // Classes — still need rows to build classOccupancy breakdown
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("classes") as any)
        .select("id, name, grade_level, capacity, student_enrollments(id)")
        .eq("school_id", schoolId),
      // Subject counts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("subjects") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId),
      // Assignments — only subject_id needed for distinct count
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("teacher_assignments") as any).select("subject_id").eq("school_id", schoolId),
      // School settings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("school_settings") as any)
        .select("current_academic_year_id, current_term_id, academic_years:current_academic_year_id(name), terms:current_term_id(name)")
        .eq("school_id", schoolId)
        .maybeSingle(),
      // Result status counts — server-side per status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("results") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "draft"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("results") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "submitted"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("results") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "under_review"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("results") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "returned"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("results") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "approved"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("results") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "published"),
      // Attendance counts — server-side per status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("attendance") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "present"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("attendance") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "absent"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("attendance") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "late"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("attendance") as any).select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "excused"),
    ]);

    // Counts
    const totalStudents = totalStudentsRes.count ?? 0;
    const activeStudents = activeStudentsRes.count ?? 0;
    const totalTeachers = totalTeachersRes.count ?? 0;
    const activeTeachers = activeTeachersRes.count ?? 0;
    const totalSubjects = subjectsRes.count ?? 0;

    // Class Occupancy
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

    // Subject assignment breakdown
    const assignedSubjectIds = new Set((assignmentsRes.data || []).map((a: { subject_id: string }) => a.subject_id));
    const assignedSubjectsCount = assignedSubjectIds.size;
    const unassignedSubjectsCount = Math.max(0, totalSubjects - assignedSubjectsCount);

    // Result status summary — from server-side counts
    const resultStatus: ResultSubmissionStatusSummary = {
      draftCount: draftResultsRes.count ?? 0,
      submittedCount: submittedResultsRes.count ?? 0,
      underReviewCount: underReviewResultsRes.count ?? 0,
      returnedCount: returnedResultsRes.count ?? 0,
      approvedCount: approvedResultsRes.count ?? 0,
      publishedCount: publishedResultsRes.count ?? 0,
    };

    // Attendance summary — from server-side counts
    const attendanceSummary: AttendancePeriodSummary = {
      presentCount: presentAttRes.count ?? 0,
      absentCount: absentAttRes.count ?? 0,
      lateCount: lateAttRes.count ?? 0,
      excusedCount: excusedAttRes.count ?? 0,
    };

    const settingsData = settingsRes.data ?? settingsRes;

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
      currentAcademicYear: settingsData?.academic_years?.name || "2026/2027 Academic Year",
      currentTerm: settingsData?.terms?.name || "Term 1",
      classOccupancy,
      resultStatus,
      attendanceSummary,
    };
  } catch {
    return {
      identity: null,
      metrics: {
        totalStudents: 0, activeStudents: 0, totalTeachers: 0, activeTeachers: 0,
        totalClasses: 0, activeClasses: 0, totalSubjects: 0, assignedSubjectsCount: 0,
        unassignedSubjectsCount: 0, overallSchoolAverage: 0, overallPassRate: 0,
        attendanceRate: 0, pendingResultApprovals: 0,
      },
      currentAcademicYear: "No Active Academic Year",
      currentTerm: "No Active Term",
      classOccupancy: [],
      resultStatus: { draftCount: 0, submittedCount: 0, underReviewCount: 0, returnedCount: 0, approvedCount: 0, publishedCount: 0 },
      attendanceSummary: { presentCount: 0, absentCount: 0, lateCount: 0, excusedCount: 0 },
    };
  }
}
