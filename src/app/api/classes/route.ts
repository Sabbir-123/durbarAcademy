import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hbtzcraviwaldjuksmyb.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_TBqS5-Vc3g0PiX2C18IWVg_70ssUgqG";

const supabase = createClient(supabaseUrl, supabaseKey);

function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function ensureUuid(id?: string): string {
  if (isValidUuid(id)) return id!;
  return crypto.randomUUID();
}

async function resolveCourseUuid(targetId?: string): Promise<string | null> {
  if (!targetId) return null;
  if (isValidUuid(targetId)) return targetId;

  try {
    const { data } = await supabase.from("courses").select("id, slug, title");
    if (!data || data.length === 0) return null;
    const norm = (s?: string) => (s || "").toLowerCase().replace(/[-_\s]+/g, "");
    const match = data.find((c: any) => c.id === targetId || norm(c.slug) === norm(targetId) || norm(c.title) === norm(targetId));
    return match?.id || null;
  } catch {
    return null;
  }
}

function extractYouTubeVideoId(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  const longMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];

  return "";
}

export async function GET() {
  try {
    // Read 100% directly from Supabase Production Database
    const { data: supaMilestones, error: mErr } = await supabase.from("milestones").select("*").order("sort_order", { ascending: true });
    const { data: supaModules, error: modErr } = await supabase.from("modules").select("*").order("sort_order", { ascending: true });
    const { data: supaLessons, error: lErr } = await supabase.from("lessons").select("*").order("sort_order", { ascending: true });
    const { data: supaProgress } = await supabase.from("lesson_progress").select("*");

    if (mErr) console.warn("Supabase fetch milestones warning:", mErr.message);
    if (modErr) console.warn("Supabase fetch modules warning:", modErr.message);
    if (lErr) console.warn("Supabase fetch lessons warning:", lErr.message);

    const milestones = (supaMilestones || []).map((sm: any) => ({
      id: sm.id,
      courseId: sm.course_id,
      title: sm.title,
      description: sm.description || "",
      order: sm.sort_order || 1,
      createdAt: sm.created_at || new Date().toISOString(),
    }));

    const modules = (supaModules || []).map((sm: any) => ({
      id: sm.id,
      milestoneId: sm.milestone_id,
      title: sm.title,
      description: "",
      order: sm.sort_order || 1,
      createdAt: sm.created_at || new Date().toISOString(),
    }));

    const classes = (supaLessons || []).map((sl: any) => {
      const vId = sl.youtube_video_id || extractYouTubeVideoId(sl.video_url || "");
      return {
        id: sl.id,
        moduleId: sl.module_id,
        milestoneId: sl.milestone_id || "",
        courseId: sl.course_id || "",
        title: sl.title,
        description: sl.description || "",
        youtubeUrl: sl.video_url || "",
        youtubeVideoId: vId,
        isPublished: sl.is_published ?? true,
        durationMin: sl.duration_minutes || 10,
        order: sl.sort_order || 1,
        tests: [],
        createdAt: sl.created_at || new Date().toISOString(),
      };
    });

    const progress = (supaProgress || []).map((sp: any) => ({
      studentId: sp.student_id,
      lessonId: sp.lesson_id,
      courseId: sp.course_id || "",
      completedAt: sp.completed_at || new Date().toISOString(),
    }));

    return NextResponse.json({ milestones, modules, classes, progress });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, milestones: [], modules: [], classes: [], progress: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    // Ensure valid RFC 4122 UUID for DB insertion
    const targetUuid = ensureUuid(payload?.id);
    const validPayload = { ...payload, id: targetUuid };

    if (action === "save_milestone" && validPayload.id) {
      const courseUuid = await resolveCourseUuid(validPayload.courseId);
      const { error } = await supabase.from("milestones").upsert({
        id: validPayload.id,
        course_id: courseUuid || null,
        title: validPayload.title,
        description: validPayload.description || "",
        sort_order: validPayload.order || 1,
      });
      if (error) console.error("Save milestone DB error:", error.message);
    } else if (action === "save_module" && validPayload.id) {
      const { error } = await supabase.from("modules").upsert({
        id: validPayload.id,
        milestone_id: isValidUuid(validPayload.milestoneId) ? validPayload.milestoneId : null,
        title: validPayload.title,
        sort_order: validPayload.order || 1,
      });
      if (error) console.error("Save module DB error:", error.message);
    } else if (action === "save_class" && validPayload.id) {
      const lessonRow: any = {
        id: validPayload.id,
        module_id: isValidUuid(validPayload.moduleId) ? validPayload.moduleId : null,
        title: validPayload.title,
        description: validPayload.description || "",
        video_url: validPayload.youtubeUrl || "",
        duration_minutes: validPayload.durationMin || 10,
        sort_order: validPayload.order || 1,
      };

      const { error } = await supabase.from("lessons").upsert(lessonRow);
      if (error) console.error("Save lesson DB error:", error.message);
    } else if (action === "delete_milestone" && isValidUuid(payload.id)) {
      await supabase.from("milestones").delete().eq("id", payload.id);
    } else if (action === "delete_module" && isValidUuid(payload.id)) {
      await supabase.from("modules").delete().eq("id", payload.id);
    } else if (action === "delete_class" && isValidUuid(payload.id)) {
      await supabase.from("lessons").delete().eq("id", payload.id);
    } else if (action === "record_progress") {
      if (isValidUuid(payload.studentId) && isValidUuid(payload.lessonId)) {
        await supabase.from("lesson_progress").upsert({
          student_id: payload.studentId,
          lesson_id: payload.lessonId,
          course_id: payload.courseId || null,
        });
      }
    }

    // Return latest database state
    return GET();
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
