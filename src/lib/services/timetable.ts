import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "./audit-logs";

export type WeekDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface TimetableSlot {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
  day: WeekDay;
  startTime: string; // e.g. "08:00 AM"
  endTime: string;   // e.g. "09:00 AM"
  room: string;      // e.g. "Room B8-A"
}

export const DAYS_OF_WEEK: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const DAY_TO_NUMBER: Record<WeekDay, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

const NUMBER_TO_DAY: Record<number, WeekDay> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
};

export const TIME_SLOTS = [
  { start: "08:00 AM", end: "09:00 AM" },
  { start: "09:00 AM", end: "10:00 AM" },
  { start: "10:00 AM", end: "10:30 AM" }, // Break
  { start: "10:30 AM", end: "11:30 AM" },
  { start: "11:30 AM", end: "12:30 PM" },
  { start: "12:30 PM", end: "01:30 PM" }, // Lunch
  { start: "01:30 PM", end: "02:30 PM" },
];

export async function fetchTimetableSlots(filters?: {
  classId?: string;
  teacherId?: string;
  day?: string;
}): Promise<TimetableSlot[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback for School Master Timetable
  if (config.isPlaceholder || !config.isConfigured) {
    const mockSlots: TimetableSlot[] = [
      {
        id: "slot-101",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        subjectId: "subj-math101",
        subjectName: "Core Mathematics",
        subjectCode: "MATH-101",
        teacherId: "tch-201",
        teacherName: "Abena Appiah",
        day: "Monday",
        startTime: "08:00 AM",
        endTime: "09:00 AM",
        room: "Room B8-A",
      },
      {
        id: "slot-102",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        subjectId: "subj-sci101",
        subjectName: "Integrated Science",
        subjectCode: "SCI-101",
        teacherId: "tch-202",
        teacherName: "Kofi Acheampong",
        day: "Monday",
        startTime: "09:00 AM",
        endTime: "10:00 AM",
        room: "Science Lab 1",
      },
      {
        id: "slot-103",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        subjectId: "subj-eng101",
        subjectName: "Core English Language",
        subjectCode: "ENG-101",
        teacherId: "tch-204",
        teacherName: "Yaw Boateng",
        day: "Monday",
        startTime: "10:30 AM",
        endTime: "11:30 AM",
        room: "Room B8-A",
      },
      {
        id: "slot-104",
        classId: "class-basic9b",
        className: "Basic 9 - Section B",
        subjectId: "subj-sci101",
        subjectName: "Integrated Science",
        subjectCode: "SCI-101",
        teacherId: "tch-201",
        teacherName: "Abena Appiah",
        day: "Tuesday",
        startTime: "08:00 AM",
        endTime: "09:00 AM",
        room: "Science Lab 1",
      },
      {
        id: "slot-105",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        subjectId: "subj-math101",
        subjectName: "Core Mathematics",
        subjectCode: "MATH-101",
        teacherId: "tch-201",
        teacherName: "Abena Appiah",
        day: "Wednesday",
        startTime: "08:00 AM",
        endTime: "09:00 AM",
        room: "Room B8-A",
      },
      {
        id: "slot-106",
        classId: "class-basic8a",
        className: "Basic 8 - Section A",
        subjectId: "subj-ict101",
        subjectName: "Information & Comms Tech (ICT)",
        subjectCode: "ICT-101",
        teacherId: "tch-203",
        teacherName: "Ama Osei",
        day: "Friday",
        startTime: "08:00 AM",
        endTime: "09:00 AM",
        room: "ICT Lab 2",
      },
    ];

    let filtered = mockSlots;
    if (filters?.classId && filters.classId !== "all") {
      filtered = filtered.filter((s) => s.classId === filters.classId);
    }
    if (filters?.teacherId && filters.teacherId !== "all") {
      filtered = filtered.filter((s) => s.teacherId === filters.teacherId);
    }
    if (filters?.day && filters.day !== "all") {
      filtered = filtered.filter((s) => s.day === filters.day);
    }
    return filtered;
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("timetables") as any)
      .select(`
        id,
        school_id,
        class_id,
        subject_id,
        teacher_id,
        term_id,
        day_of_week,
        start_time,
        end_time,
        room_number,
        classes:class_id (name),
        subjects:subject_id (code, name),
        teachers:teacher_id (profiles:profile_id (first_name, last_name))
      `);

    if (filters?.classId && filters.classId !== "all") {
      query = query.eq("class_id", filters.classId);
    }
    if (filters?.teacherId && filters.teacherId !== "all") {
      query = query.eq("teacher_id", filters.teacherId);
    }
    if (filters?.day && filters.day !== "all" && DAY_TO_NUMBER[filters.day as WeekDay]) {
      query = query.eq("day_of_week", DAY_TO_NUMBER[filters.day as WeekDay]);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((s: any) => ({
      id: s.id,
      classId: s.class_id,
      className: s.classes?.name || "Basic Class",
      subjectId: s.subject_id,
      subjectName: s.subjects?.name || "Subject",
      subjectCode: s.subjects?.code || "SUBJ",
      teacherId: s.teacher_id,
      teacherName: s.teachers?.profiles
        ? `${s.teachers.profiles.first_name} ${s.teachers.profiles.last_name}`
        : "Faculty Teacher",
      day: NUMBER_TO_DAY[s.day_of_week as number] || "Monday",
      startTime: s.start_time,
      endTime: s.end_time,
      room: s.room_number || "Classroom",
    }));
  } catch {
    return [];
  }
}

