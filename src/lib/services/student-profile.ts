import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "@/lib/services/audit-logs";

export interface StudentProfileData {
  id: string;
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  avatarUrl: string | null;
  className: string;
  gradeLevel: string;
  academicYearName: string;
  schoolName: string;
  schoolCode: string;
  accountStatus: string;
}

export async function fetchStudentProfile(): Promise<StudentProfileData> {
  const config = getSupabaseEnvConfig();

  // Mock Fallback for Student Profile
  if (config.isPlaceholder || !config.isConfigured) {
    return {
      id: "prof-stu-1",
      studentId: "stu-101",
      studentCode: "GES-2026-001",
      firstName: "Kwame",
      lastName: "Kyeremateng",
      fullName: "Kwame Kyeremateng",
      email: "kwame.kyeremateng@student.edu.gh",
      phone: "+233 24 555 6677",
      address: "House No. 14, Achimota Mile 7, Accra",
      gender: "Male",
      dateOfBirth: "2012-05-14",
      avatarUrl: null,
      className: "Basic 8 - Section A",
      gradeLevel: "Basic 8",
      academicYearName: "2026/2027 Academic Year",
      schoolName: "Achimota Basic School",
      schoolCode: "ABS-2026",
      accountStatus: "active",
    };
  }

  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("first_name, last_name, email, phone, role, school_id, avatar_url, is_active, schools:school_id(name, code)")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    throw new Error("UNAUTHORIZED: Access restricted to authorized student accounts.");
  }

  const schoolId = profile.school_id;
  const firstName = profile.first_name || "Student";
  const lastName = profile.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const schoolName = profile.schools?.name || "Achimota Basic School";
  const schoolCode = profile.schools?.code || "ABS-2026";

  // Query student record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentRec } = await (supabase.from("students") as any)
    .select("id, student_code, gender, date_of_birth, address, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  const studentId = studentRec?.id || "stu-1";
  const studentCode = studentRec?.student_code || "GES-STU";
  const gender = studentRec?.gender || "Not Specified";
  const dateOfBirth = studentRec?.date_of_birth || "—";
  const address = studentRec?.address || "Achimota, Accra";
  const accountStatus = studentRec?.status || (profile.is_active ? "active" : "inactive");

  // Query active enrollment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: enrData } = await (supabase.from("student_enrollments") as any)
    .select("class_id, academic_year_id, classes:class_id(name, grade_level), academic_years:academic_year_id(name)")
    .eq("student_id", studentId)
    .eq("school_id", schoolId)
    .maybeSingle();

  const className = enrData?.classes?.name || "Basic Class";
  const gradeLevel = enrData?.classes?.grade_level || "Basic";
  const academicYearName = enrData?.academic_years?.name || "2026/2027 Academic Year";

  return {
    id: user.id,
    studentId,
    studentCode,
    firstName,
    lastName,
    fullName,
    email: profile.email || user.email || "",
    phone: profile.phone || "",
    address,
    gender,
    dateOfBirth,
    avatarUrl: profile.avatar_url || null,
    className,
    gradeLevel,
    academicYearName,
    schoolName,
    schoolCode,
    accountStatus,
  };
}

export async function updateStudentContactInfo(info: { phone?: string; address?: string }): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) return { success: true };

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    // Update phone in profiles
    if (info.phone !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: pErr } = await (supabase.from("profiles") as any)
        .update({ phone: info.phone, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (pErr) return { success: false, error: pErr.message };
    }

    // Update address in students
    if (info.address !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: sErr } = await (supabase.from("students") as any)
        .update({ address: info.address })
        .eq("profile_id", user.id);

      if (sErr) return { success: false, error: sErr.message };
    }

    await recordAuditLog(
      "STUDENT_MODIFICATION",
      "students",
      user.id,
      `Student (${user.id}) updated contact information.`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update profile info";
    return { success: false, error: msg };
  }
}

export async function uploadStudentAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Image size must be 5MB or less." };
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: "Please upload a valid image file (JPEG, PNG, WEBP)." };
  }

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    const fakeUrl = URL.createObjectURL(file);
    return { success: true, avatarUrl: fakeUrl };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const fileExt = file.name.split(".").pop();
    const filePath = `student-avatars/${user.id}_${Date.now()}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadErr) return { success: false, error: uploadErr.message };

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = publicUrlData.publicUrl;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any).update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() }).eq("id", user.id);

    await recordAuditLog(
      "STUDENT_MODIFICATION",
      "students",
      user.id,
      `Student (${user.id}) updated profile photo.`
    );

    return { success: true, avatarUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Photo upload failed";
    return { success: false, error: msg };
  }
}

export async function changeStudentPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) return { success: true };

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required" };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };

    await recordAuditLog(
      "STUDENT_MODIFICATION",
      "profiles",
      user.id,
      `Student (${user.id}) updated account password.`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Password change failed";
    return { success: false, error: msg };
  }
}
