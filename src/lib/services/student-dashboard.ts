import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface StudentPublishedResult {
  id: string;
  subjectCode: string;
  subjectName: string;
  continuousAssessmentScore: number;
  examinationScore: number;
  totalScore: number;
  grade: string;
  remarks: string;
}

export interface StudentAttendanceSummary {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  totalSessions: number;
  attendanceRate: number | null;
}

export interface StudentAnnouncement {
  id: string;
  title: string;
  date: string;
  category: "academic" | "event" | "administrative";
  content: string;
}

export interface StudentDashboardData {
  studentName: string;
  studentCode: string;
  schoolName: string;
  schoolCode: string;
  className: string;
  gradeLevel: string;
  academicYear: string;
  currentTerm: string;
  hasActiveEnrollment: boolean;
  overallAverage: number | null;
  subjectsWithResultsCount: number;
  attendanceSummary: StudentAttendanceSummary;
  publishedResults: StudentPublishedResult[];
  announcements: StudentAnnouncement[];
  resultStatusNotice: string;
}

export async function fetchStudentDashboardData(): Promise<StudentDashboardData> {
  const config = getSupabaseEnvConfig();

  // Mock Fallback for Authenticated Student Profile (Kwame Kyeremateng)
  if (config.isPlaceholder || !config.isConfigured) {
    const publishedResults: StudentPublishedResult[] = [
      {
        id: "res-101",
        subjectCode: "MATH-101",
        subjectName: "Core Mathematics",
        continuousAssessmentScore: 34,
        examinationScore: 50,
        totalScore: 84,
        grade: "A1",
        remarks: "Excellent",
      },
      {
        id: "res-102",
        subjectCode: "SCI-101",
        subjectName: "Integrated Science",
        continuousAssessmentScore: 32,
        examinationScore: 46,
        totalScore: 78,
        grade: "B2",
        remarks: "Very Good",
      },
      {
        id: "res-103",
        subjectCode: "ENG-101",
        subjectName: "Core English Language",
        continuousAssessmentScore: 35,
        examinationScore: 50,
        totalScore: 85,
        grade: "A1",
        remarks: "Excellent",
      },
    ];

    return {
      studentName: "Kwame Kyeremateng",
      studentCode: "GES-2026-001",
      schoolName: "Codivex Academy",
      schoolCode: "ABS-2026",
      className: "Basic 8 - Section A",
      gradeLevel: "Basic 8",
      academicYear: "2026/2027 Academic Year",
      currentTerm: "Term 1",
      hasActiveEnrollment: true,
      overallAverage: 82.3,
      subjectsWithResultsCount: 3,
      attendanceSummary: {
        presentCount: 36,
        absentCount: 1,
        lateCount: 1,
        excusedCount: 0,
        totalSessions: 38,
        attendanceRate: 97.4,
      },
      publishedResults,
      announcements: [
        {
          id: "ann-1",
          title: "Term 1 BECE Mock Examinations Schedule",
          date: "12 Aug 2026",
          category: "academic",
          content: "Continuous assessment mock examinations for Basic 8 & Basic 9 students begin next Monday.",
        },
        {
          id: "ann-2",
          title: "National Science & Maths Quiz Intra-School Trials",
          date: "10 Aug 2026",
          category: "event",
          content: "All interested J.H.S students are invited to register for team selection.",
        },
      ],
      resultStatusNotice: "Official term results published",
    };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    // Fetch profile and student record in parallel — previously these were two
    // sequential awaits (getUser → profiles query → students query).
    const [profileRes, studentRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("profiles") as any)
        .select("first_name, last_name, role, school_id, schools:school_id(name, code)")
        .eq("id", user.id)
        .single(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("students") as any)
        .select("id, student_code, status")
        .eq("profile_id", user.id)
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    if (!profile || profile.role !== "student") {
      throw new Error("UNAUTHORIZED: Access restricted to authorized student accounts.");
    }

    const schoolId = profile.school_id;
    const studentName = `${profile.first_name || "Student"} ${profile.last_name || ""}`.trim();
    const schoolName = profile.schools?.name || "Codivex Academy";
    const schoolCode = profile.schools?.code || "SCH-01";

    const studentRec = studentRes.data;
    if (!studentRec) {
      throw new Error("Student account record not found.");
    }

    const studentId = studentRec.id;
    const studentCode = studentRec.student_code || "GES-STU";

    // Run all remaining queries in parallel — enrollment, settings, results, attendance, and announcements
    // all depend only on studentId/schoolId which are already resolved above.
    const [enrollmentRes, settingsRes, resultsRes, attRes, announcementsRes] = await Promise.all([
      // Current active enrollment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("student_enrollments") as any)
        .select("class_id, academic_year_id, classes:class_id(name, grade_level), academic_years:academic_year_id(name)")
        .eq("student_id", studentId)
        .eq("school_id", schoolId)
        .eq("status", "enrolled")
        .order("created_at", { ascending: false })
        .limit(1),
      // Active term from school_settings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("school_settings") as any)
        .select("current_term_id, terms:current_term_id(name)")
        .eq("school_id", schoolId)
        .maybeSingle(),
      // Published results only
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("results") as any)
        .select("id, subject_id, continuous_assessment_score, examination_score, total_score, grade, remarks, status, subjects:subject_id(code, name)")
        .eq("student_id", studentId)
        .eq("school_id", schoolId)
        .eq("status", "published"),
      // Attendance records
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("attendance") as any)
        .select("status")
        .eq("student_id", studentId)
        .eq("school_id", schoolId),
      // Announcements targeting students or all — most recent 5
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("announcements") as any)
        .select("id, title, content, target_audience, created_at")
        .eq("school_id", schoolId)
        .eq("is_published", true)
        .in("target_audience", ["all", "students"])
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const enrollmentRows = enrollmentRes.data;
    const enrollment = enrollmentRows && enrollmentRows.length > 0 ? enrollmentRows[0] : null;

    const hasActiveEnrollment = Boolean(enrollment);
    const className = enrollment?.classes?.name || "No active enrollment found.";
    const gradeLevel = enrollment?.classes?.grade_level || "—";
    const academicYear = enrollment?.academic_years?.name || "2026/2027 Academic Year";

    const settings = settingsRes.data ?? settingsRes;
    const currentTerm = settings?.terms?.name || "Term 1";

    const rawResults = resultsRes.data || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const publishedResults: StudentPublishedResult[] = rawResults.map((r: any) => ({
      id: r.id,
      subjectCode: r.subjects?.code || "SUBJ",
      subjectName: r.subjects?.name || "Subject",
      continuousAssessmentScore: Number(r.continuous_assessment_score || 0),
      examinationScore: Number(r.examination_score || 0),
      totalScore: Number(r.total_score || (Number(r.continuous_assessment_score || 0) + Number(r.examination_score || 0))),
      grade: r.grade || "N/A",
      remarks: r.remarks || "Assessed",
    }));

    const scores = publishedResults.map((r) => r.totalScore);
    const overallAverage = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : null;

    const attRecords = attRes.data || [];
    const totalSessions = attRecords.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presentCount = attRecords.filter((a: any) => a.status === "present").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const absentCount = attRecords.filter((a: any) => a.status === "absent").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lateCount = attRecords.filter((a: any) => a.status === "late").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const excusedCount = attRecords.filter((a: any) => a.status === "excused").length;
    const attendanceRate = totalSessions > 0 ? Number((((presentCount + lateCount) / totalSessions) * 100).toFixed(1)) : null;

    return {
      studentName,
      studentCode,
      schoolName,
      schoolCode,
      className,
      gradeLevel,
      academicYear,
      currentTerm,
      hasActiveEnrollment,
      overallAverage,
      subjectsWithResultsCount: publishedResults.length,
      attendanceSummary: {
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        totalSessions,
        attendanceRate,
      },
      publishedResults,
      announcements: (announcementsRes.data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        date: new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        category: "administrative" as const,
        content: a.content,
      })),
      resultStatusNotice: publishedResults.length > 0 ? "Results available" : "No published results yet",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error loading student dashboard";
    return {
      studentName: "Student User",
      studentCode: "GES-STU",
      schoolName: "Codivex Academy",
      schoolCode: "ABS-2026",
      className: "No active enrollment found.",
      gradeLevel: "—",
      academicYear: "2026/2027 Academic Year",
      currentTerm: "Term 1",
      hasActiveEnrollment: false,
      overallAverage: null,
      subjectsWithResultsCount: 0,
      attendanceSummary: {
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        totalSessions: 0,
        attendanceRate: null,
      },
      publishedResults: [],
      announcements: [],
      resultStatusNotice: msg,
    };
  }
}
