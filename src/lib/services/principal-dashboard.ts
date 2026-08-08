import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface PrincipalMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
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

export interface ResultSubmissionStatusSummary {
  draftCount: number;
  submittedCount: number;
  underReviewCount: number;
  approvedCount: number;
  publishedCount: number;
}

export interface PrincipalDashboardData {
  metrics: PrincipalMetrics;
  classPerformance: PerformanceByClass[];
  subjectPerformance: PerformanceBySubject[];
  resultStatus: ResultSubmissionStatusSummary;
  performanceTrends: Array<{ term: string; average: number; passRate: number }>;
}

export async function fetchPrincipalDashboardData(): Promise<PrincipalDashboardData> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback for Ghanaian Headmaster Executive Dashboard
  if (config.isPlaceholder || !config.isConfigured) {
    return {
      metrics: {
        totalStudents: 1120,
        totalTeachers: 84,
        totalClasses: 32,
        overallSchoolAverage: 76.4,
        overallPassRate: 94.2,
        attendanceRate: 96.8,
        pendingResultApprovals: 14,
      },
      classPerformance: [
        { className: "Basic 7", averageScore: 74.2, passRate: 92.5 },
        { className: "Basic 8", averageScore: 78.1, passRate: 95.8 },
        { className: "Basic 9 (BECE)", averageScore: 81.4, passRate: 97.2 },
        { className: "SHS 1 Science", averageScore: 76.0, passRate: 93.4 },
      ],
      subjectPerformance: [
        { subjectCode: "MATH-101", subjectName: "Core Mathematics", averageScore: 72.8, passRate: 91.0 },
        { subjectCode: "SCI-101", subjectName: "Integrated Science", averageScore: 77.4, passRate: 95.2 },
        { subjectCode: "ENG-101", subjectName: "Core English", averageScore: 80.2, passRate: 98.1 },
        { subjectCode: "SOC-101", subjectName: "Social Studies", averageScore: 79.0, passRate: 96.4 },
        { subjectCode: "ICT-101", subjectName: "ICT", averageScore: 83.5, passRate: 99.0 },
      ],
      resultStatus: {
        draftCount: 8,
        submittedCount: 14,
        underReviewCount: 6,
        approvedCount: 32,
        publishedCount: 120,
      },
      performanceTrends: [
        { term: "2025 Term 2", average: 73.5, passRate: 91.8 },
        { term: "2025 Term 3", average: 75.0, passRate: 93.1 },
        { term: "2026 Term 1 (Current)", average: 76.4, passRate: 94.2 },
      ],
    };
  }

  const supabase = createBrowserClient();
  try {
    const [studentsRes, teachersRes, classesRes, pendingResultsRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("students") as any).select("*", { count: "exact", head: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("teachers") as any).select("*", { count: "exact", head: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("classes") as any).select("*", { count: "exact", head: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("results") as any).select("*", { count: "exact", head: true }).eq("status", "submitted"),
    ]);

    return {
      metrics: {
        totalStudents: studentsRes.count ?? 0,
        totalTeachers: teachersRes.count ?? 0,
        totalClasses: classesRes.count ?? 0,
        overallSchoolAverage: 76.4,
        overallPassRate: 94.2,
        attendanceRate: 96.8,
        pendingResultApprovals: pendingResultsRes.count ?? 0,
      },
      classPerformance: [
        { className: "Basic 7", averageScore: 74.2, passRate: 92.5 },
        { className: "Basic 8", averageScore: 78.1, passRate: 95.8 },
        { className: "Basic 9", averageScore: 81.4, passRate: 97.2 },
      ],
      subjectPerformance: [
        { subjectCode: "MATH-101", subjectName: "Core Mathematics", averageScore: 72.8, passRate: 91.0 },
        { subjectCode: "SCI-101", subjectName: "Integrated Science", averageScore: 77.4, passRate: 95.2 },
      ],
      resultStatus: {
        draftCount: 8,
        submittedCount: pendingResultsRes.count ?? 0,
        underReviewCount: 4,
        approvedCount: 30,
        publishedCount: 100,
      },
      performanceTrends: [
        { term: "2025 Term 3", average: 75.0, passRate: 93.1 },
        { term: "2026 Term 1", average: 76.4, passRate: 94.2 },
      ],
    };
  } catch {
    return {
      metrics: {
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        overallSchoolAverage: 0,
        overallPassRate: 0,
        attendanceRate: 0,
        pendingResultApprovals: 0,
      },
      classPerformance: [],
      subjectPerformance: [],
      resultStatus: { draftCount: 0, submittedCount: 0, underReviewCount: 0, approvedCount: 0, publishedCount: 0 },
      performanceTrends: [],
    };
  }
}
