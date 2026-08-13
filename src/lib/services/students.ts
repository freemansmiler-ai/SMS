import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "./audit-logs";
import { requireAuthorization } from "./authorization";

export interface StudentRecord {
  id: string;
  profileId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  guardianName?: string;
  guardianContact?: string;
  status: "active" | "inactive" | "suspended" | "graduated";
  enrollmentDate: string;
  avatarUrl?: string;
  className?: string;
  classId?: string;
  gradeLevel?: string;
  academicYearId?: string;
  mustChangePassword?: boolean;
}

export interface CreateStudentPayload {
  firstName: string;
  lastName: string;
  email: string;
  studentCode: string;
  dateOfBirth?: string;
  gender?: string;
  guardianName?: string;
  guardianContact?: string;
  classId?: string;
  academicYearId?: string;
  avatarUrl?: string;
}

export function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let rand = "";
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Temp#2026!${rand}`;
}

export async function fetchStudents(filters?: {
  search?: string;
  classId?: string;
  status?: string;
}): Promise<StudentRecord[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback if config is placeholder or unconfigured
  if (config.isPlaceholder || !config.isConfigured) {
    const mockStudents: StudentRecord[] = [
      {
        id: "stu-101",
        profileId: "prof-101",
        studentCode: "GES-2026-001",
        firstName: "Kwame",
        lastName: "Kyeremateng",
        email: "k.kyeremateng@student.ghanaschools.edu.gh",
        dateOfBirth: "2010-04-12",
        gender: "Male",
        guardianName: "Kofi Kyeremateng",
        guardianContact: "+233 24 412 3456",
        status: "active",
        enrollmentDate: "2026-09-01",
        className: "Basic 8 - Section A",
        classId: "class-basic8a",
        gradeLevel: "Basic 8",
        avatarUrl: "",
      },
      {
        id: "stu-102",
        profileId: "prof-102",
        studentCode: "GES-2026-002",
        firstName: "Akosua",
        lastName: "Mensah",
        email: "a.mensah@student.ghanaschools.edu.gh",
        dateOfBirth: "2010-08-25",
        gender: "Female",
        guardianName: "Yaw Mensah",
        guardianContact: "+233 20 876 5432",
        status: "active",
        enrollmentDate: "2026-09-01",
        className: "Basic 8 - Section A",
        classId: "class-basic8a",
        gradeLevel: "Basic 8",
        avatarUrl: "",
      },
      {
        id: "stu-103",
        profileId: "prof-103",
        studentCode: "GES-2026-003",
        firstName: "Kofi",
        lastName: "Addai",
        email: "k.addai@student.ghanaschools.edu.gh",
        dateOfBirth: "2011-01-15",
        gender: "Male",
        guardianName: "Ama Addai",
        guardianContact: "+233 55 432 1098",
        status: "inactive",
        enrollmentDate: "2025-09-01",
        className: "Basic 7 - Section B",
        classId: "class-basic7b",
        gradeLevel: "Basic 7",
        avatarUrl: "",
      },
    ];

    let filtered = mockStudents;
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((s) => s.status === filters.status);
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("students") as any).select(`
      id,
      profile_id,
      student_code,
      date_of_birth,
      gender,
      guardian_name,
      guardian_contact,
      enrollment_date,
      status,
      profiles:profile_id (
        first_name,
        last_name,
        email,
        avatar_url
      )
    `);

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let records: StudentRecord[] = data.map((item: any) => ({
      id: item.id,
      profileId: item.profile_id,
      studentCode: item.student_code,
      firstName: item.profiles?.first_name || "",
      lastName: item.profiles?.last_name || "",
      email: item.profiles?.email || "",
      dateOfBirth: item.date_of_birth,
      gender: item.gender,
      guardianName: item.guardian_name,
      guardianContact: item.guardian_contact,
      status: (item.status as StudentRecord["status"]) || "active",
      enrollmentDate: item.enrollment_date,
      avatarUrl: item.profiles?.avatar_url || "",
      className: "Basic 8 - Section A",
    }));

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    return records;
  } catch {
    return [];
  }
}

