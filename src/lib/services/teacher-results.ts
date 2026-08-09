import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "./audit-logs";

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
  academicYearId?: string;
  academicYearName?: string;
  academicYear?: string;
  termId: string;
  termName: string;
  continuousAssessmentScore?: number; // Max 40 (Continuous Assessment / CA)
  examScore?: number;                 // Max 60 (End of Term Examination)
  totalScore?: number;                // Max 100 (CA + Exam)
  grade: string;                     // A1, B2, B3, C4, C5, C6, D7, E8, F9
  remarks: string;
  status: ResultStatus;
  // Legacy aliases for UI backwards compatibility
  classScore?: number;
  projectScore?: number;
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

export async function fetchTeacherResults(filters?: {
  subjectId?: string;
  classId?: string;
  academicYearId?: string;
  termId?: string;
}): Promise<ResultEntry[]> {
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
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        termId: "term-1-2026",
        termName: "Term 1",
        continuousAssessmentScore: 34,
        examScore: 50,
        totalScore: 84,
        grade: "A1",
        remarks: "Excellent",
        status: "draft",
        classScore: 24,
        projectScore: 10,
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
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        termId: "term-1-2026",
        termName: "Term 1",
        continuousAssessmentScore: 28,
        examScore: 43,
        totalScore: 71,
        grade: "B3",
        remarks: "Good",
        status: "draft",
        classScore: 18,
        projectScore: 10,
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
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        termId: "term-1-2026",
        termName: "Term 1",
        continuousAssessmentScore: 30,
        examScore: 46,
        totalScore: 76,
        grade: "B2",
        remarks: "Very Good",
        status: "submitted",
        classScore: 20,
        projectScore: 10,
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
    // Verify authenticated teacher identity
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "teacher") return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("results") as any).select(`
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
      teacher_remark,
      remarks,
      status,
      students:student_id (
        student_code,
        profiles:profile_id (first_name, last_name)
      ),
      subjects:subject_id (name),
      classes:class_id (name),
      academic_years:academic_year_id (name),
      terms:term_id (name)
    `);

    if (filters?.subjectId) query = query.eq("subject_id", filters.subjectId);
    if (filters?.classId) query = query.eq("class_id", filters.classId);
    if (filters?.academicYearId) query = query.eq("academic_year_id", filters.academicYearId);
    if (filters?.termId) query = query.eq("term_id", filters.termId);

    const { data, error } = await query;
    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((r: any) => {
      const caScore = Number(r.continuous_assessment_score || 0);
      const exScore = Number(r.examination_score || 0);
      const totScore = caScore + exScore;
      const { grade, remarks } = calculateGESGrade(totScore);

      return {
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
        academicYearId: r.academic_year_id,
        academicYearName: r.academic_years?.name || "2026/2027",
        termId: r.term_id,
        termName: r.terms?.name || "Term 1",
        continuousAssessmentScore: caScore,
        examScore: exScore,
        totalScore: totScore,
        grade: r.grade || grade,
        remarks: r.teacher_remark || r.remarks || remarks,
        status: (r.status as ResultStatus) || "draft",
        classScore: caScore,
        projectScore: 0,
      };
    });
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
    // 1. Authenticate teacher & school scope
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required to enter student scores." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "teacher") {
      return { success: false, error: "UNAUTHORIZED: Only an assigned teacher can enter class scores." };
    }

    const schoolId = adminProfile.school_id;

    // 2. Fetch teacher record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teacherRec } = await (supabase.from("teachers") as any)
      .select("id")
      .eq("profile_id", user.id)
      .eq("school_id", schoolId)
      .single();

    if (!teacherRec) {
      return { success: false, error: "UNAUTHORIZED: Teacher record not found." };
    }

    // 3. Strict Assignment Authorization Check
    // Verify teacher is assigned to (subjectId, classId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assignment } = await (supabase.from("teacher_assignments") as any)
      .select("id")
      .eq("teacher_id", teacherRec.id)
      .eq("subject_id", entry.subjectId)
      .eq("class_id", entry.classId)
      .eq("school_id", schoolId)
      .limit(1)
      .maybeSingle();

    if (!assignment) {
      return {
        success: false,
        error: "AUTHORIZATION REJECTED: You are not assigned to teach this subject in this class section.",
      };
    }

    // 4. Score range validation
    const caScore = entry.continuousAssessmentScore ?? entry.classScore ?? 0;
    const examScore = entry.examScore ?? 0;

    if (caScore < 0 || caScore > 100) {
      return { success: false, error: "Continuous Assessment score must be between 0 and 100." };
    }
    if (examScore < 0 || examScore > 100) {
      return { success: false, error: "Examination score must be between 0 and 100." };
    }

    const totalScore = caScore + examScore;
    if (totalScore > 100) {
      return { success: false, error: "Total generated score (CA + Exam) cannot exceed 100." };
    }

    const { grade, remarks } = calculateGESGrade(totalScore);

    // 5. Existing Status Check (Cannot modify locked approved/published/submitted results)
    if (entry.id && !entry.id.startsWith("res-")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingRes } = await (supabase.from("results") as any)
        .select("status")
        .eq("id", entry.id)
        .single();

      if (existingRes && ["submitted", "under_review", "approved", "published"].includes(existingRes.status)) {
        return {
          success: false,
          error: `LOCKED RECORD: Results in '${existingRes.status}' status cannot be modified. Only draft or returned results may be edited by a teacher.`,
        };
      }
    }

    // 6. Upsert into Supabase `results` table under RLS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: savedResult, error: upsertErr } = await (supabase.from("results") as any)
      .upsert({
        id: entry.id && !entry.id.startsWith("res-") ? entry.id : undefined,
        school_id: schoolId,
        student_id: entry.studentId,
        subject_id: entry.subjectId,
        teacher_id: teacherRec.id,
        class_id: entry.classId,
        academic_year_id: entry.academicYearId || undefined,
        term_id: entry.termId || undefined,
        continuous_assessment_score: caScore,
        examination_score: examScore,
        grade,
        teacher_remark: entry.remarks || remarks,
        status: "draft",
      })
      .select("id")
      .single();

    if (upsertErr || !savedResult) {
      return { success: false, error: upsertErr?.message || "Failed to save draft result." };
    }

    // Audit log
    await recordAuditLog(
      entry.id ? "SCORE_MODIFICATION" : "SCORE_CREATION",
      "results",
      savedResult.id,
      `Teacher (${user.id}) saved draft result for student ${entry.studentId} in subject ${entry.subjectId}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Save draft failed";
    return { success: false, error: msg };
  }
}

export async function submitResultBatch(
  subjectId: string,
  classId: string,
  academicYearId?: string,
  termId?: string
): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "teacher") {
      return { success: false, error: "UNAUTHORIZED: Only an assigned teacher can submit results." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teacherRec } = await (supabase.from("teachers") as any)
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!teacherRec) return { success: false, error: "Teacher record not found." };

    // Strict Assignment Check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assignment } = await (supabase.from("teacher_assignments") as any)
      .select("id")
      .eq("teacher_id", teacherRec.id)
      .eq("subject_id", subjectId)
      .eq("class_id", classId)
      .limit(1)
      .maybeSingle();

    if (!assignment) {
      return { success: false, error: "UNAUTHORIZED: You are not assigned to this subject/class." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("results") as any)
      .update({ status: "submitted" })
      .eq("subject_id", subjectId)
      .eq("class_id", classId)
      .eq("teacher_id", teacherRec.id)
      .in("status", ["draft", "returned"]);

    if (academicYearId) query = query.eq("academic_year_id", academicYearId);
    if (termId) query = query.eq("term_id", termId);

    const { error } = await query;
    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "SCORE_SUBMISSION",
      "results",
      `${subjectId}_${classId}`,
      `Teacher (${user.id}) submitted batch results for subject ${subjectId} in class ${classId}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Batch submission failed";
    return { success: false, error: msg };
  }
}
