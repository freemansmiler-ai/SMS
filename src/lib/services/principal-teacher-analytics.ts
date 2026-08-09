import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";

export interface TeacherAnalyticsFilter {
  academicYearId?: string;
  termId?: string;
  department?: string;
  subjectId?: string;
  classId?: string;
}

export interface TeacherActivitySummary {
  teacherId: string;
  profileId: string;
  employeeCode: string;
  teacherName: string;
  department: string;
  isActive: boolean;
  assignedClassesCount: number;
  assignedSubjectsCount: number;
  activeAssignmentsCount: number;
  studentsCoveredCount: number;
  draftResultsCount: number;
  submittedResultsCount: number;
  returnedResultsCount: number;
  approvedResultsCount: number;
  publishedResultsCount: number;
  resultCompletionRate: number;
  resultReturnRate: number;
  attendanceSessionsRecorded: number;
  associatedAverageScore: number;
  associatedPassRate: number;
  assessedStudentsCount: number;
  assignmentsList: Array<{ subjectName: string; className: string; academicYearName: string; termName: string }>;
}

export interface TeacherAnalyticsOverview {
  totalTeachers: number;
  activeTeachers: number;
  assignedTeachersCount: number;
  unassignedTeachersCount: number;
  outstandingSubmissionsCount: number;
  teachers: TeacherActivitySummary[];
  departments: string[];
  academicYearName: string;
  termName: string;
}