export async function createTimetableSlot(
  newSlot: Omit<TimetableSlot, "id">
): Promise<{ success: boolean; error?: string }> {
  // 1. Conflict Check: Teacher Double-Booking
  const existingSlots = await fetchTimetableSlots();
  const teacherConflict = existingSlots.find(
    (s) =>
      s.teacherId === newSlot.teacherId &&
      s.day === newSlot.day &&
      s.startTime === newSlot.startTime
  );

  if (teacherConflict) {
    return {
      success: false,
      error: `Timetable Conflict: ${newSlot.teacherName} is already assigned to teach ${teacherConflict.className} (${teacherConflict.subjectName}) on ${newSlot.day} at ${newSlot.startTime}.`,
    };
  }

  // 2. Conflict Check: Room Double-Booking
  const roomConflict = existingSlots.find(
    (s) =>
      s.room === newSlot.room &&
      s.day === newSlot.day &&
      s.startTime === newSlot.startTime
  );

  if (roomConflict) {
    return {
      success: false,
      error: `Room Conflict: ${newSlot.room} is already reserved for ${roomConflict.className} on ${newSlot.day} at ${newSlot.startTime}.`,
    };
  }

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Authentication required to create timetable entries." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let adminProfile: any = null;
    if (user?.id) {
      const { data } = await (supabase.from("profiles") as any)
        .select("school_id, role")
        .eq("id", user.id)
        .maybeSingle();
      adminProfile = data;
    }

    const effectiveRole = adminProfile?.role || user?.user_metadata?.role;
    if (effectiveRole !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can create timetable entries." };
    }

    let schoolId = adminProfile?.school_id || user?.user_metadata?.school_id;
    if (!schoolId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: defaultSchool } = await (supabase.from("schools") as any)
        .select("id")
        .limit(1)
        .maybeSingle();
      schoolId = defaultSchool?.id;
    }

    if (!schoolId) {
      return { success: false, error: "Administrator school assignment not found." };
    }

    // Resolve current term_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: termData } = await (supabase.from("terms") as any)
      .select("id")
      .eq("school_id", schoolId)
      .limit(1)
      .maybeSingle();

    const termId = termData?.id || crypto.randomUUID();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newTimetable, error } = await (supabase.from("timetables") as any)
      .insert({
        school_id: schoolId,
        class_id: newSlot.classId,
        subject_id: newSlot.subjectId,
        teacher_id: newSlot.teacherId,
        term_id: termId,
        day_of_week: DAY_TO_NUMBER[newSlot.day] || 1,
        start_time: newSlot.startTime,
        end_time: newSlot.endTime,
        room_number: newSlot.room,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    await recordAuditLog(
      "TIMETABLE_CREATION",
      "timetable",
      newTimetable?.id || schoolId,
      `Administrator created timetable entry for class ${newSlot.className} on ${newSlot.day} at ${newSlot.startTime}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create timetable slot";
    return { success: false, error: msg };
  }
}

export async function deleteTimetableSlot(id: string): Promise<{ success: boolean; error?: string }> {
  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Authentication required to delete timetable entries." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let adminProfile: any = null;
    if (user?.id) {
      const { data } = await (supabase.from("profiles") as any)
        .select("school_id, role")
        .eq("id", user.id)
        .maybeSingle();
      adminProfile = data;
    }

    const effectiveRole = adminProfile?.role || user?.user_metadata?.role;
    if (effectiveRole !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can delete timetable entries." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("timetables") as any).delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    await recordAuditLog(
      "TIMETABLE_DELETION",
      "timetable",
      id,
      `Administrator deleted timetable entry ID ${id}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Delete slot failed";
    return { success: false, error: msg };
  }
}
