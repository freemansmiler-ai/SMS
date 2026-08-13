import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

// DB enum values for target_audience: 'all' | 'teachers' | 'students' | 'parents'
// UI display labels map to these values
export type TargetAudience = "Entire School" | "Teachers" | "Students" | "Specific Classes";
export type AnnouncementStatus = "draft" | "published";

// Maps UI TargetAudience labels to the DB enum values
const AUDIENCE_TO_DB: Record<TargetAudience, string> = {
  "Entire School": "all",
  "Teachers": "teachers",
  "Students": "students",
  "Specific Classes": "students", // closest match; DB has no class-specific audience
};

// Maps DB enum values back to UI labels
const DB_TO_AUDIENCE: Record<string, TargetAudience> = {
  "all": "Entire School",
  "teachers": "Teachers",
  "students": "Students",
  "parents": "Students", // treat parents as students audience in UI
};

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
        author: "Dr. kpogli Freeman",
        authorRole: "Headmaster",
        date: "08 Aug 2026",
        targetAudience: "Entire School",
        status: "published",
      },
      {
        id: "ann-102",
        title: "Staff Meeting: GES Curriculum Standards Review",
        content: "All subject teachers and department heads are requested to attend a mandatory staff review meeting in the Main Conference Room on Friday at 02:30 PM.",
        author: "Dr. kpogli Freeman",
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
    // Only select columns that actually exist in the DB.
    // The announcements table has: id, title, content, target_audience, is_published, school_id, created_at
    // Missing (not in DB): status, author, author_role, target_class_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("announcements") as any)
      .select("id, title, content, target_audience, is_published, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    // Filter by audience role — use DB lowercase enum values
    if (filters?.role === "teacher") {
      query = query.in("target_audience", ["all", "teachers"]);
    } else if (filters?.role === "student") {
      query = query.in("target_audience", ["all", "students"]);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((a: any) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      author: "School Administration",
      authorRole: "Administrator",
      date: new Date(a.created_at || Date.now()).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      targetAudience: (DB_TO_AUDIENCE[a.target_audience] || "Entire School") as TargetAudience,
      targetClassId: undefined,
      status: "published" as AnnouncementStatus,
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
    // Get school_id from the current user's profile — required by RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("school_id")
      .eq("id", user.id)
      .single();

    if (!profile?.school_id) return { success: false, error: "School context not found." };

    // Only insert columns that exist in the DB:
    // id, title, content, target_audience, is_published, school_id, author_id, created_at, updated_at
    // Columns NOT in DB (omitted): status, author, author_role, target_class_id
    // target_audience must be a DB enum value: 'all' | 'teachers' | 'students' | 'parents'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("announcements") as any).insert({
      school_id: profile.school_id,
      author_id: user.id,
      title: item.title,
      content: item.content,
      target_audience: AUDIENCE_TO_DB[item.targetAudience] || "all",
      is_published: item.status === "published",
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
