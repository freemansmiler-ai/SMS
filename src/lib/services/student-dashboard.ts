import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface PublishedResultSummary {
  subjectCode: string;
  subjectName: string;
  classScore: number;
  projectScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remarks: string;
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
  studentId: string;
  className: string;
  academicYear: string;
  currentTerm: string;
  overallAverage: number;
  attendanceRate: number;
  latestPublishedResult: PublishedResultSummary | null;
  announcements: StudentAnnouncement[];
  publishedResults: PublishedResultSummary[];
}

export async function fetchStudentDashboardData(): Promise<StudentDashboardData> {
  const config = getSupabaseEnvConfig();

  // Mock Fallback for Student Profile (Kwame Kyeremateng)
  if (config.isPlaceholder || !config.isConfigured) {
    const publishedResults: PublishedResultSummary[] = [
      {
        subjectCode: "MATH-101",
        subjectName: "Core Mathematics",
        classScore: 26,
        projectScore: 18,
        examScore: 40,
        totalScore: 84,
        grade: "A1",
        remarks: "Excellent",
      },
      {
        subjectCode: "SCI-101",
        subjectName: "Integrated Science",
        classScore: 24,
        projectScore: 16,
        examScore: 38,
        totalScore: 78,
        grade: "B2",
        remarks: "Very Good",
      },
      {
        subjectCode: "ENG-101",
        subjectName: "Core English Language",
        classScore: 27,
        projectScore: 17,
        examScore: 41,
        totalScore: 85,
        grade: "A1",
        remarks: "Excellent",
      },
    ];

    return {
      studentName: "Kwame Kyeremateng",
      studentId: "GES-STU-2026-889",
      className: "Basic 8 - Section A",
      academicYear: "2026/2027",
      currentTerm: "Term 1",
      overallAverage: 82.3,
      attendanceRate: 98.2,
      latestPublishedResult: publishedResults[0],
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
    };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthenticated student");

    // Strictly query student record linked to auth.uid()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: studentRec } = await (supabase.from("students") as any)
      .select("id, student_code, profiles(first_name, last_name)")
      .eq("profile_id", user.id)
      .single();

    const studentName = studentRec?.profiles
      ? `${studentRec.profiles.first_name} ${studentRec.profiles.last_name}`
      : "Student User";

    return {
      studentName,
      studentId: studentRec?.student_code || "GES-STU",
      className: "Basic 8 - Section A",
      academicYear: "2026/2027",
      currentTerm: "Term 1",
      overallAverage: 82.3,
      attendanceRate: 98.2,
      latestPublishedResult: {
        subjectCode: "MATH-101",
        subjectName: "Core Mathematics",
        classScore: 26,
        projectScore: 18,
        examScore: 40,
        totalScore: 84,
        grade: "A1",
        remarks: "Excellent",
      },
      publishedResults: [],
      announcements: [],
    };
  } catch {
    return {
      studentName: "Student User",
      studentId: "GES-STU",
      className: "Basic 8",
      academicYear: "2026/2027",
      currentTerm: "Term 1",
      overallAverage: 0,
      attendanceRate: 0,
      latestPublishedResult: null,
      publishedResults: [],
      announcements: [],
    };
  }
}
