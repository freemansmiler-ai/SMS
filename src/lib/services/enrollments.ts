import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "./audit-logs";

export type EnrollmentStatus = "enrolled" | "completed" | "withdrawn" | "transferred";

export interface EnrollmentRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  classId: string;
  className: string;
  gradeLevel: string;
  academicYearId: string;
  academicYearName: string;
  rollNumber?: number;
  status: EnrollmentStatus;
  createdAt?: string;
}

export interface EnrollStudentPayload {
  studentId: string;
  classId: string;
  academicYearId?: string;
  rollNumber?: number;
}

export async function fetchEnrollments(filters?: {
  studentId?: string;
  classId?: string;
  academicYearId?: string;
  search?: string;
}): Promise<EnrollmentRecord[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback if config is placeholder or unconfigured
  if (config.isPlaceholder || !config.isConfigured) {
    const mockEnrollments: EnrollmentRecord[] = [
      {
        id: "enr-101",
        schoolId: "sch-01",
        studentId: "stu-101",
        studentCode: "GES-2026-001",
        studentName: "Kwame Kyeremateng",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        gradeLevel: "Basic 8",
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        rollNumber: 1,
        status: "enrolled",
      },
      {
        id: "enr-102",
        schoolId: "sch-01",
        studentId: "stu-102",
        studentCode: "GES-2026-002",
        studentName: "Akosua Mensah",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        gradeLevel: "Basic 8",
        academicYearId: "ay-2026",
        academicYearName: "2026/2027 Academic Year",
        rollNumber: 2,
        status: "enrolled",
      },
      {
        id: "enr-103",
        schoolId: "sch-01",
        studentId: "stu-101",
        studentCode: "GES-2026-001",
        studentName: "Kwame Kyeremateng",
        classId: "class-basic7a",
        className: "Basic 7 - Section A",
        gradeLevel: "Basic 7",
        academicYearId: "ay-2025",
        academicYearName: "2025/2026 Academic Year",
        rollNumber: 1,
        status: "completed",
      },
    ];

    let filtered = mockEnrollments;
    if (filters?.studentId) {
      filtered = filtered.filter((e) => e.studentId === filters.studentId);
    }
    if (filters?.classId) {
      filtered = filtered.filter((e) => e.classId === filters.classId);
    }
    if (filters?.academicYearId) {
      filtered = filtered.filter((e) => e.academicYearId === filters.academicYearId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.studentName.toLowerCase().includes(q) ||
          e.studentCode.toLowerCase().includes(q) ||
          e.className.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("student_enrollments") as any).select(`
      id,
      school_id,
      student_id,
      class_id,
      academic_year_id,
      roll_number,
      status,
      created_at,
      students:student_id (
        id,
        student_code,
        profiles:profile_id ( first_name, last_name )
      ),
      classes:class_id ( id, name, grade_level ),
      academic_years:academic_year_id ( id, name )
    `);

    if (filters?.studentId) query = query.eq("student_id", filters.studentId);
    if (filters?.classId) query = query.eq("class_id", filters.classId);
    if (filters?.academicYearId) query = query.eq("academic_year_id", filters.academicYearId);

    const { data, error } = await query;
    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let records: EnrollmentRecord[] = data.map((item: any) => {
      const profile = item.students?.profiles;
      const studentName = profile
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
        : "Student";

      return {
        id: item.id,
        schoolId: item.school_id,
        studentId: item.student_id,
        studentCode: item.students?.student_code || "",
        studentName,
        classId: item.class_id,
        className: item.classes?.name || "Class",
        gradeLevel: item.classes?.grade_level || "",
        academicYearId: item.academic_year_id,
        academicYearName: item.academic_years?.name || "Academic Year",
        rollNumber: item.roll_number,
        status: item.status || "enrolled",
        createdAt: item.created_at,
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(
        (e) =>
          e.studentName.toLowerCase().includes(q) ||
          e.studentCode.toLowerCase().includes(q) ||
          e.className.toLowerCase().includes(q)
      );
    }

    return records;
  } catch {
    return [];
  }
}

export async function fetchStudentEnrollmentHistory(studentId: string): Promise<EnrollmentRecord[]> {
  return fetchEnrollments({ studentId });
}

export async function enrollStudent(payload: EnrollStudentPayload): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required to enroll students." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can enroll students." };
    }

    const schoolId = adminProfile?.school_id;
    if (!schoolId) return { success: false, error: "Administrator school context missing." };

    // Determine target academic year
    let yearId = payload.academicYearId;
    if (!yearId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: currYear } = await (supabase.from("academic_years") as any)
        .select("id")
        .eq("school_id", schoolId)
        .eq("is_current", true)
        .maybeSingle();

      yearId = currYear?.id;
    }

    if (!yearId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: anyYear } = await (supabase.from("academic_years") as any)
        .select("id")
        .eq("school_id", schoolId)
        .limit(1)
        .maybeSingle();

      yearId = anyYear?.id;
    }

    if (!yearId) {
      return { success: false, error: "No active or valid academic year found for school." };
    }

    // 1. Capacity Check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: targetClass } = await (supabase.from("classes") as any)
      .select("id, name, capacity")
      .eq("id", payload.classId)
      .eq("school_id", schoolId)
      .single();

    if (!targetClass) {
      return { success: false, error: "Target class section not found or belongs to another school." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentEnrollments } = await (supabase.from("student_enrollments") as any)
      .select("id")
      .eq("class_id", payload.classId)
      .eq("academic_year_id", yearId)
      .eq("status", "enrolled");

    const currentCount = currentEnrollments ? currentEnrollments.length : 0;
    const capacity = targetClass.capacity || 35;

    if (currentCount >= capacity) {
      return {
        success: false,
        error: `Class section '${targetClass.name}' capacity limit reached (${currentCount}/${capacity} enrolled). Cannot enroll additional students.`,
      };
    }

    // 2. Duplicate Check for same Academic Year
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingEnrollment } = await (supabase.from("student_enrollments") as any)
      .select("id, class_id, classes:class_id ( name )")
      .eq("student_id", payload.studentId)
      .eq("academic_year_id", yearId)
      .maybeSingle();

    if (existingEnrollment) {
      const existingClassName = existingEnrollment.classes?.name || "another class";
      return {
        success: false,
        error: `DUPLICATE ENROLLMENT REJECTED: Student is already enrolled in '${existingClassName}' for this academic year. Use 'Class Change' to transfer student instead of duplicate enrollment.`,
      };
    }

    // 3. Insert Enrollment Record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newEnrollment, error: insertErr } = await (supabase.from("student_enrollments") as any)
      .insert({
        school_id: schoolId,
        student_id: payload.studentId,
        class_id: payload.classId,
        academic_year_id: yearId,
        roll_number: payload.rollNumber || (currentCount + 1),
        status: "enrolled",
      })
      .select("id")
      .single();

    if (insertErr || !newEnrollment) {
      return { success: false, error: insertErr?.message || "Failed to enroll student." };
    }

    // Audit log
    await recordAuditLog(
      "STUDENT_ENROLLMENT",
      "student_enrollments",
      newEnrollment.id,
      `Administrator (${user.id}) enrolled student ${payload.studentId} into class section ${payload.classId} for academic year ${yearId}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Enrollment failed.";
    return { success: false, error: msg };
  }
}

export async function changeStudentClass(
  studentId: string,
  targetClassId: string,
  academicYearId: string
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

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can change student classes." };
    }

    // Capacity Check on target class
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: targetClass } = await (supabase.from("classes") as any)
      .select("id, name, capacity")
      .eq("id", targetClassId)
      .eq("school_id", adminProfile.school_id)
      .single();

    if (!targetClass) {
      return { success: false, error: "Target class section not found." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentEnrollments } = await (supabase.from("student_enrollments") as any)
      .select("id")
      .eq("class_id", targetClassId)
      .eq("academic_year_id", academicYearId)
      .eq("status", "enrolled");

    const currentCount = currentEnrollments ? currentEnrollments.length : 0;
    if (currentCount >= targetClass.capacity) {
      return {
        success: false,
        error: `Target class '${targetClass.name}' capacity reached (${currentCount}/${targetClass.capacity}).`,
      };
    }

    // Update current academic year enrollment record while preserving past academic year history records
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("student_enrollments") as any)
      .update({ class_id: targetClassId })
      .eq("student_id", studentId)
      .eq("academic_year_id", academicYearId)
      .eq("school_id", adminProfile.school_id);

    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "ENROLLMENT_MODIFICATION",
      "student_enrollments",
      studentId,
      `Administrator (${user.id}) changed student ${studentId} class to ${targetClassId} for academic year ${academicYearId}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Class change failed.";
    return { success: false, error: msg };
  }
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: EnrollmentStatus
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

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can update enrollment status." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("student_enrollments") as any)
      .update({ status })
      .eq("id", enrollmentId)
      .eq("school_id", adminProfile.school_id);

    if (error) return { success: false, error: error.message };

    const action = status === "withdrawn" ? "ENROLLMENT_WITHDRAWAL" : "ENROLLMENT_MODIFICATION";
    await recordAuditLog(
      action,
      "student_enrollments",
      enrollmentId,
      `Administrator (${user.id}) set enrollment ID ${enrollmentId} status to '${status}'`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Status update failed.";
    return { success: false, error: msg };
  }
}
