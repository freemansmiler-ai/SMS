import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export type ResultStatus = "draft" | "submitted" | "under_review" | "approved" | "published" | "returned";

export interface ResultEntry {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  termId: string;
  termName: string;
  academicYear: string;
  classScore: number;   // Max 30 (Continuous Assessment / Class Tests)
  projectScore: number; // Max 20 (Project Work Assessment)
  examScore: number;    // Max 50 (End of Term Examination)
  totalScore: number;   // Max 100 (classScore + projectScore + examScore)
  grade: string;        // A1, B2, B3, C4, C5, C6, D7, E8, F9
  remarks: string;
  status: ResultStatus;
}

export function calculateGESGrade(total: number): { grade: string; remarks: string } {
  if (total >= 80) return { grade: "A1", remarks: "Excellent" };
  if (total >= 75) return { grade: "B2", remarks: "Very Good" };
  if (total >= 70) return { grade: "B3", remarks: "Good" };
  if (total >= 65) return { grade: "C4", remarks: "Credit" };
  if (total >= 60) return { grade: "C5", remarks: "Credit" };
  if (total >= 55) return { grade: "C6", remarks: "Credit" };
  if (total >= 50) return { grade: "D7", remarks: "Pass" };
  if (total >= 45) return { grade: "E8", remarks: "Pass" };
  return { grade: "F9", remarks: "Fail" };
}

export async function fetchTeacherResults(filters?: { subjectId?: string; classId?: string }): Promise<ResultEntry[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback for GES Gradebook
  if (config.isPlaceholder || !config.isConfigured) {
    const mockResults: ResultEntry[] = [
      {
        id: "res-101",
        studentId: "stu-101",
        studentName: "Kwame Kyeremateng",
        studentCode: "GES-2026-001",
        subjectId: "subj-math101",
        subjectName: "Core Mathematics",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        termId: "term-1",
        termName: "Term 1",
        academicYear: "2026/2027",
        classScore: 26,
        projectScore: 18,
        examScore: 40,
        totalScore: 84,
        grade: "A1",
        remarks: "Excellent",
        status: "draft",
      },
      {
        id: "res-102",
        studentId: "stu-102",
        studentName: "Akosua Mensah",
        studentCode: "GES-2026-002",
        subjectId: "subj-math101",
        subjectName: "Core Mathematics",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        termId: "term-1",
        termName: "Term 1",
        academicYear: "2026/2027",
        classScore: 22,
        projectScore: 15,
        examScore: 34,
        totalScore: 71,
        grade: "B3",
        remarks: "Good",
        status: "draft",
      },
      {
        id: "res-103",
        studentId: "stu-104",
        studentName: "Esi Boateng",
        studentCode: "GES-2026-004",
        subjectId: "subj-sci101",
        subjectName: "Integrated Science",
        classId: "class-basic9b",
        className: "Basic 9 - Section B",
        termId: "term-1",
        termName: "Term 1",
        academicYear: "2026/2027",
        classScore: 24,
        projectScore: 16,
        examScore: 36,
        totalScore: 76,
        grade: "B2",
        remarks: "Very Good",
        status: "submitted",
      },
    ];

    let filtered = mockResults;
    if (filters?.subjectId && filters.subjectId !== "all") {
      filtered = filtered.filter((r) => r.subjectId === filters.subjectId);
    }
    if (filters?.classId && filters.classId !== "all") {
      filtered = filtered.filter((r) => r.classId === filters.classId);
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("results") as any)
      .select(`
        id,
        student_id,
        subject_id,
        class_id,
        term_id,
        class_score,
        project_score,
        exam_score,
        total_score,
        grade,
        remarks,
        status,
        students:student_id (
          student_code,
          profiles:profile_id (first_name, last_name)
        ),
        subjects:subject_id (name),
        classes:class_id (name)
      `);

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((r: any) => ({
      id: r.id,
      studentId: r.student_id,
      studentName: r.students?.profiles
        ? `${r.students.profiles.first_name} ${r.students.profiles.last_name}`
        : "Student",
      studentCode: r.students?.student_code || "GES-STU",
      subjectId: r.subject_id,
      subjectName: r.subjects?.name || "Subject",
      classId: r.class_id,
      className: r.classes?.name || "Basic Class",
      termId: r.term_id,
      termName: "Term 1",
      academicYear: "2026/2027",
      classScore: Number(r.class_score || 0),
      projectScore: Number(r.project_score || 0),
      examScore: Number(r.exam_score || 0),
      totalScore: Number(r.total_score || 0),
      grade: r.grade || "F9",
      remarks: r.remarks || "Pending",
      status: r.status || "draft",
    }));
  } catch {
    return [];
  }
}

export async function saveResultDraft(entry: Partial<ResultEntry>): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // Score range validation: Class (0-30), Project (0-20), Exam (0-50)
    if ((entry.classScore ?? 0) < 0 || (entry.classScore ?? 0) > 30) {
      return { success: false, error: "Continuous Assessment Class Score must be between 0 and 30." };
    }
    if ((entry.projectScore ?? 0) < 0 || (entry.projectScore ?? 0) > 20) {
      return { success: false, error: "Project Work Score must be between 0 and 20." };
    }
    if ((entry.examScore ?? 0) < 0 || (entry.examScore ?? 0) > 50) {
      return { success: false, error: "End of Term Exam Score must be between 0 and 50." };
    }

    const totalScore = (entry.classScore || 0) + (entry.projectScore || 0) + (entry.examScore || 0);
    const { grade, remarks } = calculateGESGrade(totalScore);

    // Upsert into Supabase `results` table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("results") as any).upsert({
      id: entry.id && !entry.id.startsWith("res-") ? entry.id : undefined,
      student_id: entry.studentId,
      subject_id: entry.subjectId,
      class_id: entry.classId,
      term_id: entry.termId,
      class_score: entry.classScore,
      project_score: entry.projectScore,
      exam_score: entry.examScore,
      total_score: totalScore,
      grade,
      remarks,
      status: "draft",
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Save draft failed";
    return { success: false, error: msg };
  }
}

export async function submitResultBatch(subjectId: string, classId: string): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("results") as any)
      .update({ status: "submitted" })
      .eq("subject_id", subjectId)
      .eq("class_id", classId)
      .in("status", ["draft", "returned"]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Batch submission failed";
    return { success: false, error: msg };
  }
}
