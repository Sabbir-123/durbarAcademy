-- ==============================================================================
-- DURBAR ACADEMY - UNIFIED ADMISSION, REVIEW & UNIQUE STUDENT ID MIGRATION
-- Run this complete script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Ensure public.profiles has student_code (Unique Student ID, e.g. DA-STU-10824)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_code TEXT;

-- 2. Create or ensure public.enrollments table exists
CREATE TABLE IF NOT EXISTS public.enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_code TEXT,
    course_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    student_name TEXT,
    student_phone TEXT,
    student_email TEXT,
    college TEXT,
    branch TEXT DEFAULT 'online',
    payment_method TEXT DEFAULT 'bKash',
    sender_number TEXT,
    trx_id TEXT,
    payment_screenshot TEXT,
    course_title TEXT,
    course_price NUMERIC DEFAULT 8500,
    admin_note TEXT DEFAULT '',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure all columns exist in public.enrollments
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS student_code TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS student_phone TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS student_email TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'online';
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bKash';
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS sender_number TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS trx_id TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS course_title TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS course_price NUMERIC DEFAULT 8500;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS admin_note TEXT DEFAULT '';
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Drop restrictive FK constraints if present
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_fkey;
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_course_id_fkey;

-- 3. Create public.notifications table for live student alerts
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_email TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'approved', 'rejected', 'modification_needed', 'info'
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Enable Row Level Security & Permissive Policies for public.enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.enrollments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.enrollments;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.enrollments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.enrollments;

CREATE POLICY "Enable read access for all users" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.enrollments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON public.enrollments FOR DELETE USING (true);

-- 5. Enable Row Level Security & Permissive Policies for public.notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for notifications" ON public.notifications;
DROP POLICY IF EXISTS "Enable insert access for notifications" ON public.notifications;
DROP POLICY IF EXISTS "Enable update access for notifications" ON public.notifications;
DROP POLICY IF EXISTS "Enable delete access for notifications" ON public.notifications;

CREATE POLICY "Enable read access for notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert access for notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for notifications" ON public.notifications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for notifications" ON public.notifications FOR DELETE USING (true);

-- 6. Grant API access
GRANT ALL ON public.enrollments TO anon, authenticated, service_role;
GRANT ALL ON public.notifications TO anon, authenticated, service_role;
