import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { createClient } from "@supabase/supabase-js";

async function main() {
  console.log("==================================================");
  console.log("TESTING TIMETABLE CREATION ON LIVE SUPABASE");
  console.log("==================================================");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const schoolId = "00000000-0000-0000-0000-000000000001";

  // Get existing Class, Subject, Teacher, Term
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: classData } = await (supabaseAdmin.from("classes") as any).select("id").limit(1).single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subjectData } = await (supabaseAdmin.from("subjects") as any).select("id").limit(1).single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: teacherData } = await (supabaseAdmin.from("teachers") as any).select("id").limit(1).single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: termData } = await (supabaseAdmin.from("terms") as any).select("id").limit(1).maybeSingle();

  let termId = termData?.id;
  if (!termId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: yearData } = await (supabaseAdmin.from("academic_years") as any).select("id").limit(1).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newTerm } = await (supabaseAdmin.from("terms") as any)
      .insert({
        school_id: schoolId,
        academic_year_id: yearData.id,
        name: "Term 1",
        start_date: "2026-09-01",
        end_date: "2026-12-15",
        is_current: true,
      })
      .select("id")
      .single();
    termId = newTerm.id;
  }

  console.log("Class ID:", classData.id);
  console.log("Subject ID:", subjectData.id);
  console.log("Teacher ID:", teacherData.id);
  console.log("Term ID:", termId);

  // Insert timetable slot
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newTimetable, error: timetableErr } = await (supabaseAdmin.from("timetables") as any)
    .insert({
      school_id: schoolId,
      class_id: classData.id,
      subject_id: subjectData.id,
      teacher_id: teacherData.id,
      term_id: termId,
      day_of_week: 1, // Monday
      start_time: "08:00:00",
      end_time: "09:00:00",
      room_number: "Room B8-A",
    })
    .select("id, room_number")
    .single();

  if (timetableErr) {
    console.error("❌ Create Timetable Error:", timetableErr.message);
  } else {
    console.log("✅ Create Timetable Success! ID:", newTimetable.id, "Room:", newTimetable.room_number);
  }
}

main().catch((err) => {
  console.error("Fatal Test Error:", err);
  process.exit(1);
});
