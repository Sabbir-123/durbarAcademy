-- ==============================================================================
-- DURBAR ACADEMY - ENROLLMENTS & ADMISSION REVIEW SYSTEM DATABASE MIGRATION
-- Run this complete script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Create or ensure public.enrollments table exists
CREATE TABLE IF NOT EXISTS public.enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT,
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

-- 2. Ensure all columns exist (in case table was previously created with different schema)
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS student_id TEXT;
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

-- 3. Drop any restrictive Foreign Key constraints if present
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_fkey;
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_course_id_fkey;

-- 4. Enable Row Level Security & Create 100% Permissive Policies for Anon and Authenticated Roles
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.enrollments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.enrollments;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.enrollments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.enrollments;

CREATE POLICY "Enable read access for all users" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.enrollments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON public.enrollments FOR DELETE USING (true);

-- 5. Grant Full API Access to anon, authenticated, and service_role
GRANT ALL ON public.enrollments TO anon, authenticated, service_role;
