import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { ResultEntry, ResultStatus } from "@/lib/services/teacher-results";
import { recordAuditLog } from "./audit-logs";

export interface SubmittedResultBatch {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  termId?: string;
  termName: string;
  academicYearId?: string;
  academicYear: string;
  totalStudents: number;
  averageScore: number;
  passRate: number;
  submittedAt: string;
  status: ResultStatus;
  reviewComments?: string;
  returnReason?: string;
  entries: ResultEntry[];
}

export async function fetchSubmittedResultBatches(filters?: {
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  status?: string;
  academicYearId?: string;
  termId?: string;
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
            continuousAssessmentScore: 34,
            examScore: 50,
            totalScore: 84,
            grade: "A1",
            remarks: "Excellent",
            status: "submitted",
            classScore: 26,
            projectScore: 18,
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
            continuousAssessmentScore: 28,
            examScore: 43,
            totalScore: 71,
            grade: "B3",
            remarks: "Good",
            status: "submitted",
            classScore: 22,
            projectScore: 15,
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
            continuousAssessmentScore: 30,
            examScore: 46,
            totalScore: 76,
            grade: "B2",
            remarks: "Very Good",
            status: "submitted",
            classScore: 24,
            projectScore: 16,
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
    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((b) => b.status === filters.status);
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "principal") return [];

    const schoolId = profile.school_id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("results") as any)
      .select(`
        id,
        student_id,
        subject_id,
        class_id,
        teacher_id,
        academic_year_id,
        term_id,
        continuous_assessment_score,
        examination_score,
        total_score,
        grade,
        teacher_remark,
        remarks,
        return_reason,
        status,
        updated_at,
        students:student_id (
          student_code,
          profiles:profile_id (first_name, last_name)
        ),
        subjects:subject_id (code, name),
        classes:class_id (name),
        teachers:teacher_id (
          profiles:profile_id (first_name, last_name)
        ),
        academic_years:academic_year_id (name),
        terms:term_id (name)
      `)
      .eq("school_id", schoolId);

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    } else {
      query = query.in("status", ["submitted", "under_review", "returned", "approved", "published"]);
    }

    if (filters?.classId && filters.classId !== "all") query = query.eq("class_id", filters.classId);
    if (filters?.subjectId && filters.subjectId !== "all") query = query.eq("subject_id", filters.subjectId);
    if (filters?.teacherId && filters.teacherId !== "all") query = query.eq("teacher_id", filters.teacherId);
    if (filters?.academicYearId) query = query.eq("academic_year_id", filters.academicYearId);
    if (filters?.termId) query = query.eq("term_id", filters.termId);

    const { data, error } = await query;
    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: ResultEntry[] = data.map((r: any) => ({
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
      academicYear: r.academic_years?.name || "2026/2027",
      termId: r.term_id,
      termName: r.terms?.name || "Term 1",
      continuousAssessmentScore: Number(r.continuous_assessment_score || 0),
      examScore: Number(r.examination_score || 0),
      totalScore: Number(r.total_score || 0),
      grade: r.grade || "F9",
      remarks: r.return_reason || r.teacher_remark || r.remarks || "",
      status: r.status as ResultStatus,
      classScore: Number(r.continuous_assessment_score || 0),
      projectScore: 0,
    }));

    // Group entries into subject/class batches
    const batchMap = new Map<string, SubmittedResultBatch>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((r: any, idx: number) => {
      const batchKey = `${r.subject_id}_${r.class_id}`;
      const entry = entries[idx];

      if (!batchMap.has(batchKey)) {
        const teacherProfile = r.teachers?.profiles;
        const teacherName = teacherProfile ? `${teacherProfile.first_name} ${teacherProfile.last_name}` : "Faculty Teacher";

        batchMap.set(batchKey, {
          id: `batch-${batchKey}`,
          subjectId: r.subject_id,
          subjectName: r.subjects?.name || "Subject",
          subjectCode: r.subjects?.code || "SUBJ",
          classId: r.class_id,
          className: r.classes?.name || "Class",
          teacherId: r.teacher_id,
          teacherName,
          termId: r.term_id,
          termName: r.terms?.name || "Term 1",
          academicYearId: r.academic_year_id,
          academicYear: r.academic_years?.name || "2026/2027",
          totalStudents: 0,
          averageScore: 0,
          passRate: 0,
          submittedAt: new Date(r.updated_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: r.status as ResultStatus,
          returnReason: r.return_reason || "",
          entries: [],
        });
      }

      const b = batchMap.get(batchKey)!;
      b.entries.push(entry);
      b.totalStudents = b.entries.length;
      const sum = b.entries.reduce((acc, curr) => acc + (curr.totalScore || 0), 0);
      b.averageScore = Number((sum / b.totalStudents).toFixed(1));
      const passed = b.entries.filter((curr) => (curr.totalScore || 0) >= 50).length;
      b.passRate = Number(((passed / b.totalStudents) * 100).toFixed(1));
    });

    return Array.from(batchMap.values());
  } catch {
    return [];
  }
}

