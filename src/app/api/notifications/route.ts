import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hbtzcraviwaldjuksmyb.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_TBqS5-Vc3g0PiX2C18IWVg_70ssUgqG";

const supabase = createClient(supabaseUrl, supabaseKey);


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");
    const studentEmail = searchParams.get("student_email");

    let query = supabase.from("notifications").select("*").order("created_at", { ascending: false });

    if (studentId && studentEmail) {
      query = query.or(`student_id.eq.${studentId},student_email.eq.${studentEmail}`);
    } else if (studentId) {
      query = query.eq("student_id", studentId);
    } else if (studentEmail) {
      query = query.eq("student_email", studentEmail);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("GET /api/notifications error:", error.message);
      return NextResponse.json({ success: true, notifications: [] });
    }

    return NextResponse.json({ success: true, notifications: data || [] });
  } catch (err: any) {
    console.error("GET /api/notifications exception:", err);
    return NextResponse.json({ success: true, notifications: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `NOTIF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const notif = {
      id,
      student_id: body.student_id || "",
      student_email: body.student_email || "",
      title: body.title || "বিজ্ঞপ্তি",
      message: body.message || "",
      type: body.type || "info", // 'approved', 'rejected', 'modification_needed', 'info'
      action_url: body.action_url || "",
      is_read: false,
      created_at: now,
    };

    const { error } = await supabase.from("notifications").upsert(notif);
    if (error) {
      console.warn("POST /api/notifications error:", error.message);
    }

    return NextResponse.json({ success: true, notification: notif });
  } catch (err: any) {
    console.error("POST /api/notifications exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, is_read } = body;

    if (id) {
      await supabase.from("notifications").update({ is_read: !!is_read }).eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PATCH /api/notifications exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
