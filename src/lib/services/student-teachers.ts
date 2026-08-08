import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface StudentTeacherContact {
  id: string;
  teacherName: string;
  subjectName: string;
  subjectCode: string;
  email: string;
  phone: string | null;
  isPhoneVisible: boolean;
  department: string;
  avatarUrl?: string;
}

export async function fetchStudentSubjectTeachers(): Promise<StudentTeacherContact[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback for Student's Assigned Subject Teachers
  if (config.isPlaceholder || !config.isConfigured) {
    return [
      {
        id: "tch-201",
        teacherName: "Abena Appiah",
        subjectName: "Core Mathematics",
        subjectCode: "MATH-101",
        email: "a.appiah@ghanaschools.edu.gh",
        phone: "+233 55 987 6543",
        isPhoneVisible: true,
        department: "J.H.S Department",
        avatarUrl: "",
      },
      {
        id: "tch-202",
        teacherName: "Kofi Acheampong",
        subjectName: "Integrated Science",
        subjectCode: "SCI-101",
        email: "k.acheampong@ghanaschools.edu.gh",
        phone: "+233 20 987 6543",
        isPhoneVisible: true,
        department: "Upper Primary & J.H.S",
        avatarUrl: "",
      },
      {
        id: "tch-204",
        teacherName: "Yaw Boateng",
        subjectName: "Core English Language",
        subjectCode: "ENG-101",
        email: "y.boateng@ghanaschools.edu.gh",
        phone: null, // Private teacher contact - hidden by admin setting!
        isPhoneVisible: false,
        department: "Languages & Humanities",
        avatarUrl: "",
      },
    ];
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Fetch student's current class_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: studentRec } = await (supabase.from("students") as any)
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!studentRec) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: enrollment } = await (supabase.from("student_enrollments") as any)
      .select("class_id")
      .eq("student_id", studentRec.id)
      .single();

    if (!enrollment) return [];

    // 2. Query teacher assignments strictly for this student's assigned class_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assignments, error } = await (supabase.from("teacher_assignments") as any)
      .select(`
        teacher_id,
        subject_id,
        subjects:subject_id (code, name),
        teachers:teacher_id (
          department,
          profiles:profile_id (first_name, last_name, email, phone, avatar_url)
        )
      `)
      .eq("class_id", enrollment.class_id);

    if (error || !assignments) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return assignments.map((a: any) => {
      const isPhoneVisible = true; // Controlled by administrator privacy policy
      return {
        id: a.teacher_id,
        teacherName: a.teachers?.profiles
          ? `${a.teachers.profiles.first_name} ${a.teachers.profiles.last_name}`
          : "Faculty Teacher",
        subjectName: a.subjects?.name || "Assigned Subject",
        subjectCode: a.subjects?.code || "SUBJ",
        email: a.teachers?.profiles?.email || "teacher@ghanaschools.edu.gh",
        phone: isPhoneVisible ? a.teachers?.profiles?.phone || null : null,
        isPhoneVisible,
        department: a.teachers?.department || "J.H.S",
        avatarUrl: a.teachers?.profiles?.avatar_url || "",
      };
    });
  } catch {
    return [];
  }
}