export async function approveResultBatch(
  subjectId: string,
  classId: string,
  comments?: string
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
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "principal") {
      return { success: false, error: "UNAUTHORIZED: Only an authorized Principal can approve result marksheets." };
    }

    const schoolId = profile.school_id;

    // Transition ONLY 'submitted' or 'under_review' to 'approved'
    // Rejects invalid transitions (e.g. 'draft' -> 'approved')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("results") as any)
      .update({
        status: "approved",
        remarks: comments || "Approved by Headmaster / Principal",
      })
      .eq("school_id", schoolId)
      .eq("subject_id", subjectId)
      .eq("class_id", classId)
      .in("status", ["submitted", "under_review"]);

    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "RESULT_APPROVAL",
      "results",
      `${subjectId}_${classId}`,
      `Principal (${user.id}) approved result marksheet batch for subject ${subjectId} in class ${classId}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Approval failed";
    return { success: false, error: msg };
  }
}

export async function returnResultBatch(
  subjectId: string,
  classId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!reason || reason.trim().length === 0) {
    return { success: false, error: "A mandatory return reason is required when returning results for correction." };
  }

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "principal") {
      return { success: false, error: "UNAUTHORIZED: Only an authorized Principal can return result marksheets." };
    }

    const schoolId = profile.school_id;

    // Transition ONLY 'submitted' or 'under_review' to 'returned'
    // Stores return reason in return_reason column and teacher_remark
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("results") as any)
      .update({
        status: "returned",
        return_reason: reason.trim(),
        teacher_remark: `RETURNED BY PRINCIPAL: ${reason.trim()}`,
      })
      .eq("school_id", schoolId)
      .eq("subject_id", subjectId)
      .eq("class_id", classId)
      .in("status", ["submitted", "under_review"]);

    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "RESULT_REJECTION",
      "results",
      `${subjectId}_${classId}`,
      `Principal (${user.id}) returned result marksheet batch for subject ${subjectId} in class ${classId}. Reason: ${reason}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Return failed";
    return { success: false, error: msg };
  }
}

export async function publishApprovedResultBatch(
  subjectId: string,
  classId: string
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
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "principal") {
      return { success: false, error: "UNAUTHORIZED: Only an authorized Principal can publish results." };
    }

    const schoolId = profile.school_id;

    // Transition ONLY 'approved' to 'published'
    // Rejects publishing 'draft', 'submitted', or 'returned' results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("results") as any)
      .update({ status: "published" })
      .eq("school_id", schoolId)
      .eq("subject_id", subjectId)
      .eq("class_id", classId)
      .eq("status", "approved");

    if (error) return { success: false, error: error.message };

    await recordAuditLog(
      "RESULT_PUBLICATION",
      "results",
      `${subjectId}_${classId}`,
      `Principal (${user.id}) published approved results for subject ${subjectId} in class ${classId}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Publishing failed";
    return { success: false, error: msg };
  }
}
