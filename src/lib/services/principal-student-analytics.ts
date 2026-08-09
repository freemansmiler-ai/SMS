import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { calculateGESGrade } from "@/lib/services/teacher-results";

export interface StudentAnalyticsFilter {
  academicYearId?: string;
  termId?: string;
  classId?: string;
  subjectId?: string;
}

export interface OverallPerformanceMetrics {
  totalStudentsWithResults: number;
  overallAverageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  passedCount: number;
  failedCount: number;
}

export interface ClassPerformanceStat {
  classId: string;
  className: string;
  gradeLevel: string;
  enrolledStudents: number;
  studentsWithResults: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}

export interface SubjectPerformanceStat {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  studentsWithResults: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  statusCategory: "Strong" | "Average" | "Requires Attention";
}

export interface GradeDistributionItem {
  grade: string;
  label: string;
  count: number;
  percentage: number;
}

export interface StudentPerformanceRank {
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  averageScore: number;
  totalSubjects: number;
  passedSubjects: number;
  failedSubjects: number;
  status: "Passed" | "Academic Attention Required";
}

export interface MissingResultItem {
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  missingSubjectName: string;
}

export interface StudentAnalyticsOverview {
  metrics: OverallPerformanceMetrics;
  classPerformance: ClassPerformanceStat[];
  subjectPerformance: SubjectPerformanceStat[];
  gradeDistribution: GradeDistributionItem[];
  topPerformers: StudentPerformanceRank[];
  studentsRequiringAttention: StudentPerformanceRank[];
  missingResults: MissingResultItem[];
  academicYearName: string;
  termName: string;
}

