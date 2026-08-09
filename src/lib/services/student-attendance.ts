import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface StudentAttendanceFilter {
  academicYearId?: string;
  termId?: string;
  startDate?: string;
  endDate?: string;
}

export interface StudentAttendanceRecordItem {
  id: string;
  date: string;
  className: string;
  status: "present" | "absent" | "late" | "excused";
  recordedBy: string;
  remarks?: string;
}

export interface MonthlyAttendanceSummary {
  monthName: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  totalSessions: number;
  attendanceRate: number;
}

export interface CalendarAttendanceDay {
  date: string;
  dayNumber: number;
  status: "present" | "absent" | "late" | "excused" | "unrecorded";
  label: string;
}

export interface StudentAttendanceAnalyticsOverview {
  studentName: string;
  studentCode: string;
  className: string;
  academicYearName: string;
  termName: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number | null;
  requiresAttention: boolean;
  attentionNotice?: string;
  history: StudentAttendanceRecordItem[];
  monthlySummaries: MonthlyAttendanceSummary[];
  calendarDays: CalendarAttendanceDay[];
  availableAcademicYears: Array<{ id: string; name: string }>;
  availableTerms: Array<{ id: string; name: string }>;
}

export async function fetchStudentAttendanceAnalytics(
  filters?: StudentAttendanceFilter
): Promise<StudentAttendanceAnalyticsOverview> {
  const config = getSupabaseEnvConfig();

  // Mock Fallback for Student Attendance (Kwame Kyeremateng)
  if (config.isPlaceholder || !config.isConfigured) {
    const history: StudentAttendanceRecordItem[] = [
      { id: "att-1", date: "2026-08-08", className: "Basic 8 - Section A", status: "present", recordedBy: "Abena Appiah" },
      { id: "att-2", date: "2026-08-07", className: "Basic 8 - Section A", status: "present", recordedBy: "Abena Appiah" },
      { id: "att-3", date: "2026-08-06", className: "Basic 8 - Section A", status: "late", recordedBy: "Abena Appiah", remarks: "Arrived at 8:15 AM" },
      { id: "att-4", date: "2026-08-05", className: "Basic 8 - Section A", status: "present", recordedBy: "Abena Appiah" },
      { id: "att-5", date: "2026-08-04", className: "Basic 8 - Section A", status: "absent", recordedBy: "Abena Appiah", remarks: "Unexcused" },
    ];

    return {
      studentName: "Kwame Kyeremateng",
      studentCode: "GES-2026-001",
      className: "Basic 8 - Section A",
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
      totalSessions: 38,
      presentCount: 36,
      absentCount: 1,
      lateCount: 1,
      excusedCount: 0,
      attendanceRate: 97.4,
      requiresAttention: false,
      history,
      monthlySummaries: [
        { monthName: "August 2026", presentCount: 18, absentCount: 1, lateCount: 1, excusedCount: 0, totalSessions: 20, attendanceRate: 95.0 },
        { monthName: "July 2026", presentCount: 18, absentCount: 0, lateCount: 0, excusedCount: 0, totalSessions: 18, attendanceRate: 100.0 },
      ],
      calendarDays: [
        { date: "2026-08-01", dayNumber: 1, status: "present", label: "✓ Present" },
        { date: "2026-08-02", dayNumber: 2, status: "present", label: "✓ Present" },
        { date: "2026-08-04", dayNumber: 4, status: "absent", label: "✕ Absent" },
        { date: "2026-08-06", dayNumber: 6, status: "late", label: "L Late" },
        { date: "2026-08-08", dayNumber: 8, status: "present", label: "✓ Present" },
      ],
      availableAcademicYears: [{ id: "ay-2026", name: "2026/2027 Academic Year" }],
      availableTerms: [{ id: "t-1", name: "Term 1" }],
    };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    // Retrieve user profile and confirm student role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("first_name, last_name, role, school_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "student") {
      throw new Error("UNAUTHORIZED: Access restricted to authorized student accounts.");
    }

    const schoolId = profile.school_id;
    const studentName = `${profile.first_name || "Student"} ${profile.last_name || ""}`.trim();

    // Query student record linked to auth profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: studentRec } = await (supabase.from("students") as any)
      .select("id, student_code")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!studentRec) throw new Error("Student profile record not found.");

    const studentId = studentRec.id;
    const studentCode = studentRec.student_code || "GES-STU";

    // Query available academic years & terms
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ayData } = await (supabase.from("academic_years") as any).select("id, name").eq("school_id", schoolId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: termsData } = await (supabase.from("terms") as any).select("id, name").eq("school_id", schoolId);

    const availableAcademicYears = ayData || [{ id: "ay-1", name: "2026/2027 Academic Year" }];
    const availableTerms = termsData || [{ id: "t-1", name: "Term 1" }];

    // Query historical enrollment for selected academic period
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let enrQuery = (supabase.from("student_enrollments") as any)
      .select("class_id, classes:class_id(name)")
      .eq("student_id", studentId)
      .eq("school_id", schoolId);

    if (filters?.academicYearId) enrQuery = enrQuery.eq("academic_year_id", filters.academicYearId);
    const { data: enrData } = await enrQuery.maybeSingle();
    const className = enrData?.classes?.name || "Basic Class";

    // Query attendance records FOR THIS AUTHENTICATED STUDENT ONLY
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let attQuery = (supabase.from("attendance") as any)
      .select(`
        id,
        date,
        status,
        remarks,
        class_id,
        classes:class_id(name),
        teachers:teacher_id(profiles:profile_id(first_name, last_name))
      `)
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .order("date", { ascending: false });

    if (filters?.academicYearId) attQuery = attQuery.eq("academic_year_id", filters.academicYearId);
    if (filters?.termId) attQuery = attQuery.eq("term_id", filters.termId);
    if (filters?.startDate) attQuery = attQuery.gte("date", filters.startDate);
    if (filters?.endDate) attQuery = attQuery.lte("date", filters.endDate);

    const { data: attData } = await attQuery;
    const rawAtt = attData || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history: StudentAttendanceRecordItem[] = rawAtt.map((a: any) => {
      const tProf = a.teachers?.profiles;
      const recBy = tProf ? `${tProf.first_name} ${tProf.last_name}` : "Faculty Teacher";
      return {
        id: a.id,
        date: a.date,
        className: a.classes?.name || className,
        status: a.status || "present",
        recordedBy: recBy,
        remarks: a.remarks || undefined,
      };
    });

    const totalSessions = history.length;
    const presentCount = history.filter((h) => h.status === "present").length;
    const absentCount = history.filter((h) => h.status === "absent").length;
    const lateCount = history.filter((h) => h.status === "late").length;
    const excusedCount = history.filter((h) => h.status === "excused").length;

    const attendanceRate = totalSessions > 0 ? Number((((presentCount + lateCount) / totalSessions) * 100).toFixed(1)) : null;
    const requiresAttention = attendanceRate !== null && attendanceRate < 85;
    const attentionNotice = requiresAttention
      ? "Your attendance rate for this term is below the school's configured 85% attendance threshold."
      : undefined;

    // Monthly aggregation
    const monthMap = new Map<string, { present: number; absent: number; late: number; excused: number; total: number }>();
    history.forEach((h) => {
      const d = new Date(h.date);
      const monthKey = d.toLocaleString("default", { month: "long", year: "numeric" });
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });
      }
      const m = monthMap.get(monthKey)!;
      m.total++;
      if (h.status === "present") m.present++;
      else if (h.status === "absent") m.absent++;
      else if (h.status === "late") m.late++;
      else if (h.status === "excused") m.excused++;
    });

    const monthlySummaries: MonthlyAttendanceSummary[] = Array.from(monthMap.entries()).map(([monthName, m]) => ({
      monthName,
      presentCount: m.present,
      absentCount: m.absent,
      lateCount: m.late,
      excusedCount: m.excused,
      totalSessions: m.total,
      attendanceRate: Number((((m.present + m.late) / m.total) * 100).toFixed(1)),
    }));

    // Calendar grid formatting
    const calendarDays: CalendarAttendanceDay[] = history.slice(0, 31).map((h) => {
      const d = new Date(h.date);
      let label = "✓ Present";
      if (h.status === "absent") label = "✕ Absent";
      else if (h.status === "late") label = "L Late";
      else if (h.status === "excused") label = "E Excused";

      return {
        date: h.date,
        dayNumber: d.getDate() || 1,
        status: h.status,
        label,
      };
    });

    return {
      studentName,
      studentCode,
      className,
      academicYearName: availableAcademicYears[0]?.name || "2026/2027 Academic Year",
      termName: availableTerms[0]?.name || "Term 1",
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendanceRate,
      requiresAttention,
      attentionNotice,
      history,
      monthlySummaries,
      calendarDays,
      availableAcademicYears,
      availableTerms,
    };
  } catch {
    return {
      studentName: "Student User",
      studentCode: "GES-STU",
      className: "Basic Class",
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
      totalSessions: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
      attendanceRate: null,
      requiresAttention: false,
      history: [],
      monthlySummaries: [],
      calendarDays: [],
      availableAcademicYears: [],
      availableTerms: [],
    };
  }
}
