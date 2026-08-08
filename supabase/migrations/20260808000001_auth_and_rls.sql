-- ==============================================================================
-- SCHOOL MANAGEMENT SYSTEM - AUTHENTICATION & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS FOR SECURITY POLICIES
-- ------------------------------------------------------------------------------

-- Get current authenticated user's role from public.profiles
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current authenticated user's school_id from public.profiles
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is an administrator or principal
CREATE OR REPLACE FUNCTION is_admin_or_principal()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('administrator', 'principal')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- 2. AUTOMATIC PROFILE CREATION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_school_id UUID;
BEGIN
    -- Obtain default school ID or user metadata school_id
    IF NEW.raw_user_meta_data->>'school_id' IS NOT NULL THEN
        default_school_id := (NEW.raw_user_meta_data->>'school_id')::UUID;
    ELSE
        SELECT id INTO default_school_id FROM public.schools LIMIT 1;
    END IF;

    INSERT INTO public.profiles (
        id,
        school_id,
        email,
        first_name,
        last_name,
        role,
        avatar_url,
        phone
    ) VALUES (
        NEW.id,
        default_school_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES ON ALL TABLES
-- ------------------------------------------------------------------------------

-- Enable RLS on all public tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can read profiles in their school"
    ON profiles FOR SELECT
    USING (school_id = get_user_school_id());

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Administrators can insert and delete profiles in their school"
    ON profiles FOR ALL
    USING (school_id = get_user_school_id() AND get_user_role() = 'administrator');

-- ------------------------------------------------------------------------------
-- SCHOOLS & SETTINGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own school"
    ON schools FOR SELECT
    USING (id = get_user_school_id());

CREATE POLICY "Administrators can update their school settings"
    ON school_settings FOR ALL
    USING (school_id = get_user_school_id() AND get_user_role() = 'administrator');

-- ------------------------------------------------------------------------------
-- STUDENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff can view students in their school"
    ON students FOR SELECT
    USING (school_id = get_user_school_id());

CREATE POLICY "Students can view their own student profile"
    ON students FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Admin & Principal can manage students"
    ON students FOR ALL
    USING (school_id = get_user_school_id() AND is_admin_or_principal());

-- ------------------------------------------------------------------------------
-- RESULTS / GRADES POLICIES (Strict Student Isolation)
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff can view results in their school"
    ON results FOR SELECT
    USING (school_id = get_user_school_id() AND get_user_role() IN ('administrator', 'principal', 'teacher'));

CREATE POLICY "Students can ONLY view their own results"
    ON results FOR SELECT
    USING (
        school_id = get_user_school_id()
        AND student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    );

CREATE POLICY "Teachers and Admin can insert/update results"
    ON results FOR ALL
    USING (school_id = get_user_school_id() AND get_user_role() IN ('administrator', 'teacher'));

-- ------------------------------------------------------------------------------
-- ATTENDANCE POLICIES (Strict Student Isolation)
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff can view attendance in their school"
    ON attendance FOR SELECT
    USING (school_id = get_user_school_id() AND get_user_role() IN ('administrator', 'principal', 'teacher'));

CREATE POLICY "Students can ONLY view their own attendance"
    ON attendance FOR SELECT
    USING (
        school_id = get_user_school_id()
        AND student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    );

CREATE POLICY "Teachers and Admin can manage attendance"
    ON attendance FOR ALL
    USING (school_id = get_user_school_id() AND get_user_role() IN ('administrator', 'teacher'));

-- ------------------------------------------------------------------------------
-- ANNOUNCEMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view announcements for their school"
    ON announcements FOR SELECT
    USING (school_id = get_user_school_id() AND is_published = true);

CREATE POLICY "Staff can manage announcements"
    ON announcements FOR ALL
    USING (school_id = get_user_school_id() AND get_user_role() IN ('administrator', 'principal', 'teacher'));

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view and manage their own notifications"
    ON notifications FOR ALL
    USING (user_id = auth.uid());
