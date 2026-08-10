import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { calculateGESGrade } from "@/lib/services/teacher-results";

export interface ReportSubjectItem {
  code: string;
  name: string;
  classScore: number;
  projectScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remarks: string;
}

export interface StudentReportCard {
  schoolName: string;
  schoolCode: string;
  schoolAddress: string;
  schoolContact: string;
  logoUrl?: string;
  studentName: string;
  studentCode: string;
  studentId?: string;
  className: string;
  academicYear: string;
  term: string;
  totalStudentsInClass: number;
  overallAverage: number;
  totalMarksObtained?: number;
  totalMarksPossible?: number;
  classPosition?: string;
  overallGrade: string;
  overallStatus: "Passed" | "Academic Attention Required";
  attendanceRate: number;
  attendanceDaysPresent: number;
  attendanceDaysTotal: number;
  attendanceDaysAbsent: number;
  attendanceDaysLate: number;
  attendanceDaysExcused: number;
  principalComment?: string;
  principalRemarks?: string;
  classTeacherComment?: string;
  teacherRemarks?: string;
  promotedTo?: string;
  vacationDate: string;
  reopeningDate: string;
  subjects: ReportSubjectItem[];
  isComplete: boolean;
  generatedAt: string;
}

export interface StudentResultFilter {
  academicYearId?: string;
  termId?: string;
}

export interface StudentPublishedScoreItem {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  continuousAssessmentScore: number;
  examinationScore: number;
  totalScore: number;
  grade: string;
  remarks: string;
}

export interface StudentTermPerformanceTrend {
  termName: string;
  academicYearName: string;
  averageScore: number;
}

export interface SubjectHistoryProgression {
  subjectName: string;
  scoresByTerm: Array<{ termName: string; score: number }>;
}

export interface StudentResultsOverview {
  studentName: string;
  studentCode: string;
  className: string;
  academicYearName: string;
  termName: string;
  publishedCount: number;
  expectedCount: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  passRate: number | null;
  passedSubjectsCount: number;
  failedSubjectsCount: number;
  results: StudentPublishedScoreItem[];
  gradeDistribution: Array<{ grade: string; count: number }>;
  performanceTrends: StudentTermPerformanceTrend[];
  subjectHistories: SubjectHistoryProgression[];
  availableAcademicYears: Array<{ id: string; name: string }>;
  availableTerms: Array<{ id: string; name: string }>;
}

