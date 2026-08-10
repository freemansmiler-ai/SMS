-- ==============================================================================
-- SCHOOL MANAGEMENT SYSTEM - ROW LEVEL SECURITY (RLS) & AUTHORIZATION MIGRATION
-- Multi-Tenant Prepared & Role-Scoped Security Architecture
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURE HELPER FUNCTIONS (STABLE, SECURITY DEFINER with fixed search_path)
-- ------------------------------------------------------------------------------

-- Get current authenticated user's school_id from public.profiles
CREATE OR REPLACE FUNCTION get_auth_school_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp AS $$
    SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Get current authenticated user's role from public.profiles
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS user_role
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Get current authenticated user's teacher record ID
CREATE OR REPLACE FUNCTION get_auth_teacher_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp AS $$
    SELECT id FROM public.teachers WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- Get current authenticated user's student record ID
CREATE OR REPLACE FUNCTION get_auth_student_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp AS $$
    SELECT id FROM public.students WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- Check if teacher is assigned to a specific class and subject
CREATE OR REPLACE FUNCTION is_teacher_assigned_to_class_subject(
    p_teacher_id UUID,
    p_class_id UUID,
    p_subject_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.teacher_assignments
        WHERE teacher_id = p_teacher_id
          AND class_id = p_class_id
          AND subject_id = p_subject_id
    );
$$;

-- Check if teacher is assigned to a specific class
CREATE OR REPLACE FUNCTION is_teacher_assigned_to_class(
    p_teacher_id UUID,
    p_class_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.teacher_assignments
        WHERE teacher_id = p_teacher_id
          AND class_id = p_class_id
    );
$$;

-- Check if student is enrolled in a specific class
CREATE OR REPLACE FUNCTION is_student_enrolled_in_class(
    p_student_id UUID,
    p_class_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.student_enrollments
        WHERE student_id = p_student_id
          AND class_id = p_class_id
    );
$$;

-- ------------------------------------------------------------------------------
-- 2. PROFILE PRIVILEGE ESCALATION PROTECTION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
    IF get_auth_role() != 'administrator' THEN
        IF OLD.role IS DISTINCT FROM NEW.role THEN
            RAISE EXCEPTION 'PRIVILEGE_ESCALATION_VIOLATION: Non-administrator cannot modify role.';
        END IF;
        IF OLD.school_id IS DISTINCT FROM NEW.school_id THEN
            RAISE EXCEPTION 'MULTI_TENANT_VIOLATION: Non-administrator cannot modify school_id.';
        END IF;
        IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
            RAISE EXCEPTION 'SECURITY_VIOLATION: Non-administrator cannot modify account status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION prevent_profile_privilege_escalation();

-- ------------------------------------------------------------------------------
-- 3. RESULT LIFECYCLE & STATUS VALIDATION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_result_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
    current_role user_role := get_auth_role();
BEGIN
    -- On INSERT
    IF TG_OP = 'INSERT' THEN
        IF current_role = 'student' THEN
            RAISE EXCEPTION 'UNAUTHORIZED: Students cannot create result entries.';
        END IF;
        IF current_role = 'teacher' AND NEW.status != 'draft' THEN
            RAISE EXCEPTION 'TEACHER_RESTRICTION: Initial result status must be draft.';
        END IF;
    END IF;

    -- On UPDATE
    IF TG_OP = 'UPDATE' THEN
        IF current_role = 'student' THEN
            RAISE EXCEPTION 'UNAUTHORIZED: Students cannot update result entries.';
        END IF;

        IF current_role = 'teacher' THEN
            -- Teachers can only update results assigned to them
            IF OLD.teacher_id IS DISTINCT FROM get_auth_teacher_id() AND NEW.teacher_id IS DISTINCT FROM get_auth_teacher_id() THEN
                RAISE EXCEPTION 'TEACHER_RESTRICTION: Cannot edit results belonging to another teacher.';
            END IF;

            -- Teachers can only edit when current status is draft or returned
            IF OLD.status NOT IN ('draft', 'returned') THEN
                RAISE EXCEPTION 'TEACHER_RESTRICTION: Cannot modify results once submitted, approved, or published.';
            END IF;

            -- Teachers can only set status to draft or submitted
            IF NEW.status NOT IN ('draft', 'submitted') THEN
                RAISE EXCEPTION 'TEACHER_RESTRICTION: Teachers cannot directly approve, review, or publish results.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_result_status_transition ON public.results;
