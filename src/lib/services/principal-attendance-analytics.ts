import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface AttendanceAnalyticsFilter {
  academicYearId?: string;
  termId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
  teacherId?: string;
  studentId?: string;
}

export interface OverallAttendanceMetrics {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
  absenceRate: number;
  lateRate: number;
  excusedRate: number;
}

export interface ClassAttendanceStatItem {
  classId: string;
  className: string;
  gradeLevel: string;
  enrolledStudents: number;
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
}

export interface StudentAttendanceAttentionItem {
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
  status: "Requires Attention" | "Good";
}

export interface TeacherAttendanceActivityItem {
  teacherId: string;
  teacherName: string;
  department: string;
  sessionsRecorded: number;
  classesCovered: number;
  lastRecordingDate: string;
}

export interface PrincipalAttendanceAnalyticsOverview {
  metrics: OverallAttendanceMetrics;
  classBreakdown: ClassAttendanceStatItem[];
  studentAttentionList: StudentAttendanceAttentionItem[];
  teacherActivityList: TeacherAttendanceActivityItem[];
  academicYearName: string;
  termName: string;
}

export async function fetchPrincipalAttendanceAnalytics(
  filters?: AttendanceAnalyticsFilter
): Promise<PrincipalAttendanceAnalyticsOverview> {
  const config = getSupabaseEnvConfig();

  // Mock Fallback for Executive Attendance Analytics
  if (config.isPlaceholder || !config.isConfigured) {
    return {
      metrics: {
        totalRecords: 1120,
        presentCount: 1042,
        absentCount: 38,
        lateCount: 28,
        excusedCount: 12,
        attendanceRate: 95.5,
        absenceRate: 3.4,
        lateRate: 2.5,
        excusedRate: 1.1,
      },
      classBreakdown: [
        { classId: "class-basic7a", className: "Basic 7 - Section A", gradeLevel: "Basic 7", enrolledStudents: 35, totalRecords: 350, presentCount: 330, absentCount: 12, lateCount: 6, excusedCount: 2, attendanceRate: 96.0 },
        { classId: "class-basic8a", className: "Basic 8 - Section A", gradeLevel: "Basic 8", enrolledStudents: 38, totalRecords: 380, presentCount: 355, absentCount: 14, lateCount: 8, excusedCount: 3, attendanceRate: 95.5 },
        { classId: "class-basic9b", className: "Basic 9 - Section B", gradeLevel: "Basic 9", enrolledStudents: 35, totalRecords: 390, presentCount: 357, absentCount: 12, lateCount: 14, excusedCount: 7, attendanceRate: 95.1 },
      ],
      studentAttentionList: [
        { studentId: "stu-103", studentCode: "GES-2026-003", studentName: "Kofi Acheampong Jr.", className: "Basic 8 - Section A", totalSessions: 20, presentCount: 14, absentCount: 4, lateCount: 2, excusedCount: 0, attendanceRate: 80.0, status: "Requires Attention" },
      ],
      teacherActivityList: [
        { teacherId: "tch-201", teacherName: "Abena Appiah", department: "Mathematics & Science", sessionsRecorded: 42, classesCovered: 2, lastRecordingDate: "Today" },
        { teacherId: "tch-202", teacherName: "Kofi Boateng", department: "Languages", sessionsRecorded: 38, classesCovered: 3, lastRecordingDate: "Yesterday" },
      ],
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
    };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "principal") {
      throw new Error("UNAUTHORIZED: Principal access required.");
    }

    const schoolId = profile.school_id;

    // Fetch school settings for academic year and term
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: settings } = await (supabase.from("school_settings") as any)
      .select("current_academic_year_id, current_term_id, academic_years:current_academic_year_id(name), terms:current_term_id(name)")
      .eq("school_id", schoolId)
      .maybeSingle();

    const academicYearName = settings?.academic_years?.name || "2026/2027 Academic Year";
    const termName = settings?.terms?.name || "Term 1";

    // Query attendance records for school_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let attQuery = (supabase.from("attendance") as any)
      .select(`
        id,
        student_id,
        class_id,
        teacher_id,
        academic_year_id,
        term_id,
        date,
        status,
        remarks,
        students:student_id (
          student_code,
          profiles:profile_id (first_name, last_name)
        ),
        classes:class_id (name, grade_level),
        teachers:teacher_id (
          department,
          profiles:profile_id (first_name, last_name)
        )
      `)
      .eq("school_id", schoolId);

    if (filters?.classId && filters.classId !== "all") attQuery = attQuery.eq("class_id", filters.classId);
    if (filters?.teacherId && filters.teacherId !== "all") attQuery = attQuery.eq("teacher_id", filters.teacherId);
    if (filters?.studentId) attQuery = attQuery.eq("student_id", filters.studentId);
    if (filters?.startDate) attQuery = attQuery.gte("date", filters.startDate);
    if (filters?.endDate) attQuery = attQuery.lte("date", filters.endDate);
    if (filters?.academicYearId) attQuery = attQuery.eq("academic_year_id", filters.academicYearId);
    if (filters?.termId) attQuery = attQuery.eq("term_id", filters.termId);

    const { data: attData } = await attQuery;
    const records = attData || [];

    if (records.length === 0) {
      return {
        metrics: { totalRecords: 0, presentCount: 0, absentCount: 0, lateCount: 0, excusedCount: 0, attendanceRate: 0, absenceRate: 0, lateRate: 0, excusedRate: 0 },
        classBreakdown: [],
        studentAttentionList: [],
        teacherActivityList: [],
        academicYearName,
        termName,
      };
    }

    const totalRecords = records.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presentCount = records.filter((r: any) => r.status === "present").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const absentCount = records.filter((r: any) => r.status === "absent").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lateCount = records.filter((r: any) => r.status === "late").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const excusedCount = records.filter((r: any) => r.status === "excused").length;

    const attendanceRate = Number((((presentCount + lateCount) / totalRecords) * 100).toFixed(1));
    const absenceRate = Number(((absentCount / totalRecords) * 100).toFixed(1));
    const lateRate = Number(((lateCount / totalRecords) * 100).toFixed(1));
    const excusedRate = Number(((excusedCount / totalRecords) * 100).toFixed(1));

    // Class breakdown Map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records.forEach((r: any) => {
      const cid = r.class_id;
      if (!classMap.has(cid)) {
        classMap.set(cid, {
          classId: cid,
          className: r.classes?.name || "Class",
          gradeLevel: r.classes?.grade_level || "Basic",
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          studentsSet: new Set<string>(),
          total: 0,
        });
      }
      const c = classMap.get(cid);
      c.total++;
      c.studentsSet.add(r.student_id);
      if (r.status === "present") c.present++;
      else if (r.status === "absent") c.absent++;
      else if (r.status === "late") c.late++;
      else if (r.status === "excused") c.excused++;
    });

    const classBreakdown: ClassAttendanceStatItem[] = Array.from(classMap.values()).map((c) => ({
      classId: c.classId,
      className: c.className,
      gradeLevel: c.gradeLevel,
      enrolledStudents: c.studentsSet.size,
      totalRecords: c.total,
      presentCount: c.present,
      absentCount: c.absent,
      lateCount: c.late,
      excusedCount: c.excused,
      attendanceRate: Number((((c.present + c.late) / c.total) * 100).toFixed(1)),
    }));

    // Student Attendance Map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studentMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records.forEach((r: any) => {
      const stid = r.student_id;
      if (!studentMap.has(stid)) {
        const sProf = r.students?.profiles;
        const name = sProf ? `${sProf.first_name} ${sProf.last_name}` : "Student";
        studentMap.set(stid, {
          studentId: stid,
          studentCode: r.students?.student_code || "GES-STU",
          studentName: name,
          className: r.classes?.name || "Class",
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
        });
      }
      const s = studentMap.get(stid);
      s.total++;
      if (r.status === "present") s.present++;
      else if (r.status === "absent") s.absent++;
      else if (r.status === "late") s.late++;
      else if (r.status === "excused") s.excused++;
    });

    const studentAttentionList: StudentAttendanceAttentionItem[] = Array.from(studentMap.values()).map((s) => {
      const rate = Number((((s.present + s.late) / s.total) * 100).toFixed(1));
      const status: "Requires Attention" | "Good" = rate < 85 || s.absent >= 3 ? "Requires Attention" : "Good";

      return {
        studentId: s.studentId,
        studentCode: s.studentCode,
        studentName: s.studentName,
        className: s.className,
        totalSessions: s.total,
        presentCount: s.present,
        absentCount: s.absent,
        lateCount: s.late,
        excusedCount: s.excused,
        attendanceRate: rate,
        status,
      };
    });

    const attentionOnly = studentAttentionList.filter((s) => s.status === "Requires Attention");

    // Teacher Attendance Activity Map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teacherMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records.forEach((r: any) => {
      if (!r.teacher_id) return;
      const tid = r.teacher_id;
      if (!teacherMap.has(tid)) {
        const tProf = r.teachers?.profiles;
        const name = tProf ? `${tProf.first_name} ${tProf.last_name}` : "Teacher";
        teacherMap.set(tid, {
          teacherId: tid,
          teacherName: name,
          department: r.teachers?.department || "General",
          sessionsCount: 0,
          classesSet: new Set<string>(),
          lastDate: r.date,
        });
      }
      const t = teacherMap.get(tid);
      t.sessionsCount++;
      t.classesSet.add(r.class_id);
      if (r.date > t.lastDate) t.lastDate = r.date;
    });

    const teacherActivityList: TeacherAttendanceActivityItem[] = Array.from(teacherMap.values()).map((t) => ({
      teacherId: t.teacherId,
      teacherName: t.teacherName,
      department: t.department,
      sessionsRecorded: t.sessionsCount,
      classesCovered: t.classesSet.size,
      lastRecordingDate: t.lastDate,
    }));

    return {
      metrics: {
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate,
        absenceRate,
        lateRate,
        excusedRate,
      },
      classBreakdown,
      studentAttentionList: attentionOnly.length > 0 ? attentionOnly : studentAttentionList.slice(0, 3),
      teacherActivityList,
      academicYearName,
      termName,
    };
  } catch {
    return {
      metrics: { totalRecords: 0, presentCount: 0, absentCount: 0, lateCount: 0, excusedCount: 0, attendanceRate: 0, absenceRate: 0, lateRate: 0, excusedRate: 0 },
      classBreakdown: [],
      studentAttentionList: [],
      teacherActivityList: [],
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
    };
  }
}
