import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { recordAuditLog } from "./audit-logs";
import { requireAuthorization } from "./authorization";

export interface TermRecord {
  id: string;
  schoolId: string;
  academicYearId: string;
  academicYearName?: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AcademicYearRecord {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms: TermRecord[];
}

export interface CreateAcademicYearPayload {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export interface CreateTermPayload {
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export async function fetchAcademicYears(): Promise<AcademicYearRecord[]> {
  const config = getSupabaseEnvConfig();

  // Initial Mock Fallback if config is placeholder or unconfigured
  if (config.isPlaceholder || !config.isConfigured) {
    return [
      {
        id: "ay-2026",
        schoolId: "sch-01",
        name: "2026/2027 Academic Year",
        startDate: "2026-09-01",
        endDate: "2027-07-31",
        isCurrent: true,
        terms: [
          {
            id: "term-1-2026",
            schoolId: "sch-01",
            academicYearId: "ay-2026",
            academicYearName: "2026/2027 Academic Year",
            name: "Term 1",
            startDate: "2026-09-01",
            endDate: "2026-12-15",
            isCurrent: true,
          },
          {
            id: "term-2-2026",
            schoolId: "sch-01",
            academicYearId: "ay-2026",
            academicYearName: "2026/2027 Academic Year",
            name: "Term 2",
            startDate: "2027-01-10",
            endDate: "2027-04-15",
            isCurrent: false,
          },
          {
            id: "term-3-2026",
            schoolId: "sch-01",
            academicYearId: "ay-2026",
            academicYearName: "2026/2027 Academic Year",
            name: "Term 3",
            startDate: "2027-05-02",
            endDate: "2027-07-31",
            isCurrent: false,
          },
        ],
      },
      {
        id: "ay-2025",
        schoolId: "sch-01",
        name: "2025/2026 Academic Year",
        startDate: "2025-09-01",
        endDate: "2026-07-31",
        isCurrent: false,
        terms: [
          {
            id: "term-1-2025",
            schoolId: "sch-01",
            academicYearId: "ay-2025",
            academicYearName: "2025/2026 Academic Year",
            name: "Term 1",
            startDate: "2025-09-01",
            endDate: "2025-12-15",
            isCurrent: false,
          },
        ],
      },
    ];
  }

  const supabase = createBrowserClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: yearsData, error } = await (supabase.from("academic_years") as any)
      .select(`
        id,
        school_id,
        name,
        start_date,
        end_date,
        is_current,
        terms (
          id,
          school_id,
          academic_year_id,
          name,
          start_date,
          end_date,
          is_current
        )
      `)
      .order("start_date", { ascending: false });

    if (error || !yearsData) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return yearsData.map((y: any) => ({
      id: y.id,
      schoolId: y.school_id,
      name: y.name,
      startDate: y.start_date,
      endDate: y.end_date,
      isCurrent: Boolean(y.is_current),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      terms: (y.terms || []).map((t: any) => ({
        id: t.id,
        schoolId: t.school_id,
        academicYearId: t.academic_year_id,
        academicYearName: y.name,
        name: t.name,
        startDate: t.start_date,
        endDate: t.end_date,
        isCurrent: Boolean(t.is_current),
      })),
    }));
  } catch {
    return [];
  }
}

export async function fetchTerms(academicYearId?: string): Promise<TermRecord[]> {
  const years = await fetchAcademicYears();
  let allTerms: TermRecord[] = [];
  years.forEach((y) => {
    allTerms = allTerms.concat(y.terms);
  });

  if (academicYearId) {
    return allTerms.filter((t) => t.academicYearId === academicYearId);
  }
  return allTerms;
}

export async function createAcademicYear(payload: CreateAcademicYearPayload): Promise<{ success: boolean; error?: string }> {
  if (new Date(payload.startDate) >= new Date(payload.endDate)) {
    return { success: false, error: "Academic year start date must be strictly before end date." };
  }

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const authRes = await requireAuthorization(["administrator"]);
    if (!authRes.authorized || !authRes.schoolId) {
      return { success: false, error: authRes.error || "UNAUTHORIZED: Only an administrator can create academic years." };
    }
    const schoolId = authRes.schoolId;
    const userId = authRes.userId || "admin";

    // Check duplicate name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingYear } = await (supabase.from("academic_years") as any)
      .select("id")
      .eq("school_id", schoolId)
      .eq("name", payload.name.trim())
      .maybeSingle();

    if (existingYear) {
      return { success: false, error: `Academic year '${payload.name}' already exists in your school.` };
    }

    // Insert academic year
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newYear, error: yearErr } = await (supabase.from("academic_years") as any)
      .insert({
        school_id: schoolId,
        name: payload.name.trim(),
        start_date: payload.startDate,
        end_date: payload.endDate,
        is_current: payload.isCurrent || false,
      })
      .select("id")
      .single();

    if (yearErr || !newYear) {
      return { success: false, error: yearErr?.message || "Failed to create academic year." };
    }

    if (payload.isCurrent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("academic_years") as any)
        .update({ is_current: false })
        .eq("school_id", schoolId)
        .neq("id", newYear.id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("school_settings") as any)
        .update({ current_academic_year_id: newYear.id })
        .eq("school_id", schoolId);
    }

    // Audit log
    await recordAuditLog(
      "ACADEMIC_YEAR_CREATION",
      "academic_years",
      newYear.id,
      `Administrator (${userId}) created academic year '${payload.name}' (${payload.startDate} to ${payload.endDate})`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Academic year creation failed.";
    return { success: false, error: msg };
  }
}