CREATE TRIGGER trg_validate_result_status_transition
    BEFORE INSERT OR UPDATE ON public.results
    FOR EACH ROW EXECUTE FUNCTION validate_result_status_transition();

-- ------------------------------------------------------------------------------
-- 4. ENABLE RLS ON ALL 17 TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies before re-defining
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY POLICIES DEFINITION
-- ------------------------------------------------------------------------------

-- 1. SCHOOLS
CREATE POLICY "schools_select_own" ON public.schools
    FOR SELECT USING (id = get_auth_school_id());

CREATE POLICY "schools_update_admin" ON public.schools
    FOR UPDATE USING (id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 2. SCHOOL SETTINGS
CREATE POLICY "settings_select_own" ON public.school_settings
    FOR SELECT USING (school_id = get_auth_school_id());

CREATE POLICY "settings_all_admin" ON public.school_settings
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 3. PROFILES
CREATE POLICY "profiles_select_same_school" ON public.profiles
    FOR SELECT USING (school_id = get_auth_school_id());

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_all_admin" ON public.profiles
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 4. STUDENTS
CREATE POLICY "students_select_admin_principal" ON public.students
    FOR SELECT USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

CREATE POLICY "students_select_teacher" ON public.students
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'teacher'
        AND EXISTS (
            SELECT 1 FROM public.student_enrollments se
            JOIN public.teacher_assignments ta ON ta.class_id = se.class_id
            WHERE se.student_id = students.id
              AND ta.teacher_id = get_auth_teacher_id()
        )
    );

CREATE POLICY "students_select_own" ON public.students
    FOR SELECT USING (profile_id = auth.uid() AND school_id = get_auth_school_id());

CREATE POLICY "students_manage_admin_principal" ON public.students
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

-- 5. TEACHERS
CREATE POLICY "teachers_select_same_school" ON public.teachers
    FOR SELECT USING (school_id = get_auth_school_id());

CREATE POLICY "teachers_manage_admin" ON public.teachers
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 6. ACADEMIC YEARS
CREATE POLICY "academic_years_select_same_school" ON public.academic_years
    FOR SELECT USING (school_id = get_auth_school_id());

CREATE POLICY "academic_years_manage_admin" ON public.academic_years
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 7. TERMS
CREATE POLICY "terms_select_same_school" ON public.terms
    FOR SELECT USING (school_id = get_auth_school_id());

CREATE POLICY "terms_manage_admin" ON public.terms
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 8. CLASSES
CREATE POLICY "classes_select_admin_principal" ON public.classes
    FOR SELECT USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

CREATE POLICY "classes_select_teacher" ON public.classes
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'teacher'
        AND (class_teacher_id = get_auth_teacher_id() OR is_teacher_assigned_to_class(get_auth_teacher_id(), id))
    );

CREATE POLICY "classes_select_student" ON public.classes
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'student'
        AND is_student_enrolled_in_class(get_auth_student_id(), id)
    );

CREATE POLICY "classes_manage_admin" ON public.classes
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 9. SUBJECTS
CREATE POLICY "subjects_select_same_school" ON public.subjects
    FOR SELECT USING (school_id = get_auth_school_id());

CREATE POLICY "subjects_manage_admin" ON public.subjects
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 10. TEACHER ASSIGNMENTS
CREATE POLICY "teacher_assignments_select_admin_principal" ON public.teacher_assignments
    FOR SELECT USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

CREATE POLICY "teacher_assignments_select_teacher_own" ON public.teacher_assignments
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'teacher'
        AND teacher_id = get_auth_teacher_id()
    );

CREATE POLICY "teacher_assignments_manage_admin" ON public.teacher_assignments
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 11. STUDENT ENROLLMENTS
CREATE POLICY "student_enrollments_select_admin_principal" ON public.student_enrollments
    FOR SELECT USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