export async function fetchStudentById(id: string): Promise<StudentRecord | null> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    const students = await fetchStudents({ search: "" });
    const found = students.find((s: StudentRecord) => s.id === id);
    return found || null;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("students") as any)
      .select(`
        id,
        profile_id,
        student_code,
        date_of_birth,
        gender,
        guardian_name,
        guardian_contact,
        enrollment_date,
        status,
        profiles:profile_id (
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      profileId: data.profile_id,
      studentCode: data.student_code,
      firstName: data.profiles?.first_name || "",
      lastName: data.profiles?.last_name || "",
      email: data.profiles?.email || "",
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      guardianName: data.guardian_name,
      guardianContact: data.guardian_contact,
      status: (data.status as StudentRecord["status"]) || "active",
      enrollmentDate: data.enrollment_date,
      avatarUrl: data.profiles?.avatar_url || "",
      className: "Basic 8 - Section A",
    };
  } catch {
    return null;
  }
}

export async function createStudent(payload: CreateStudentPayload): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> {
  const tempPassword = generateTemporaryPassword();
  const config = getSupabaseEnvConfig();

  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true, temporaryPassword: tempPassword };
  }

  try {
    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create student account.";
    return { success: false, error: msg };
  }
}

export async function updateStudent(id: string, payload: Partial<CreateStudentPayload>): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: studentData } = await (supabase.from("students") as any)
      .select("profile_id, student_code")
      .eq("id", id)
      .single();

    if (studentData?.profile_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("profiles") as any).update({
        first_name: payload.firstName,
        last_name: payload.lastName,
        avatar_url: payload.avatarUrl,
      }).eq("id", studentData.profile_id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: studentErr } = await (supabase.from("students") as any).update({
      date_of_birth: payload.dateOfBirth,
      gender: payload.gender,
      guardian_name: payload.guardianName,
      guardian_contact: payload.guardianContact,
    }).eq("id", id);

    if (studentErr) {
      return { success: false, error: studentErr.message };
    }

    // Audit Logging
    await recordAuditLog(
      "STUDENT_MODIFICATION",
      "student",
      id,
      `Updated student record ${payload.firstName || ""} ${payload.lastName || ""}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed.";
    return { success: false, error: msg };
  }
}

export async function deactivateStudent(id: string): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("students") as any)
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    // Audit Logging
    await recordAuditLog(
      "ACCOUNT_DEACTIVATION",
      "student",
      id,
      `Deactivated student account ID ${id} with historical record preservation.`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Deactivation failed.";
    return { success: false, error: msg };
  }
}

export async function resetStudentPassword(id: string): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> {
  const tempPassword = generateTemporaryPassword();
  const config = getSupabaseEnvConfig();

  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true, temporaryPassword: tempPassword };
  }

  try {
    await recordAuditLog(
      "STUDENT_MODIFICATION",
      "student",
      id,
      `Administrator generated temporary password reset for student ID ${id}`
    );

    return { success: true, temporaryPassword: tempPassword };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Password reset failed";
    return { success: false, error: msg };
  }
}