export async function fetchPrincipalStudentAnalytics(
  filters?: StudentAnalyticsFilter
): Promise<StudentAnalyticsOverview> {
  const config = getSupabaseEnvConfig();

  // Mock Fallback for Executive Analytics
  if (config.isPlaceholder || !config.isConfigured) {
    return {
      metrics: {
        totalStudentsWithResults: 142,
        overallAverageScore: 76.4,
        highestScore: 94.0,
        lowestScore: 42.0,
        passRate: 94.4,
        passedCount: 134,
        failedCount: 8,
      },
      classPerformance: [
        { classId: "class-basic7a", className: "Basic 7 - Section A", gradeLevel: "Basic 7", enrolledStudents: 35, studentsWithResults: 35, averageScore: 74.2, highestScore: 91.0, lowestScore: 45.0, passRate: 92.5 },
        { classId: "class-basic8a", className: "Basic 8 - Section A", gradeLevel: "Basic 8", enrolledStudents: 38, studentsWithResults: 38, averageScore: 78.1, highestScore: 94.0, lowestScore: 48.0, passRate: 95.8 },
        { classId: "class-basic9b", className: "Basic 9 - Section B", gradeLevel: "Basic 9", enrolledStudents: 35, studentsWithResults: 35, averageScore: 81.4, highestScore: 96.0, lowestScore: 52.0, passRate: 97.2 },
      ],
      subjectPerformance: [
        { subjectId: "subj-math101", subjectCode: "MATH-101", subjectName: "Core Mathematics", studentsWithResults: 142, averageScore: 72.8, highestScore: 94.0, lowestScore: 42.0, passRate: 91.0, statusCategory: "Average" },
        { subjectId: "subj-sci101", subjectCode: "SCI-101", subjectName: "Integrated Science", studentsWithResults: 142, averageScore: 77.4, highestScore: 95.0, lowestScore: 46.0, passRate: 95.2, statusCategory: "Strong" },
        { subjectId: "subj-eng101", subjectCode: "ENG-101", subjectName: "Core English", studentsWithResults: 142, averageScore: 80.2, highestScore: 96.0, lowestScore: 50.0, passRate: 98.1, statusCategory: "Strong" },
        { subjectId: "subj-ict101", subjectCode: "ICT-101", subjectName: "ICT", studentsWithResults: 142, averageScore: 83.5, highestScore: 98.0, lowestScore: 55.0, passRate: 99.0, statusCategory: "Strong" },
      ],
      gradeDistribution: [
        { grade: "A1", label: "80-100%", count: 48, percentage: 33.8 },
        { grade: "B2", label: "75-79%", count: 32, percentage: 22.5 },
        { grade: "B3", label: "70-74%", count: 26, percentage: 18.3 },
        { grade: "C4", label: "65-69%", count: 16, percentage: 11.3 },
        { grade: "C5", label: "60-64%", count: 8, percentage: 5.6 },
        { grade: "C6", label: "55-59%", count: 4, percentage: 2.8 },
        { grade: "D7", label: "50-54%", count: 0, percentage: 0 },
        { grade: "E8", label: "45-49%", count: 4, percentage: 2.8 },
        { grade: "F9", label: "0-44%", count: 4, percentage: 2.8 },
      ],
      topPerformers: [
        { studentId: "stu-101", studentCode: "GES-2026-001", studentName: "Kwame Kyeremateng", className: "Basic 8 - Section A", averageScore: 91.2, totalSubjects: 4, passedSubjects: 4, failedSubjects: 0, status: "Passed" },
        { studentId: "stu-104", studentCode: "GES-2026-004", studentName: "Esi Boateng", className: "Basic 9 - Section B", averageScore: 88.5, totalSubjects: 4, passedSubjects: 4, failedSubjects: 0, status: "Passed" },
        { studentId: "stu-102", studentCode: "GES-2026-002", studentName: "Akosua Mensah", className: "Basic 8 - Section A", averageScore: 84.0, totalSubjects: 4, passedSubjects: 4, failedSubjects: 0, status: "Passed" },
      ],
      studentsRequiringAttention: [
        { studentId: "stu-103", studentCode: "GES-2026-003", studentName: "Kofi Acheampong Jr.", className: "Basic 8 - Section A", averageScore: 43.5, totalSubjects: 4, passedSubjects: 2, failedSubjects: 2, status: "Academic Attention Required" },
      ],
      missingResults: [],
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
    };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "principal") {
      throw new Error("UNAUTHORIZED: Principal access required.");
    }

    const schoolId = profile.school_id;

    // Fetch school settings for academic year and term
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: settings } = await (supabase.from("school_settings") as any)
      .select("current_academic_year_id, current_term_id, academic_years:current_academic_year_id(name), terms:current_term_id(name)")
      .eq("school_id", schoolId)
      .maybeSingle();

    const academicYearName = settings?.academic_years?.name || "2026/2027 Academic Year";
    const termName = settings?.terms?.name || "Term 1";

    // Query published and approved results strictly for school_id
    // Excludes draft and returned results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resultsQuery = (supabase.from("results") as any)
      .select(`
        id,
        student_id,
        subject_id,
        class_id,
        academic_year_id,
        term_id,
        continuous_assessment_score,
        examination_score,
        total_score,
        grade,
        remarks,
        status,
        students:student_id (
          student_code,
          profiles:profile_id (first_name, last_name)
        ),
        subjects:subject_id (code, name),
        classes:class_id (name, grade_level, capacity)
      `)
      .eq("school_id", schoolId)
      .in("status", ["published", "approved"]);

    if (filters?.classId && filters.classId !== "all") resultsQuery = resultsQuery.eq("class_id", filters.classId);
    if (filters?.subjectId && filters.subjectId !== "all") resultsQuery = resultsQuery.eq("subject_id", filters.subjectId);
    if (filters?.academicYearId) resultsQuery = resultsQuery.eq("academic_year_id", filters.academicYearId);
    if (filters?.termId) resultsQuery = resultsQuery.eq("term_id", filters.termId);

    const { data: resultsData } = await resultsQuery;
    const records = resultsData || [];

    if (records.length === 0) {
      return {
        metrics: { totalStudentsWithResults: 0, overallAverageScore: 0, highestScore: 0, lowestScore: 0, passRate: 0, passedCount: 0, failedCount: 0 },
        classPerformance: [],
        subjectPerformance: [],
        gradeDistribution: [],
        topPerformers: [],
        studentsRequiringAttention: [],
        missingResults: [],
        academicYearName,
        termName,
      };
    }

    const scores: number[] = records.map((r: any) => Number(r.total_score || (Number(r.continuous_assessment_score || 0) + Number(r.examination_score || 0))));
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const sumScore = scores.reduce((acc: number, s: number) => acc + s, 0);
    const overallAverageScore = Number((sumScore / scores.length).toFixed(1));
    const passedCount = scores.filter((s: number) => s >= 50).length;
    const failedCount = scores.length - passedCount;
    const passRate = Number(((passedCount / scores.length) * 100).toFixed(1));

    // Grade distribution map
    const gradeMap: Record<string, number> = { A1: 0, B2: 0, B3: 0, C4: 0, C5: 0, C6: 0, D7: 0, E8: 0, F9: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records.forEach((r: any) => {
      const tot = Number(r.total_score || (Number(r.continuous_assessment_score || 0) + Number(r.examination_score || 0)));
      const { grade } = calculateGESGrade(tot);
      const g = r.grade || grade;
      if (gradeMap[g] !== undefined) gradeMap[g]++;
      else gradeMap.F9++;
    });

    const gradeLabels: Record<string, string> = {
      A1: "80-100%", B2: "75-79%", B3: "70-74%", C4: "65-69%", C5: "60-64%", C6: "55-59%", D7: "50-54%", E8: "45-49%", F9: "0-44%"
    };

    const gradeDistribution: GradeDistributionItem[] = Object.keys(gradeMap).map((g) => ({
      grade: g,
      label: gradeLabels[g] || "",
      count: gradeMap[g],
      percentage: Number(((gradeMap[g] / records.length) * 100).toFixed(1)),
    }));

    // Grouping by Class
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classGroupMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records.forEach((r: any) => {
      const cid = r.class_id;
      if (!classGroupMap.has(cid)) {
        classGroupMap.set(cid, {
          classId: cid,
          className: r.classes?.name || "Class",
          gradeLevel: r.classes?.grade_level || "Basic",
          scores: [],
        });
      }
      const tot = Number(r.total_score || (Number(r.continuous_assessment_score || 0) + Number(r.examination_score || 0)));
      classGroupMap.get(cid).scores.push(tot);
    });

    const classPerformance: ClassPerformanceStat[] = Array.from(classGroupMap.values()).map((cg) => {
      const cScores: number[] = cg.scores;
      const cMax = Math.max(...cScores);
      const cMin = Math.min(...cScores);
      const cAvg = Number((cScores.reduce((a: number, b: number) => a + b, 0) / cScores.length).toFixed(1));
      const cPass = cScores.filter((s: number) => s >= 50).length;
      const cRate = Number(((cPass / cScores.length) * 100).toFixed(1));

      return {
        classId: cg.classId,
        className: cg.className,
        gradeLevel: cg.gradeLevel,
        enrolledStudents: cScores.length,
        studentsWithResults: cScores.length,
        averageScore: cAvg,
        highestScore: cMax,
        lowestScore: cMin,
        passRate: cRate,
      };
    });

    // Grouping by Subject
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subjectGroupMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records.forEach((r: any) => {
      const sid = r.subject_id;
      if (!subjectGroupMap.has(sid)) {
        subjectGroupMap.set(sid, {
          subjectId: sid,
          subjectCode: r.subjects?.code || "SUBJ",
          subjectName: r.subjects?.name || "Subject",
          scores: [],
        });
      }
      const tot = Number(r.total_score || (Number(r.continuous_assessment_score || 0) + Number(r.examination_score || 0)));
      subjectGroupMap.get(sid).scores.push(tot);
    });

    const subjectPerformance: SubjectPerformanceStat[] = Array.from(subjectGroupMap.values()).map((sg) => {
      const sScores: number[] = sg.scores;
      const sMax = Math.max(...sScores);
      const sMin = Math.min(...sScores);
      const sAvg = Number((sScores.reduce((a: number, b: number) => a + b, 0) / sScores.length).toFixed(1));
      const sPass = sScores.filter((s: number) => s >= 50).length;
      const sRate = Number(((sPass / sScores.length) * 100).toFixed(1));

      let cat: "Strong" | "Average" | "Requires Attention" = "Average";
      if (sAvg >= 75) cat = "Strong";
      else if (sAvg < 60) cat = "Requires Attention";

      return {
        subjectId: sg.subjectId,
        subjectCode: sg.subjectCode,
        subjectName: sg.subjectName,
        studentsWithResults: sScores.length,
        averageScore: sAvg,
        highestScore: sMax,
        lowestScore: sMin,
        passRate: sRate,
        statusCategory: cat,
      };
    });

    // Grouping by Student to rank Top Performers & Students Requiring Attention
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studentMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records.forEach((r: any) => {
      const stid = r.student_id;
      if (!studentMap.has(stid)) {
        const sProf = r.students?.profiles;
        const name = sProf ? `${sProf.first_name} ${sProf.last_name}` : "Student";
        studentMap.set(stid, {
          studentId: stid,
          studentCode: r.students?.student_code || "GES-STU",
          studentName: name,
          className: r.classes?.name || "Class",
          scores: [],
        });
      }
      const tot = Number(r.total_score || (Number(r.continuous_assessment_score || 0) + Number(r.examination_score || 0)));
      studentMap.get(stid).scores.push(tot);
    });

    const studentRankings: StudentPerformanceRank[] = Array.from(studentMap.values()).map((st) => {
      const stScores: number[] = st.scores;
      const avg = Number((stScores.reduce((a: number, b: number) => a + b, 0) / stScores.length).toFixed(1));
      const passed = stScores.filter((s: number) => s >= 50).length;
      const failed = stScores.length - passed;
      const status: "Passed" | "Academic Attention Required" = avg >= 50 && failed === 0 ? "Passed" : "Academic Attention Required";

      return {
        studentId: st.studentId,
        studentCode: st.studentCode,
        studentName: st.studentName,
        className: st.className,
        averageScore: avg,
        totalSubjects: stScores.length,
        passedSubjects: passed,
        failedSubjects: failed,
        status,
      };
    });

    studentRankings.sort((a, b) => b.averageScore - a.averageScore);
    const topPerformers = studentRankings.filter((s) => s.averageScore >= 75).slice(0, 5);
    const studentsRequiringAttention = studentRankings.filter((s) => s.averageScore < 50 || s.failedSubjects > 0);

    return {
      metrics: {
        totalStudentsWithResults: studentRankings.length,
        overallAverageScore,
        highestScore,
        lowestScore,
        passRate,
        passedCount,
        failedCount,
      },
      classPerformance,
      subjectPerformance,
      gradeDistribution,
      topPerformers: topPerformers.length > 0 ? topPerformers : studentRankings.slice(0, 3),
      studentsRequiringAttention,
      missingResults: [],
      academicYearName,
      termName,
    };
  } catch {
    return {
      metrics: { totalStudentsWithResults: 0, overallAverageScore: 0, highestScore: 0, lowestScore: 0, passRate: 0, passedCount: 0, failedCount: 0 },
      classPerformance: [],
      subjectPerformance: [],
      gradeDistribution: [],
      topPerformers: [],
      studentsRequiringAttention: [],
      missingResults: [],
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
    };
  }
}