CREATE POLICY "student_enrollments_select_teacher" ON public.student_enrollments
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'teacher'
        AND is_teacher_assigned_to_class(get_auth_teacher_id(), class_id)
    );

CREATE POLICY "student_enrollments_select_student_own" ON public.student_enrollments
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'student'
        AND student_id = get_auth_student_id()
    );

CREATE POLICY "student_enrollments_manage_admin_principal" ON public.student_enrollments
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

-- 12. RESULTS / GRADES
CREATE POLICY "results_select_admin_principal" ON public.results
    FOR SELECT USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

CREATE POLICY "results_select_teacher" ON public.results
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'teacher'
        AND (teacher_id = get_auth_teacher_id() OR is_teacher_assigned_to_class_subject(get_auth_teacher_id(), class_id, subject_id))
    );

CREATE POLICY "results_select_student_published_own" ON public.results
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'student'
        AND student_id = get_auth_student_id()
        AND status = 'published'
    );

CREATE POLICY "results_insert_teacher" ON public.results
    FOR INSERT WITH CHECK (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'teacher'
        AND teacher_id = get_auth_teacher_id()
        AND is_teacher_assigned_to_class_subject(get_auth_teacher_id(), class_id, subject_id)
        AND status = 'draft'
    );

CREATE POLICY "results_update_teacher" ON public.results
    FOR UPDATE USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'teacher'
        AND teacher_id = get_auth_teacher_id()
        AND status IN ('draft', 'returned')
    );

CREATE POLICY "results_update_principal" ON public.results
    FOR UPDATE USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'principal'
    );

CREATE POLICY "results_manage_admin" ON public.results
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 13. ATTENDANCE
CREATE POLICY "attendance_select_admin_principal" ON public.attendance
    FOR SELECT USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

CREATE POLICY "attendance_select_teacher" ON public.attendance
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'teacher'
        AND is_teacher_assigned_to_class(get_auth_teacher_id(), class_id)
    );

CREATE POLICY "attendance_select_student_own" ON public.attendance
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'student'
        AND student_id = get_auth_student_id()
    );

CREATE POLICY "attendance_insert_update_teacher" ON public.attendance
    FOR ALL USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'teacher'
        AND is_teacher_assigned_to_class(get_auth_teacher_id(), class_id)
    );

CREATE POLICY "attendance_manage_admin_principal" ON public.attendance
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

-- 14. TIMETABLES
CREATE POLICY "timetables_select_admin_principal" ON public.timetables
    FOR SELECT USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

CREATE POLICY "timetables_select_teacher" ON public.timetables
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'teacher'
        AND (teacher_id = get_auth_teacher_id() OR is_teacher_assigned_to_class(get_auth_teacher_id(), class_id))
    );

CREATE POLICY "timetables_select_student" ON public.timetables
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND get_auth_role() = 'student'
        AND is_student_enrolled_in_class(get_auth_student_id(), class_id)
    );

CREATE POLICY "timetables_manage_admin" ON public.timetables
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

-- 15. ANNOUNCEMENTS
CREATE POLICY "announcements_select_published" ON public.announcements
    FOR SELECT USING (
        school_id = get_auth_school_id()
        AND is_published = true
        AND (
            target_audience = 'all'
            OR (target_audience = 'teachers' AND get_auth_role() IN ('administrator', 'principal', 'teacher'))
            OR (target_audience = 'students' AND get_auth_role() = 'student')
        )
    );

CREATE POLICY "announcements_manage_admin_principal" ON public.announcements
    FOR ALL USING (school_id = get_auth_school_id() AND get_auth_role() IN ('administrator', 'principal'));

-- 16. NOTIFICATIONS
CREATE POLICY "notifications_select_update_own" ON public.notifications
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_same_school" ON public.notifications
    FOR INSERT WITH CHECK (school_id = get_auth_school_id());

-- 17. AUDIT LOGS
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
    FOR SELECT USING (school_id = get_auth_school_id() AND get_auth_role() = 'administrator');

CREATE POLICY "audit_logs_insert_authenticated" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
