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
      schoolName: "Achimota Basic School",
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

    // Fetch user profile and verify student role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("first_name, last_name, role, school_id, schools:school_id(name, code)")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "student") {
      throw new Error("UNAUTHORIZED: Access restricted to authorized student accounts.");
    }

    const schoolId = profile.school_id;
    const studentName = `${profile.first_name || "Student"} ${profile.last_name || ""}`.trim();
    const schoolName = profile.schools?.name || "Achimota Basic School";
    const schoolCode = profile.schools?.code || "SCH-01";

    // Query student record linked to auth profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: studentRec } = await (supabase.from("students") as any)
      .select("id, student_code, status")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!studentRec) {
      throw new Error("Student account record not found.");
    }

    const studentId = studentRec.id;
    const studentCode = studentRec.student_code || "GES-STU";

    // Query current active enrollment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: enrollment } = await (supabase.from("student_enrollments") as any)
      .select("class_id, academic_year_id, classes:class_id(name, grade_level), academic_years:academic_year_id(name)")
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .maybeSingle();

    const hasActiveEnrollment = Boolean(enrollment);
    const className = enrollment?.classes?.name || "No active enrollment found.";
    const gradeLevel = enrollment?.classes?.grade_level || "—";
    const academicYear = enrollment?.academic_years?.name || "2026/2027 Academic Year";

    // Query active term from school_settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: settings } = await (supabase.from("school_settings") as any)
      .select("current_term_id, terms:current_term_id(name)")
      .eq("school_id", schoolId)
      .maybeSingle();

    const currentTerm = settings?.terms?.name || "Term 1";

    // Query ONLY published results for this student
    // Excludes draft, returned, under_review, and unapproved results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resultsData } = await (supabase.from("results") as any)
      .select("id, subject_id, continuous_assessment_score, examination_score, total_score, grade, remarks, status, subjects:subject_id(code, name)")
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .eq("status", "published");

    const rawResults = resultsData || [];
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

    // Query attendance records for this student
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attData } = await (supabase.from("attendance") as any)
      .select("status")
      .eq("student_id", studentId)
      .eq("school_id", schoolId);

    const attRecords = attData || [];
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
      announcements: [],
      resultStatusNotice: publishedResults.length > 0 ? "Results available" : "No published results yet",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error loading student dashboard";
    return {
      studentName: "Student User",
      studentCode: "GES-STU",
      schoolName: "Achimota Basic School",
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
