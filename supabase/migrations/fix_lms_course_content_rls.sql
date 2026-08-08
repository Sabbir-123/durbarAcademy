-- Fix RLS Policies, Tables, and Schema for LMS Architecture

-- 1. Course Teachers Relationship
CREATE TABLE IF NOT EXISTS public.course_teachers (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, teacher_id)
);

ALTER TABLE public.course_teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Course teachers viewable by authenticated users" ON public.course_teachers;
CREATE POLICY "Course teachers viewable by authenticated users" ON public.course_teachers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can modify course teachers" ON public.course_teachers;
CREATE POLICY "Admins can modify course teachers" ON public.course_teachers FOR ALL USING (true) WITH CHECK (true);

-- 2. Milestones RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Milestones viewable by everyone" ON public.milestones;
CREATE POLICY "Milestones viewable by everyone" ON public.milestones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all modification to milestones" ON public.milestones;
CREATE POLICY "Allow all modification to milestones" ON public.milestones FOR ALL USING (true) WITH CHECK (true);

-- 3. Modules RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Modules viewable by everyone" ON public.modules;
CREATE POLICY "Modules viewable by everyone" ON public.modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all modification to modules" ON public.modules;
CREATE POLICY "Allow all modification to modules" ON public.modules FOR ALL USING (true) WITH CHECK (true);

-- 4. Lessons (Classes) Schema & RLS
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS milestone_id TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS course_id TEXT;

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lessons viewable by everyone" ON public.lessons;
CREATE POLICY "Lessons viewable by everyone" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all modification to lessons" ON public.lessons;
CREATE POLICY "Allow all modification to lessons" ON public.lessons FOR ALL USING (true) WITH CHECK (true);

-- 5. Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    student_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    course_id TEXT,
    completed_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (student_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lesson progress viewable by everyone" ON public.lesson_progress;
CREATE POLICY "Lesson progress viewable by everyone" ON public.lesson_progress FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lesson progress insertable by everyone" ON public.lesson_progress;
CREATE POLICY "Lesson progress insertable by everyone" ON public.lesson_progress FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lesson progress updatable by everyone" ON public.lesson_progress;
CREATE POLICY "Lesson progress updatable by everyone" ON public.lesson_progress FOR UPDATE USING (true);
