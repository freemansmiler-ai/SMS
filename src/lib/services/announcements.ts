import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export type TargetAudience = "Entire School" | "Teachers" | "Students" | "Specific Classes";
export type AnnouncementStatus = "draft" | "published";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  targetAudience: TargetAudience;
  targetClassId?: string;
  targetClassName?: string;
  status: AnnouncementStatus;
}

export async function fetchAnnouncements(filters?: {
  role?: string;
  classId?: string;
  status?: string;
}): Promise<AnnouncementItem[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback for School Announcement System
  if (config.isPlaceholder || !config.isConfigured) {
    const mockAnnouncements: AnnouncementItem[] = [
      {
        id: "ann-101",
        title: "Term 1 BECE & Terminal Examination Schedule",
        content: "Continuous assessment and mock terminal examinations for Basic 8 & Basic 9 students begin next Monday at 08:00 AM. All subject teachers should submit final question drafts.",
        author: "Rev. Emmanuel Mensah",
        authorRole: "Headmaster",
        date: "08 Aug 2026",
        targetAudience: "Entire School",
        status: "published",
      },
      {
        id: "ann-102",
        title: "Staff Meeting: GES Curriculum Standards Review",
        content: "All subject teachers and department heads are requested to attend a mandatory staff review meeting in the Main Conference Room on Friday at 02:30 PM.",
        author: "Rev. Emmanuel Mensah",
        authorRole: "Headmaster",
        date: "06 Aug 2026",
        targetAudience: "Teachers",
        status: "published",
      },
      {
        id: "ann-103",
        title: "National Science & Maths Quiz Intra-School Trials",
        content: "All interested J.H.S students are invited to register for team selection trials with the Integrated Science department.",
        author: "Kofi Owusu-Ansah",
        authorRole: "Administrator",
        date: "04 Aug 2026",
        targetAudience: "Students",
        status: "published",
      },
      {
        id: "ann-104",
        title: "Basic 8 Mathematics Project Work Guidelines",
        content: "Students in Basic 8 - Section A are reminded to submit their practical project work folders before the end of this week.",
        author: "Abena Appiah",
        authorRole: "Subject Teacher",
        date: "02 Aug 2026",
        targetAudience: "Specific Classes",
        targetClassId: "class-basic8a",
        targetClassName: "Basic 8 - Section A",
        status: "published",
      },
    ];

    let filtered = mockAnnouncements;
    if (filters?.role === "teacher") {
      filtered = filtered.filter(
        (a) => a.targetAudience === "Entire School" || a.targetAudience === "Teachers"
      );
    } else if (filters?.role === "student") {
      filtered = filtered.filter(
        (a) =>
          a.targetAudience === "Entire School" ||
          a.targetAudience === "Students" ||
          (a.targetAudience === "Specific Classes" &&
            (filters.classId ? a.targetClassId === filters.classId : true))
      );
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("announcements") as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((a: any) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      author: a.author || "School Administration",
      authorRole: a.author_role || "Administrator",
      date: new Date(a.created_at || Date.now()).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      targetAudience: a.target_audience as TargetAudience,
      targetClassId: a.target_class_id,
      status: a.status as AnnouncementStatus,
    }));
  } catch {
    return [];
  }
}

export async function createAnnouncement(
  item: Omit<AnnouncementItem, "id">
): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("announcements") as any).insert({
      title: item.title,
      content: item.content,
      author: item.author,
      author_role: item.authorRole,
      target_audience: item.targetAudience,
      target_class_id: item.targetClassId || null,
      status: item.status,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to publish announcement";
    return { success: false, error: msg };
  }
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("announcements") as any).delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return { success: false, error: msg };
  }
}