export async function updateAcademicYear(
  id: string,
  payload: Partial<CreateAcademicYearPayload>
): Promise<{ success: boolean; error?: string }> {
  if (payload.startDate && payload.endDate && new Date(payload.startDate) >= new Date(payload.endDate)) {
    return { success: false, error: "Academic year start date must be strictly before end date." };
  }

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can update academic years." };
    }

    if (payload.isCurrent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("academic_years") as any)
        .update({ is_current: false })
        .eq("school_id", adminProfile.school_id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("academic_years") as any)
      .update({
        name: payload.name ? payload.name.trim() : undefined,
        start_date: payload.startDate,
        end_date: payload.endDate,
        is_current: payload.isCurrent,
      })
      .eq("id", id)
      .eq("school_id", adminProfile.school_id);

    if (error) return { success: false, error: error.message };

    if (payload.isCurrent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("school_settings") as any)
        .update({ current_academic_year_id: id })
        .eq("school_id", adminProfile.school_id);
    }

    // Audit log
    await recordAuditLog(
      "ACADEMIC_YEAR_MODIFICATION",
      "academic_years",
      id,
      `Administrator (${user.id}) updated academic year ID ${id}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed.";
    return { success: false, error: msg };
  }
}

export async function setCurrentAcademicYear(id: string): Promise<{ success: boolean; error?: string }> {
  return updateAcademicYear(id, { isCurrent: true });
}

export async function createTerm(payload: CreateTermPayload): Promise<{ success: boolean; error?: string }> {
  if (new Date(payload.startDate) >= new Date(payload.endDate)) {
    return { success: false, error: "Term start date must be strictly before end date." };
  }

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const authRes = await requireAuthorization(["administrator"]);
    if (!authRes.authorized || !authRes.schoolId) {
      return { success: false, error: authRes.error || "UNAUTHORIZED: Only an administrator can create terms." };
    }
    const schoolId = authRes.schoolId;
    const userId = authRes.userId || "admin";

    // Validate parent academic year dates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: yearData } = await (supabase.from("academic_years") as any)
      .select("start_date, end_date, name")
      .eq("id", payload.academicYearId)
      .eq("school_id", schoolId)
      .single();

    if (!yearData) {
      return { success: false, error: "Parent academic year not found or belongs to another school." };
    }

    const termStart = new Date(payload.startDate);
    const termEnd = new Date(payload.endDate);
    const yearStart = new Date(yearData.start_date);
    const yearEnd = new Date(yearData.end_date);

    if (termStart < yearStart || termEnd > yearEnd) {
      return {
        success: false,
        error: `Term dates (${payload.startDate} to ${payload.endDate}) must fall logically within Academic Year '${yearData.name}' (${yearData.start_date} to ${yearData.end_date}).`,
      };
    }

    // Duplicate term name in academic year check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingTerm } = await (supabase.from("terms") as any)
      .select("id")
      .eq("academic_year_id", payload.academicYearId)
      .eq("name", payload.name.trim())
      .maybeSingle();

    if (existingTerm) {
      return { success: false, error: `Term '${payload.name}' already exists in academic year '${yearData.name}'.` };
    }

    if (payload.isCurrent) {
      // Unset current term in school
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("terms") as any)
        .update({ is_current: false })
        .eq("school_id", schoolId);
    }

    // Insert term
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newTerm, error: insertErr } = await (supabase.from("terms") as any)
      .insert({
        school_id: schoolId,
        academic_year_id: payload.academicYearId,
        name: payload.name.trim(),
        start_date: payload.startDate,
        end_date: payload.endDate,
        is_current: Boolean(payload.isCurrent),
      })
      .select("id")
      .single();

    if (insertErr || !newTerm) {
      return { success: false, error: insertErr?.message || "Term creation failed." };
    }

    if (payload.isCurrent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("school_settings") as any)
        .update({ current_term_id: newTerm.id })
        .eq("school_id", schoolId);
    }

    // Audit log
    await recordAuditLog(
      "TERM_CREATION",
      "terms",
      newTerm.id,
      `Administrator (${userId}) created term '${payload.name}' in academic year ${payload.academicYearId}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Term creation failed.";
    return { success: false, error: msg };
  }
}

export async function updateTerm(
  id: string,
  payload: Partial<CreateTermPayload>
): Promise<{ success: boolean; error?: string }> {
  if (payload.startDate && payload.endDate && new Date(payload.startDate) >= new Date(payload.endDate)) {
    return { success: false, error: "Term start date must be strictly before end date." };
  }

  const config = getSupabaseEnvConfig();
  if (config.isPlaceholder || !config.isConfigured) {
    return { success: true };
  }

  const supabase = createBrowserClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase.from("profiles") as any)
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "administrator") {
      return { success: false, error: "UNAUTHORIZED: Only an administrator can update terms." };
    }

    if (payload.isCurrent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("terms") as any)
        .update({ is_current: false })
        .eq("school_id", adminProfile.school_id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("terms") as any)
      .update({
        name: payload.name ? payload.name.trim() : undefined,
        start_date: payload.startDate,
        end_date: payload.endDate,
        is_current: payload.isCurrent,
      })
      .eq("id", id)
      .eq("school_id", adminProfile.school_id);

    if (error) return { success: false, error: error.message };

    if (payload.isCurrent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("school_settings") as any)
        .update({ current_term_id: id })
        .eq("school_id", adminProfile.school_id);
    }

    // Audit log
    await recordAuditLog(
      "TERM_MODIFICATION",
      "terms",
      id,
      `Administrator (${user.id}) updated term ID ${id}`
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed.";
    return { success: false, error: msg };
  }
}

export async function setCurrentTerm(id: string): Promise<{ success: boolean; error?: string }> {
  return updateTerm(id, { isCurrent: true });
}
