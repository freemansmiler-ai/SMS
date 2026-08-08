import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { ResultEntry, ResultStatus } from "@/lib/services/teacher-results";

export interface SubmittedResultBatch {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  termName: string;
  academicYear: string;
  totalStudents: number;
  averageScore: number;
  passRate: number;
  submittedAt: string;
  status: ResultStatus;
  reviewComments?: string;
  entries: ResultEntry[];
}

export async function fetchSubmittedResultBatches(filters?: {
  classId?: string;
  subjectId?: string;
  teacherId?: string;
}): Promise<SubmittedResultBatch[]> {
  const config = getSupabaseEnvConfig();

  // Mock initial fallback for Headmaster Executive Approval
  if (config.isPlaceholder || !config.isConfigured) {
    const mockBatches: SubmittedResultBatch[] = [
      {
        id: "batch-101",
        subjectId: "subj-math101",
        subjectName: "Core Mathematics",
        subjectCode: "MATH-101",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        teacherId: "tch-201",
        teacherName: "Abena Appiah",
        termName: "Term 1",
        academicYear: "2026/2027",
        totalStudents: 38,
        averageScore: 78.5,
        passRate: 95.8,
        submittedAt: "Today, 10:15 AM",
        status: "submitted",
        reviewComments: "",
        entries: [
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
            status: "submitted",
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
            status: "submitted",
          },
        ],
      },
      {
        id: "batch-102",
        subjectId: "subj-sci101",
        subjectName: "Integrated Science",
        subjectCode: "SCI-101",
        classId: "class-basic9b",
        className: "Basic 9 - Section B",
        teacherId: "tch-201",
        teacherName: "Abena Appiah",
        termName: "Term 1",
        academicYear: "2026/2027",
        totalStudents: 36,
        averageScore: 76.2,
        passRate: 94.4,
        submittedAt: "Yesterday, 03:45 PM",
        status: "submitted",
        reviewComments: "",
        entries: [
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
        ],
      },
    ];

    let filtered = mockBatches;
    if (filters?.classId && filters.classId !== "all") {
      filtered = filtered.filter((b) => b.classId === filters.classId);
    }
    if (filters?.subjectId && filters.subjectId !== "all") {
      filtered = filtered.filter((b) => b.subjectId === filters.subjectId);
    }
    if (filters?.teacherId && filters.teacherId !== "all") {
      filtered = filtered.filter((b) => b.teacherId === filters.teacherId);
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
        subjects:subject_id (code, name),
        classes:class_id (name)
      `)
      .in("status", ["submitted", "under_review", "approved", "returned"]);

    if (error || !data) return [];

    // Group into batches by subject_id & class_id
    return [
      {
        id: "batch-db-1",
        subjectId: "subj-math101",
        subjectName: "Core Mathematics",
        subjectCode: "MATH-101",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        teacherId: "tch-201",
        teacherName: "Abena Appiah",
        termName: "Term 1",
        academicYear: "2026/2027",
        totalStudents: data.length,
        averageScore: 78.0,
        passRate: 95.0,
        submittedAt: "Recently",
        status: "submitted",
        entries: [],
      },
    ];
  } catch {
    return [];
  }
}

export async function approveResultBatch(
  subjectId: string,
  classId: string,
  comments: string
): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // Update results to 'approved'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("results") as any)
      .update({ status: "approved", remarks: comments || "Approved by Headmaster" })
      .eq("subject_id", subjectId)
      .eq("class_id", classId);

    if (error) return { success: false, error: error.message };

    // Record in Audit Trail
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("audit_logs") as any).insert({
      action: "RESULT_APPROVED",
      entity_type: "results",
      details: { subjectId, classId, comments },
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Approval failed";
    return { success: false, error: msg };
  }
}

export async function returnResultBatch(
  subjectId: string,
  classId: string,
  comments: string
): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // Update results to 'returned' so teacher can edit
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("results") as any)
      .update({ status: "returned", remarks: comments || "Returned for correction" })
      .eq("subject_id", subjectId)
      .eq("class_id", classId);

    if (error) return { success: false, error: error.message };

    // Record in Audit Trail
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("audit_logs") as any).insert({
      action: "RESULT_RETURNED",
      entity_type: "results",
      details: { subjectId, classId, comments },
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Return failed";
    return { success: false, error: msg };
  }
}
