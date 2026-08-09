import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "./audit-logs";

export interface TeacherFullProfile {
  id: string; // Teacher ID
  profileId: string;
  schoolId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  qualification: string;
  joiningDate: string;
  isActive: boolean;
  avatarUrl?: string;
  subjectCount: number;
  classCount: number;
  currentAcademicYear: string;
  currentTerm: string;
}

export interface UpdateTeacherProfilePayload {
  phone?: string;
  avatarUrl?: string;
}

export async function fetchCurrentTeacherFullProfile(): Promise<TeacherFullProfile | null> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return {
      id: "tch-201",
      profileId: "prof-201",
      schoolId: "sch-01",
      employeeCode: "GES-TCH-2026-001",
      firstName: "Abena",
      lastName: "Appiah",
      email: "a.appiah@ghanaschools.edu.gh",
      phone: "+233 24 123 4567",
      department: "Mathematics & Science",
      qualification: "B.Ed. Mathematics",
      joiningDate: "2022-09-01",
      isActive: true,
      avatarUrl: "",
      subjectCount: 2,
      classCount: 3,
      currentAcademicYear: "2026/2027 Academic Year",
      currentTerm: "Term 1",
    };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("id, school_id, email, first_name, last_name, phone, role, is_active, avatar_url")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "teacher") return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teacherRec } = await (supabase.from("teachers") as any)
      .select("id, employee_code, department, qualification, joining_date")
      .eq("profile_id", user.id)
      .eq("school_id", profile.school_id)
      .single();

    if (!teacherRec) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assignments } = await (supabase.from("teacher_assignments") as any)
      .select("subject_id, class_id")
      .eq("teacher_id", teacherRec.id)
      .eq("school_id", profile.school_id);

    const subjectSet = new Set((assignments || []).map((a: { subject_id: string }) => a.subject_id));
    const classSet = new Set((assignments || []).map((a: { class_id: string }) => a.class_id));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: settings } = await (supabase.from("school_settings") as any)
      .select("current_academic_year_id, current_term_id, academic_years:current_academic_year_id(name), terms:current_term_id(name)")
      .eq("school_id", profile.school_id)
      .maybeSingle();

    return {
      id: teacherRec.id,
      profileId: profile.id,
      schoolId: profile.school_id,
      employeeCode: teacherRec.employee_code,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      phone: profile.phone || "",
      department: teacherRec.department || "General",
      qualification: teacherRec.qualification || "B.Ed",
      joiningDate: teacherRec.joining_date || "2024-09-01",
      isActive: Boolean(profile.is_active),
      avatarUrl: profile.avatar_url || "",
      subjectCount: subjectSet.size,
      classCount: classSet.size,
      currentAcademicYear: settings?.academic_years?.name || "2026/2027 Academic Year",
      currentTerm: settings?.terms?.name || "Term 1",
    };
  } catch {
    return null;
  }
}

export async function updateTeacherProfileInfo(
  payload: UpdateTeacherProfilePayload
): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required to update profile." };

    // Update ONLY permitted profile fields (phone, avatar_url)
    // Protected fields (role, school_id, is_active, etc.) are omitted from the update payload.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("profiles") as any)
      .update({
        phone: payload.phone !== undefined ? payload.phone : undefined,
        avatar_url: payload.avatarUrl !== undefined ? payload.avatarUrl : undefined,
      })
      .eq("id", user.id);

    if (error) return { success: false, error: error.message };

    // Audit log
    await recordAuditLog(
      "TEACHER_MODIFICATION",
      "profiles",
      user.id,
      `Teacher (${user.id}) updated profile contact info / avatar`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Profile update failed";
    return { success: false, error: msg };
  }
}

export async function uploadTeacherPhoto(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  // Validate file size (<= 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File size must be 5MB or less." };
  }

  // Validate image type
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Only image files (JPEG, PNG, WebP) are allowed." };
  }

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true, url: "/placeholder-avatar.png" };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required to upload photo." };

    const fileExt = file.name.split(".").pop();
    const filePath = `teacher-photos/${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadErr) {
      // Fallback: update profile with data URL or return error
      return { success: false, error: uploadErr.message };
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    // Save avatar URL to profile
    await updateTeacherProfileInfo({ avatarUrl: publicUrl });

    return { success: true, url: publicUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return { success: false, error: msg };
  }
}

export async function updateTeacherPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { must_change_password: false },
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Password update failed";
    return { success: false, error: msg };
  }
}
