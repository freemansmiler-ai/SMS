import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export type AuditLogAction =
  | "LOGIN"
  | "LOGOUT"
  | "STUDENT_CREATION"
  | "STUDENT_MODIFICATION"
  | "TEACHER_CREATION"
  | "TEACHER_MODIFICATION"
  | "SCORE_CREATION"
  | "SCORE_MODIFICATION"
  | "SCORE_SUBMISSION"
  | "RESULT_APPROVAL"
  | "RESULT_REJECTION"
  | "RESULT_PUBLICATION"
  | "ATTENDANCE_MODIFICATION"
  | "ACCOUNT_DEACTIVATION"
  | "CLASS_CREATION"
  | "CLASS_MODIFICATION"
  | "CLASS_TEACHER_CHANGE"
  | "SUBJECT_CREATION"
  | "SUBJECT_MODIFICATION"
  | "SUBJECT_DELETION"
  | "ACADEMIC_YEAR_CREATION"
  | "ACADEMIC_YEAR_MODIFICATION"
  | "TERM_CREATION"
  | "TERM_MODIFICATION"
  | "SET_CURRENT_PERIOD"
  | "STUDENT_ENROLLMENT"
  | "ENROLLMENT_MODIFICATION"
  | "ENROLLMENT_WITHDRAWAL"
  | "TIMETABLE_CREATION"
  | "TIMETABLE_MODIFICATION"
  | "TIMETABLE_DELETION";

export interface AuditLogEntry {
  id: string;
  userName: string;
  userRole: string;
  action: AuditLogAction;
  entity: string;
  entityId: string;
  timestamp: string;
  details: string;
}

export async function fetchAuditLogs(filters?: {
  action?: string;
  entity?: string;
  roleScope?: string;
}): Promise<AuditLogEntry[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback for System Audit Trail
  if (config.isPlaceholder || !config.isConfigured) {
    const mockLogs: AuditLogEntry[] = [
      {
        id: "log-101",
        userName: "Dr. kpogli Freeman",
        userRole: "Headmaster",
        action: "RESULT_APPROVAL",
        entity: "results",
        entityId: "batch-math101-basic8a",
        timestamp: "Today, 10:15 AM",
        details: "Approved Term 1 Marksheets for Basic 8 - Section A (Core Mathematics).",
      },
      {
        id: "log-102",
        userName: "Abena Appiah",
        userRole: "Teacher",
        action: "SCORE_SUBMISSION",
        entity: "results",
        entityId: "batch-sci101-basic9b",
        timestamp: "Today, 09:45 AM",
        details: "Submitted Integrated Science marksheet batch for Headmaster review.",
      },
      {
        id: "log-103",
        userName: "Abena Appiah",
        userRole: "Teacher",
        action: "ATTENDANCE_MODIFICATION",
        entity: "attendance",
        entityId: "att-basic8a-20260808",
        timestamp: "Today, 08:30 AM",
        details: "Marked daily roll call for Basic 8 - Section A (37 Present, 1 Absent).",
      },
      {
        id: "log-104",
        userName: "Kofi Owusu-Ansah",
        userRole: "Administrator",
        action: "STUDENT_CREATION",
        entity: "student",
        entityId: "stu-105",
        timestamp: "Yesterday, 02:20 PM",
        details: "Enrolled new student Kwame Boateng into Basic 7 - Section A.",
      },
      {
        id: "log-105",
        userName: "Kofi Owusu-Ansah",
        userRole: "Administrator",
        action: "ACCOUNT_DEACTIVATION",
        entity: "teacher",
        entityId: "tch-203",
        timestamp: "06 Aug 2026, 04:10 PM",
        details: "Soft deactivated faculty account for Ama Osei with record preservation.",
      },
      {
        id: "log-106",
        userName: "Kwame Kyeremateng",
        userRole: "Student",
        action: "LOGIN",
        entity: "auth",
        entityId: "usr_student_01",
        timestamp: "05 Aug 2026, 08:00 AM",
        details: "Authenticated to student portal from IP 192.168.1.71.",
      },
    ];

    let filtered = mockLogs;
    if (filters?.action && filters.action !== "all") {
      filtered = filtered.filter((l) => l.action === filters.action);
    }
    if (filters?.entity && filters.entity !== "all") {
      filtered = filtered.filter((l) => l.entity === filters.entity);
    }
    if (filters?.roleScope === "principal") {
      // Principal sees executive audit items: approvals, score submissions, attendance
      filtered = filtered.filter(
        (l) =>
          l.action === "RESULT_APPROVAL" ||
          l.action === "RESULT_REJECTION" ||
          l.action === "RESULT_PUBLICATION" ||
          l.action === "SCORE_SUBMISSION" ||
          l.action === "ATTENDANCE_MODIFICATION"
      );
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("audit_logs") as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((l: any) => ({
      id: l.id,
      userName: l.user_name || "System User",
      userRole: l.user_role || "User",
      action: l.action as AuditLogAction,
      entity: l.entity_type || "system",
      entityId: l.entity_id || "N/A",
      timestamp: new Date(l.created_at || Date.now()).toLocaleString("en-GB"),
      details: typeof l.details === "object" ? JSON.stringify(l.details) : l.details || "",
    }));
  } catch {
    return [];
  }
}

export async function recordAuditLog(
  action: AuditLogAction,
  entity: string,
  entityId: string,
  details: string
): Promise<{ success: boolean }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("audit_logs") as any).insert({
      user_id: user?.id || null,
      action,
      entity_type: entity,
      entity_id: entityId,
      details,
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}