export async function fetchPrincipalTeacherAnalytics(
  filters?: TeacherAnalyticsFilter
): Promise<TeacherAnalyticsOverview> {
  const config = getSupabaseEnvConfig();

  // Mock Fallback for Executive Teacher Analytics
  if (config.isPlaceholder || !config.isConfigured) {
    return {
      totalTeachers: 84,
      activeTeachers: 80,
      assignedTeachersCount: 76,
      unassignedTeachersCount: 8,
      outstandingSubmissionsCount: 14,
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
      departments: ["Mathematics & Science", "Languages", "Social Studies", "Vocational & ICT"],
      teachers: [
        {
          teacherId: "tch-201",
          profileId: "prof-201",
          employeeCode: "GES-TCH-2026-001",
          teacherName: "Abena Appiah",
          department: "Mathematics & Science",
          isActive: true,
          assignedClassesCount: 2,
          assignedSubjectsCount: 2,
          activeAssignmentsCount: 3,
          studentsCoveredCount: 74,
          draftResultsCount: 2,
          submittedResultsCount: 14,
          returnedResultsCount: 2,
          approvedResultsCount: 32,
          publishedResultsCount: 120,
          resultCompletionRate: 94.0,
          resultReturnRate: 12.5,
          attendanceSessionsRecorded: 42,
          associatedAverageScore: 78.5,
          associatedPassRate: 95.8,
          assessedStudentsCount: 74,
          assignmentsList: [
            { subjectName: "Core Mathematics", className: "Basic 8 - Section A", academicYearName: "2026/2027", termName: "Term 1" },
            { subjectName: "Integrated Science", className: "Basic 9 - Section B", academicYearName: "2026/2027", termName: "Term 1" },
          ],
        },
        {
          teacherId: "tch-202",
          profileId: "prof-202",
          employeeCode: "GES-TCH-2026-002",
          teacherName: "Kofi Boateng",
          department: "Languages",
          isActive: true,
          assignedClassesCount: 3,
          assignedSubjectsCount: 1,
          activeAssignmentsCount: 3,
          studentsCoveredCount: 104,
          draftResultsCount: 4,
          submittedResultsCount: 8,
          returnedResultsCount: 0,
          approvedResultsCount: 28,
          publishedResultsCount: 96,
          resultCompletionRate: 96.2,
          resultReturnRate: 0,
          attendanceSessionsRecorded: 38,
          associatedAverageScore: 80.2,
          associatedPassRate: 98.1,
          assessedStudentsCount: 104,
          assignmentsList: [
            { subjectName: "Core English", className: "Basic 7 - Section A", academicYearName: "2026/2027", termName: "Term 1" },
            { subjectName: "Core English", className: "Basic 8 - Section A", academicYearName: "2026/2027", termName: "Term 1" },
          ],
        },
      ],
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

    // Query all teachers in school
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teachersData } = await (supabase.from("teachers") as any)
      .select(`
        id,
        profile_id,
        employee_code,
        department,
        profiles:profile_id (
          first_name,
          last_name,
          email,
          is_active
        )
      `)
      .eq("school_id", schoolId);

    const allTeachers = teachersData || [];
    const totalTeachers = allTeachers.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeTeachers = allTeachers.filter((t: any) => t.profiles?.is_active !== false).length;

    // Query teacher assignments in school
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let asgnQuery = (supabase.from("teacher_assignments") as any)
      .select(`
        id,
        teacher_id,
        subject_id,
        class_id,
        academic_year_id,
        term_id,
        subjects:subject_id (name),
        classes:class_id (name),
        academic_years:academic_year_id (name),
        terms:term_id (name)
      `)
      .eq("school_id", schoolId);

    if (filters?.classId && filters.classId !== "all") asgnQuery = asgnQuery.eq("class_id", filters.classId);
    if (filters?.subjectId && filters.subjectId !== "all") asgnQuery = asgnQuery.eq("subject_id", filters.subjectId);
    if (filters?.academicYearId) asgnQuery = asgnQuery.eq("academic_year_id", filters.academicYearId);
    if (filters?.termId) asgnQuery = asgnQuery.eq("term_id", filters.termId);

    const { data: assignmentsData } = await asgnQuery;
    const assignments = assignmentsData || [];

    // Query results for academic outcomes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resultsData } = await (supabase.from("results") as any)
      .select("teacher_id, subject_id, class_id, status, total_score, continuous_assessment_score, examination_score, student_id")
      .eq("school_id", schoolId);

    const results = resultsData || [];

    // Query attendance records for activity metrics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attData } = await (supabase.from("attendance") as any)
      .select("teacher_id, date, class_id")
      .eq("school_id", schoolId);

    const attendanceRecords = attData || [];

    // Query class enrollments for student coverage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: enrollData } = await (supabase.from("student_enrollments") as any)
      .select("class_id, student_id")
      .eq("school_id", schoolId);

    const enrollments = enrollData || [];

    const assignedTeacherIds = new Set(assignments.map((a: { teacher_id: string }) => a.teacher_id));
    const assignedTeachersCount = assignedTeacherIds.size;
    const unassignedTeachersCount = Math.max(0, totalTeachers - assignedTeachersCount);

    const departmentsSet = new Set<string>();

    // Build teacher analytics list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teacherSummaries: TeacherActivitySummary[] = allTeachers.map((t: any) => {
      const dept = t.department || "General";
      departmentsSet.add(dept);

      const profileRec = t.profiles;
      const tName = profileRec ? `${profileRec.first_name} ${profileRec.last_name}` : "Teacher";
      const isActive = profileRec?.is_active !== false;

      // Filter assignments for this teacher
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tAsgns = assignments.filter((a: any) => a.teacher_id === t.id);
      const classSet = new Set(tAsgns.map((a: { class_id: string }) => a.class_id));
      const subjectSet = new Set(tAsgns.map((a: { subject_id: string }) => a.subject_id));

      // Calculate student coverage without double counting
      const studentCoverageSet = new Set<string>();
      enrollments.forEach((e: { class_id: string; student_id: string }) => {
        if (classSet.has(e.class_id)) {
          studentCoverageSet.add(e.student_id);
        }
      });

      // Filter results for this teacher
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tResults = results.filter((r: any) => r.teacher_id === t.id);
      const draftCount = tResults.filter((r: { status: string }) => r.status === "draft").length;
      const submittedCount = tResults.filter((r: { status: string }) => r.status === "submitted").length;
      const returnedCount = tResults.filter((r: { status: string }) => r.status === "returned").length;
      const approvedCount = tResults.filter((r: { status: string }) => r.status === "approved").length;
      const publishedCount = tResults.filter((r: { status: string }) => r.status === "published").length;

      const totalResultSets = tResults.length;
      const completedResultSets = approvedCount + publishedCount;
      const resultCompletionRate = totalResultSets > 0 ? Number(((completedResultSets / totalResultSets) * 100).toFixed(1)) : 100;
      const submittedTotal = submittedCount + returnedCount + completedResultSets;
      const resultReturnRate = submittedTotal > 0 ? Number(((returnedCount / submittedTotal) * 100).toFixed(1)) : 0;

      // Filter attendance records
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tAtt = attendanceRecords.filter((a: any) => a.teacher_id === t.id);
      const attendanceSessionsRecorded = tAtt.length;

      // Compute student academic outcomes for published/approved results
      const officialResults = tResults.filter((r: { status: string }) => r.status === "published" || r.status === "approved");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scores = officialResults.map((r: any) => Number(r.total_score || (Number(r.continuous_assessment_score || 0) + Number(r.examination_score || 0))));
      const associatedAverageScore = scores.length > 0 ? Number((scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)) : 0;
      const passedScores = scores.filter((s: number) => s >= 50).length;
      const associatedPassRate = scores.length > 0 ? Number(((passedScores / scores.length) * 100).toFixed(1)) : 0;

      // Assignment list formatting
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assignmentsList = tAsgns.map((a: any) => ({
        subjectName: a.subjects?.name || "Subject",
        className: a.classes?.name || "Class",
        academicYearName: a.academic_years?.name || academicYearName,
        termName: a.terms?.name || termName,
      }));

      return {
        teacherId: t.id,
        profileId: t.profile_id,
        employeeCode: t.employee_code || "GES-TCH",
        teacherName: tName,
        department: dept,
        isActive,
        assignedClassesCount: classSet.size,
        assignedSubjectsCount: subjectSet.size,
        activeAssignmentsCount: tAsgns.length,
        studentsCoveredCount: studentCoverageSet.size,
        draftResultsCount: draftCount,
        submittedResultsCount: submittedCount,
        returnedResultsCount: returnedCount,
        approvedResultsCount: approvedCount,
        publishedResultsCount: publishedCount,
        resultCompletionRate,
        resultReturnRate,
        attendanceSessionsRecorded,
        associatedAverageScore,
        associatedPassRate,
        assessedStudentsCount: officialResults.length,
        assignmentsList,
      };
    });

    // Apply department filter if selected
    let filteredTeachers = teacherSummaries;
    if (filters?.department && filters.department !== "all") {
      filteredTeachers = filteredTeachers.filter((t) => t.department === filters.department);
    }

    const outstandingSubmissionsCount = filteredTeachers.filter((t) => t.submittedResultsCount > 0 || t.returnedResultsCount > 0 || t.draftResultsCount > 0).length;

    return {
      totalTeachers,
      activeTeachers,
      assignedTeachersCount,
      unassignedTeachersCount,
      outstandingSubmissionsCount,
      teachers: filteredTeachers,
      departments: Array.from(departmentsSet),
      academicYearName,
      termName,
    };
  } catch {
    return {
      totalTeachers: 0,
      activeTeachers: 0,
      assignedTeachersCount: 0,
      unassignedTeachersCount: 0,
      outstandingSubmissionsCount: 0,
      teachers: [],
      departments: [],
      academicYearName: "2026/2027 Academic Year",
      termName: "Term 1",
    };
  }
}