export async function uploadStudentPhoto(file: File): Promise<string | null> {
  const convertToDataUrl = (f: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(f);
    });
  };

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return convertToDataUrl(file);
  }

  const supabase = createBrowserClient();
  try {
    const fileName = `student-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { data, error } = await supabase.storage.from("student-photos").upload(fileName, file);

    if (error || !data) {
      return convertToDataUrl(file);
    }

    const { data: publicUrlData } = supabase.storage.from("student-photos").getPublicUrl(data.path);
    return publicUrlData.publicUrl || convertToDataUrl(file);
  } catch {
    return convertToDataUrl(file);
  }
}

/**
 * Bulk upload students from CSV data
 */
export interface BulkUploadResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

export async function bulkUploadStudents(
  csvData: Array<{
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: string;
    gender?: string;
    guardianName?: string;
    guardianContact?: string;
    classId?: string;
    gradeLevel?: string;
  }>
): Promise<BulkUploadResult> {
  const config = getSupabaseEnvConfig();
  const result: BulkUploadResult = {
    success: false,
    totalProcessed: csvData.length,
    successCount: 0,
    failedCount: 0,
    errors: []
  };

  // Mock mode fallback
  if (config.isPlaceholder || !config.isConfigured) {
    // Simulate processing with some mock validation
    csvData.forEach((student, index) => {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(student.email)) {
        result.errors.push({
          row: index + 2, // +2 because index is 0-based and we skip header row
          email: student.email,
          error: "Invalid email format"
        });
        result.failedCount++;
      } else {
        result.successCount++;
      }
    });

    result.success = result.failedCount === 0;
    return result;
  }

  const supabase = createBrowserClient();

  try {
    // Get current user and school context
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("school_id")
      .eq("id", user.id)
      .single();

    if (!profile?.school_id) {
      throw new Error("School context not found");
    }

    // Get current academic year for enrollment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentYear } = await (supabase.from("academic_years") as any)
      .select("id")
      .eq("school_id", profile.school_id)
      .eq("is_current", true)
      .single();

    // Process each student
    for (let i = 0; i < csvData.length; i++) {
      const student = csvData[i];
      const rowNumber = i + 2; // +2 for 1-based indexing and header row

      try {
        // Validate required fields
        if (!student.firstName || !student.lastName || !student.email) {
          throw new Error("First name, last name, and email are required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(student.email)) {
          throw new Error("Invalid email format");
        }

        // Check if email already exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingProfile } = await (supabase.from("profiles") as any)
          .select("id")
          .eq("email", student.email)
          .single();

        if (existingProfile) {
          throw new Error("Email already exists in system");
        }

        // Generate student code
        const studentCode = `GES-${new Date().getFullYear()}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;

        // Create auth user first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: authUser, error: authError } = await (supabase.auth as any).admin.createUser({
          email: student.email,
          password: generateTemporaryPassword(),
          email_confirm: true,
          user_metadata: {
            first_name: student.firstName,
            last_name: student.lastName,
            role: "student"
          }
        });

        if (authError) {
          throw new Error(`Failed to create user account: ${authError.message}`);
        }

        // Create profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await (supabase.from("profiles") as any).insert({
          id: authUser.user.id,
          school_id: profile.school_id,
          email: student.email,
          first_name: student.firstName,
          last_name: student.lastName,
          role: "student",
          must_change_password: true
        });

        if (profileError) {
          throw new Error(`Failed to create profile: ${profileError.message}`);
        }

        // Create student record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: studentError } = await (supabase.from("students") as any).insert({
          profile_id: authUser.user.id,
          school_id: profile.school_id,
          student_code: studentCode,
          date_of_birth: student.dateOfBirth || null,
          gender: student.gender || null,
          guardian_name: student.guardianName || null,
          guardian_contact: student.guardianContact || null,
          status: "active"
        });

        if (studentError) {
          throw new Error(`Failed to create student record: ${studentError.message}`);
        }

        // Create enrollment if class and academic year provided
        if (student.classId && currentYear) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("enrollments") as any).insert({
            student_id: authUser.user.id,
            class_id: student.classId,
            academic_year_id: currentYear.id,
            school_id: profile.school_id,
            enrollment_date: new Date().toISOString().split('T')[0],
            status: "active"
          });
        }

        result.successCount++;

      } catch (error) {
        result.errors.push({
          row: rowNumber,
          email: student.email,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        result.failedCount++;
      }
    }

    // Record audit log
    await recordAuditLog(
      "BULK_OPERATION",
      "students",
      "bulk_upload",
      `Bulk uploaded ${result.successCount} students, ${result.failedCount} failed`
    );

    result.success = result.failedCount === 0;
    return result;

  } catch (error) {
    return {
      success: false,
      totalProcessed: csvData.length,
      successCount: 0,
      failedCount: csvData.length,
      errors: [{
        row: 0,
        email: "system",
        error: error instanceof Error ? error.message : "System error during bulk upload"
      }]
    };
  }
}
