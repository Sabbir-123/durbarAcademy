-- Supabase PostgreSQL Relational Schema for Durbar Academy

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------
-- 1. USER & ROLE STRUCTURE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now()
);

-- Seed Default Roles
INSERT INTO public.roles (id) VALUES ('student'), ('teacher'), ('accountant'), ('admin') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    college TEXT,
    city TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT REFERENCES public.roles(id) ON DELETE RESTRICT DEFAULT 'student' NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_profiles (
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    parent_phone TEXT,
    guardian_name TEXT,
    school TEXT,
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    bio TEXT,
    institution TEXT,
    subject_specialty TEXT,
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accountant_profiles (
    accountant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    employee_code TEXT UNIQUE,
    department TEXT,
    updated_at TIMESTAMP DEFAULT now()
);

-- -----------------------------------------------------
-- 2. ACADEMIC MODULES
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    tagline TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC,
    duration TEXT,
    start_date DATE,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_teachers (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, completed, suspended
    enrolled_at TIMESTAMP DEFAULT now(),
    UNIQUE (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    notes_url TEXT,
    duration_minutes INT DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.course_progress (
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    progress_percent INT DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (student_id, course_id)
);

-- -----------------------------------------------------
-- 3. EXAMS & CBT ENGINE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time_limit_minutes INT DEFAULT 0,
    total_marks INT DEFAULT 0,
    passing_marks INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'mcq',
    marks INT DEFAULT 1,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT now(),
    submitted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.student_answers (
    attempt_id UUID REFERENCES public.test_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
    is_correct BOOLEAN,
    PRIMARY KEY (attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES public.test_attempts(id) ON DELETE CASCADE UNIQUE,
    total_score INT NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT false,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- -----------------------------------------------------
-- 4. ASSISTANCE & SUPPORT
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assistance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved
    assigned_teacher_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assistance_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES public.assistance_requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- -----------------------------------------------------
-- 5. DEVICE & SECURITY MANAGEMENT
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_name TEXT,
    ip_address TEXT,
    user_agent TEXT,
    last_active TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.login_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_hash TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.account_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_blocked BOOLEAN DEFAULT false,
    reason TEXT,
    restricted_at TIMESTAMP DEFAULT now(),
    restricted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.unblock_appeals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restriction_id UUID REFERENCES public.account_restrictions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    appeal_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP
);

-- -----------------------------------------------------
-- 6. FINANCIAL ARCHITECTURE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL -- income, expense
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL, -- bkash, nagad, rocket, card
    transaction_reference TEXT UNIQUE,
    status TEXT DEFAULT 'completed',
    payment_date TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.income_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC NOT NULL,
    source TEXT NOT NULL,
    category_id UUID REFERENCES public.financial_categories(id),
    transaction_date TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expense_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    category_id UUID REFERENCES public.financial_categories(id),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES public.expense_requests(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    category_id UUID REFERENCES public.financial_categories(id),
    recorded_by UUID REFERENCES public.profiles(id),
    recorded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    month_year TEXT NOT NULL, -- e.g. "08-2026"
    payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid
    paid_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.financial_categories(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- -----------------------------------------------------
-- 7. CMS, NOTIFICATIONS & AUDIT TRAILS
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_recipients (
    notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    PRIMARY KEY (notification_id, recipient_id)
);

CREATE TABLE IF NOT EXISTS public.cms_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cms_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.cms_sections(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE (section_id, key)
);

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    before_state JSONB,
    after_state JSONB,
    timestamp TIMESTAMP DEFAULT now(),
    ip_address TEXT
);

-- -----------------------------------------------------
-- 8. SECURITY & RLS POLICIES (Idempotent Drops Added)
-- -----------------------------------------------------

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Roles Policies
DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON public.user_roles;
CREATE POLICY "Roles are viewable by authenticated users" ON public.user_roles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own default student role" ON public.user_roles;
CREATE POLICY "Users can insert their own default student role" ON public.user_roles FOR INSERT WITH CHECK (
    auth.uid() = user_id AND role = 'student'
);

DROP POLICY IF EXISTS "Only admins can change roles" ON public.user_roles;
CREATE POLICY "Only admins can change roles" ON public.user_roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);

-- Audit Logs Policies (Append-only & Admin viewable only)
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);

DROP POLICY IF EXISTS "System can append audit logs" ON public.audit_logs;
CREATE POLICY "System can append audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Prevent Updates / Deletes on Audit Logs
DROP RULE IF EXISTS prevent_audit_update ON public.audit_logs;
CREATE RULE prevent_audit_update AS ON UPDATE TO public.audit_logs DO INSTEAD NOTHING;

DROP RULE IF EXISTS prevent_audit_delete ON public.audit_logs;
CREATE RULE prevent_audit_delete AS ON DELETE TO public.audit_logs DO INSTEAD NOTHING;

-- -----------------------------------------------------
-- 9. TRIGGERS: AUTO USER CREATION & DEFAULT ADMIN
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role TEXT := 'student';
BEGIN
    -- Super Admin promotion
    IF NEW.email = 'ahmedsabbir2013@gmail.com' THEN
        default_role := 'admin';
    END IF;

    -- Insert Profile
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert Default Role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, default_role) ON CONFLICT (user_id) DO NOTHING;

    -- Insert Profile Role Details
    IF default_role = 'student' THEN
        INSERT INTO public.student_profiles (student_id) VALUES (NEW.id) ON CONFLICT (student_id) DO NOTHING;
    END IF;

    -- Log Audit Event
    INSERT INTO public.audit_logs (actor_user_id, actor_role, action, entity_type, entity_id, after_state)
    VALUES (NEW.id, default_role, 'REGISTER_USER', 'profiles', NEW.id, json_build_object('email', NEW.email, 'role', default_role));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger auth.users trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();