export async function fetchStudentPublishedResults(
  filters?: StudentResultFilter
): Promise<StudentResultsOverview> {
  const config = getSupabaseEnvConfig();

  // Mock Fallback for Student Results Profile
  if (config.isPlaceholder || !config.isConfigured) {
    const results: StudentPublishedScoreItem[] = [
      { id: "res-1", subjectId: "subj-math", subjectCode: "MATH-101", subjectName: "Core Mathematics", continuousAssessmentScore: 34, examinationScore: 50, totalScore: 84, grade: "A1", remarks: "Excellent" },
      { id: "res-2", subjectId: "subj-sci", subjectCode: "SCI-101", subjectName: "Integrated Science", continuousAssessmentScore: 32, examinationScore: 46, totalScore: 78, grade: "B2", remarks: "Very Good" },
      { id: "res-3", subjectId: "subj-eng", subjectCode: "ENG-101", subjectName: "Core English Language", continuousAssessmentScore: 35, examinationScore: 50, totalScore: 85, grade: "A1", remarks: "Excellent" },
    ];

    return {
      studentName: "Kwame Kyeremateng",
      studentCode: "GES-2026-001",
      className: "Basic 8 - Section A",
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
      publishedCount: 3,
      expectedCount: 4,
      averageScore: 82.3,
      highestScore: 85,
      lowestScore: 78,
      passRate: 100,
      passedSubjectsCount: 3,
      failedSubjectsCount: 0,
      results,
      gradeDistribution: [
        { grade: "A1", count: 2 },
        { grade: "B2", count: 1 },
      ],
      performanceTrends: [
        { termName: "Term 1 (2025/2026)", academicYearName: "2025/2026", averageScore: 76.5 },
        { termName: "Term 2 (2025/2026)", academicYearName: "2025/2026", averageScore: 79.0 },
        { termName: "Term 1 (2026/2027)", academicYearName: "2026/2027", averageScore: 82.3 },
      ],
      subjectHistories: [
        { subjectName: "Core Mathematics", scoresByTerm: [{ termName: "Term 1 (25/26)", score: 78 }, { termName: "Term 1 (26/27)", score: 84 }] },
      ],
      availableAcademicYears: [{ id: "ay-2026", name: "2026/2027 Academic Year" }],
      availableTerms: [{ id: "t-1", name: "Term 1" }],
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

    // Execute independent metadata and result queries concurrently via Promise.all
    const [
      { data: studentRec },
      { data: ayData },
      { data: termsData },
    ] = await Promise.all([
      (supabase.from("students") as any).select("id, student_code").eq("profile_id", user.id).maybeSingle(),
      (supabase.from("academic_years") as any).select("id, name").eq("school_id", schoolId),
      (supabase.from("terms") as any).select("id, name").eq("school_id", schoolId),
    ]);

    if (!studentRec) throw new Error("Student profile record not found.");

    const studentId = studentRec.id;
    const studentCode = studentRec.student_code || "GES-STU";
    const availableAcademicYears = ayData || [{ id: "ay-1", name: "2026/2027 Academic Year" }];
    const availableTerms = termsData || [{ id: "t-1", name: "Term 1" }];

    // Prepare enrollment & results queries
    let enrQuery = (supabase.from("student_enrollments") as any)
      .select("class_id, classes:class_id(name)")
      .eq("student_id", studentId)
      .eq("school_id", schoolId);
    if (filters?.academicYearId) enrQuery = enrQuery.eq("academic_year_id", filters.academicYearId);

    let resQuery = (supabase.from("results") as any)
      .select(`
        id,
        subject_id,
        continuous_assessment_score,
        examination_score,
        total_score,
        grade,
        remarks,
        status,
        subjects:subject_id(code, name)
      `)
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .eq("status", "published");
    if (filters?.academicYearId) resQuery = resQuery.eq("academic_year_id", filters.academicYearId);
    if (filters?.termId) resQuery = resQuery.eq("term_id", filters.termId);

    // Execute enrollment & results in parallel
    const [{ data: enrData }, { data: resData }] = await Promise.all([enrQuery.maybeSingle(), resQuery]);
    const className = enrData?.classes?.name || "Basic Class";
    const rawResults = resData || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: StudentPublishedScoreItem[] = rawResults.map((r: any) => {
      const ca = Number(r.continuous_assessment_score || 0);
      const ex = Number(r.examination_score || 0);
      const tot = Number(r.total_score || ca + ex);
      const { grade, remarks } = calculateGESGrade(tot);

      return {
        id: r.id,
        subjectId: r.subject_id,
        subjectCode: r.subjects?.code || "SUBJ",
        subjectName: r.subjects?.name || "Subject",
        continuousAssessmentScore: ca,
        examinationScore: ex,
        totalScore: tot,
        grade: r.grade || grade,
        remarks: r.remarks || remarks,
      };
    });

    const scores = results.map((r) => r.totalScore);
    const publishedCount = results.length;
    const averageScore = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : null;
    const highestScore = scores.length > 0 ? Math.max(...scores) : null;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : null;
    const passedSubjectsCount = scores.filter((s) => s >= 50).length;
    const failedSubjectsCount = scores.length - passedSubjectsCount;
    const passRate = scores.length > 0 ? Number(((passedSubjectsCount / scores.length) * 100).toFixed(1)) : null;

    const gradeCounts: Record<string, number> = {};
    results.forEach((r) => {
      gradeCounts[r.grade] = (gradeCounts[r.grade] || 0) + 1;
    });

    const gradeDistribution = Object.keys(gradeCounts).map((g) => ({
      grade: g,
      count: gradeCounts[g],
    }));

    return {
      studentName,
      studentCode,
      className,
      academicYearName: availableAcademicYears[0]?.name || "2026/2027 Academic Year",
      termName: availableTerms[0]?.name || "Term 1",
      publishedCount,
      expectedCount: publishedCount,
      averageScore,
      highestScore,
      lowestScore,
      passRate,
      passedSubjectsCount,
      failedSubjectsCount,
      results,
      gradeDistribution,
      performanceTrends: [],
      subjectHistories: [],
      availableAcademicYears,
      availableTerms,
    };
  } catch {
    return {
      studentName: "Student User",
      studentCode: "GES-STU",
      className: "Basic Class",
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
      publishedCount: 0,
      expectedCount: 0,
      averageScore: null,
      highestScore: null,
      lowestScore: null,
      passRate: null,
      passedSubjectsCount: 0,
      failedSubjectsCount: 0,
      results: [],
      gradeDistribution: [],
      performanceTrends: [],
      subjectHistories: [],
      availableAcademicYears: [],
      availableTerms: [],
    };
  }
}

export async function fetchStudentReportCard(
  filters?: StudentResultFilter
): Promise<StudentReportCard> {
  const config = getSupabaseEnvConfig();
  const nowStr = new Date().toLocaleDateString();

  if (config.isPlaceholder || !config.isConfigured) {
    return {
      schoolName: "Achimota Basic School",
      schoolCode: "ABS-2026",
      schoolAddress: "P.O. Box AH 80, Achimota, Accra, Ghana",
      schoolContact: "Tel: +233 (0) 302 400 100 • Email: info@achimota.edu.gh",
      studentName: "Kwame Kyeremateng",
      studentCode: "GES-2026-001",
      studentId: "GES-2026-001",
      className: "Basic 8 - Section A",
      academicYear: "2026/2027 Academic Year",
      term: "Term 1",
      totalStudentsInClass: 35,
      overallAverage: 82.3,
      totalMarksObtained: 247,
      totalMarksPossible: 300,
      overallGrade: "A1",
      overallStatus: "Passed",
      attendanceRate: 97.4,
      attendanceDaysPresent: 36,
      attendanceDaysTotal: 38,
      attendanceDaysAbsent: 1,
      attendanceDaysLate: 1,
      attendanceDaysExcused: 0,
      classTeacherComment: "Kwame is an outstanding student with consistent high performance.",
      teacherRemarks: "Kwame is an outstanding student with consistent high performance.",
      principalComment: "Excellent academic result. Promoted to maintain highest academic standards.",
      principalRemarks: "Excellent academic result. Promoted to maintain highest academic standards.",
      vacationDate: "18 Dec 2026",
      reopeningDate: "12 Jan 2027",
      isComplete: true,
      generatedAt: nowStr,
      subjects: [
        { code: "MATH-101", name: "Core Mathematics", classScore: 20, projectScore: 14, examScore: 50, totalScore: 84, grade: "A1", remarks: "Excellent" },
        { code: "SCI-101", name: "Integrated Science", classScore: 18, projectScore: 14, examScore: 46, totalScore: 78, grade: "B2", remarks: "Very Good" },
        { code: "ENG-101", name: "Core English Language", classScore: 20, projectScore: 15, examScore: 50, totalScore: 85, grade: "A1", remarks: "Excellent" },
      ],
    };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("first_name, last_name, role, school_id, schools:school_id(name, code, address, phone, email)")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "student") throw new Error("UNAUTHORIZED");

    const schoolId = profile.school_id;
    const schoolName = profile.schools?.name || "Achimota Basic School";
    const schoolCode = profile.schools?.code || "ABS-2026";
    const schoolAddress = profile.schools?.address || "P.O. Box AH 80, Achimota, Accra";
    const schoolContact = `Tel: ${profile.schools?.phone || "+233 302 400 100"} • Email: ${profile.schools?.email || "info@school.edu.gh"}`;

    const studentName = `${profile.first_name || "Student"} ${profile.last_name || ""}`.trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: studentRec } = await (supabase.from("students") as any)
      .select("id, student_code")
      .eq("profile_id", user.id)
      .maybeSingle();

    const studentId = studentRec?.id;
    const studentCode = studentRec?.student_code || "GES-STU";

    // Query active enrollment for selected period
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let enrQuery = (supabase.from("student_enrollments") as any)
      .select("class_id, classes:class_id(name)")
      .eq("student_id", studentId)
      .eq("school_id", schoolId);

    if (filters?.academicYearId) enrQuery = enrQuery.eq("academic_year_id", filters.academicYearId);
    const { data: enrData } = await enrQuery.maybeSingle();
    const className = enrData?.classes?.name || "Basic Class";

    // Query settings for academic year and term
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: settings } = await (supabase.from("school_settings") as any)
      .select("current_academic_year_id, current_term_id, academic_years:current_academic_year_id(name), terms:current_term_id(name)")
      .eq("school_id", schoolId)
      .maybeSingle();

    const academicYear = settings?.academic_years?.name || "2026/2027 Academic Year";
    const term = settings?.terms?.name || "Term 1";

    // Query ONLY published results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resQuery = (supabase.from("results") as any)
      .select("id, subject_id, continuous_assessment_score, examination_score, total_score, grade, remarks, status, teacher_remark, subjects:subject_id(code, name)")
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .eq("status", "published");

    if (filters?.academicYearId) resQuery = resQuery.eq("academic_year_id", filters.academicYearId);
    if (filters?.termId) resQuery = resQuery.eq("term_id", filters.termId);

    const { data: resData } = await resQuery;
    const rawResults = resData || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subjects: ReportSubjectItem[] = rawResults.map((r: any) => {
      const ca = Number(r.continuous_assessment_score || 0);
      const ex = Number(r.examination_score || 0);
      const tot = Number(r.total_score || ca + ex);
      const { grade, remarks } = calculateGESGrade(tot);

      return {
        code: r.subjects?.code || "SUBJ",
        name: r.subjects?.name || "Subject",
        classScore: Math.round(ca * 0.6),
        projectScore: Math.round(ca * 0.4),
        examScore: ex,
        totalScore: tot,
        grade: r.grade || grade,
        remarks: r.remarks || remarks,
      };
    });

    const scores = subjects.map((s) => s.totalScore);
    const totObtained = scores.reduce((a, b) => a + b, 0);
    const totPossible = subjects.length * 100;
    const overallAverage = subjects.length > 0 ? Number((totObtained / subjects.length).toFixed(1)) : 0;
    const { grade: overallGrade } = calculateGESGrade(overallAverage);

    // Attendance records
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attData } = await (supabase.from("attendance") as any)
      .select("status")
      .eq("student_id", studentId)
      .eq("school_id", schoolId);

    const attRecords = attData || [];
    const attTotal = attRecords.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attPresent = attRecords.filter((a: any) => a.status === "present").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attLate = attRecords.filter((a: any) => a.status === "late").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attAbsent = attRecords.filter((a: any) => a.status === "absent").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attExcused = attRecords.filter((a: any) => a.status === "excused").length;
    const attendanceRate = attTotal > 0 ? Number((((attPresent + attLate) / attTotal) * 100).toFixed(1)) : 0;

    return {
      schoolName,
      schoolCode,
      schoolAddress,
      schoolContact,
      studentName,
      studentCode,
      studentId: studentCode,
      className,
      academicYear,
      term,
      totalStudentsInClass: 35,
      overallAverage,
      totalMarksObtained: totObtained,
      totalMarksPossible: totPossible,
      overallGrade,
      overallStatus: overallAverage >= 50 ? "Passed" : "Academic Attention Required",
      attendanceRate,
      attendanceDaysPresent: attPresent,
      attendanceDaysTotal: attTotal,
      attendanceDaysAbsent: attAbsent,
      attendanceDaysLate: attLate,
      attendanceDaysExcused: attExcused,
      classTeacherComment: rawResults[0]?.teacher_remark || "Satisfactory academic performance and steady progress.",
      teacherRemarks: rawResults[0]?.teacher_remark || "Satisfactory academic performance and steady progress.",
      principalComment: "Approved official report sheet. Keep up the high effort.",
      principalRemarks: "Approved official report sheet. Keep up the high effort.",
      vacationDate: "18 Dec 2026",
      reopeningDate: "12 Jan 2027",
      subjects,
      isComplete: subjects.length > 0,
      generatedAt: nowStr,
    };
  } catch {
    return {
      schoolName: "Achimota Basic School",
      schoolCode: "ABS-2026",
      schoolAddress: "P.O. Box AH 80, Achimota, Accra, Ghana",
      schoolContact: "Tel: +233 302 400 100 • Email: info@achimota.edu.gh",
      studentName: "Student User",
      studentCode: "GES-STU",
      studentId: "GES-STU",
      className: "Basic Class",
      academicYear: "2026/2027 Academic Year",
      term: "Term 1",
      totalStudentsInClass: 35,
      overallAverage: 0,
      totalMarksObtained: 0,
      totalMarksPossible: 0,
      overallGrade: "F9",
      overallStatus: "Academic Attention Required",
      attendanceRate: 0,
      attendanceDaysPresent: 0,
      attendanceDaysTotal: 0,
      attendanceDaysAbsent: 0,
      attendanceDaysLate: 0,
      attendanceDaysExcused: 0,
      classTeacherComment: "No published results recorded yet.",
      teacherRemarks: "No published results recorded yet.",
      principalComment: "Pending terminal results publication.",
      principalRemarks: "Pending terminal results publication.",
      vacationDate: "18 Dec 2026",
      reopeningDate: "12 Jan 2027",
      subjects: [],
      isComplete: false,
      generatedAt: nowStr,
    };
  }
}
