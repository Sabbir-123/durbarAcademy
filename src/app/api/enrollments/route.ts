import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hbtzcraviwaldjuksmyb.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_TBqS5-Vc3g0PiX2C18IWVg_70ssUgqG";

const supabase = createClient(supabaseUrl, supabaseKey);

const BLACKLISTED_TRX_IDS = new Set([
  "ytertcch",
  "9jas#21l",
  "192124h10",
  "9999999",
]);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase GET enrollments error:", error.message);
      return NextResponse.json({ success: true, enrollments: [] });
    }

    const cleanList = (data || [])
      .filter((r: any) => !r.trx_id || !BLACKLISTED_TRX_IDS.has(r.trx_id.trim().toLowerCase()))
      .map((r: any) => ({
        id: r.id,
        student_id: r.student_id || "",
        student_email: r.student_email || "",
        course_id: r.course_id || "",
        course_title: r.course_title || "ডিফেন্স ও মিলিটারি কোর্স",
        course_price: Number(r.course_price) || 8500,
        student_name: r.student_name || "শিক্ষার্থী",
        student_phone: r.student_phone || r.sender_number || "",
        college: r.college || "",
        branch: r.branch || "online",
        payment_method: r.payment_method || "bKash",
        sender_number: r.sender_number || "",
        trx_id: r.trx_id || "",
        payment_screenshot: r.payment_screenshot || "",
        status: (r.status === "active" ? "approved" : r.status) || "pending",
        admin_note: r.admin_note || "",
        created_at: r.enrolled_at || r.created_at || new Date().toISOString(),
        updated_at: r.updated_at || new Date().toISOString(),
      }));

    return NextResponse.json({ success: true, enrollments: cleanList });
  } catch (err: any) {
    console.error("GET /api/enrollments exception:", err);
    return NextResponse.json({ success: true, enrollments: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();

    const record = {
      id: body.id || `ENR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      student_id: body.student_id || `guest-${Date.now()}`,
      student_email: body.student_email || "",
      course_id: body.course_id || "",
      course_title: body.course_title || "ডিফেন্স ও মিলিটারি কোর্স",
      course_price: Number(body.course_price) || 8500,
      student_name: body.student_name || "শিক্ষার্থী",
      student_phone: body.student_phone || body.sender_number || "",
      college: body.college || "",
      branch: body.branch || "online",
      payment_method: body.payment_method || "bKash",
      sender_number: body.sender_number || "",
      trx_id: body.trx_id || "",
      payment_screenshot: body.payment_screenshot || "",
      status: body.status || "pending",
      admin_note: body.admin_note || "",
      created_at: body.created_at || now,
      updated_at: now,
    };

    // Save 100% directly to Supabase Database
    const { error } = await supabase.from("enrollments").upsert({
      id: record.id,
      student_id: record.student_id,
      course_id: record.course_id,
      status: record.status,
      trx_id: record.trx_id,
      sender_number: record.sender_number,
      payment_method: record.payment_method,
      payment_screenshot: record.payment_screenshot,
      student_name: record.student_name,
      student_phone: record.student_phone,
      branch: record.branch,
      college: record.college,
      course_title: record.course_title,
      course_price: record.course_price,
      admin_note: record.admin_note,
      student_email: record.student_email,
      updated_at: now,
    });

    if (error) {
      console.error("Supabase POST enrollments error:", error.message);
    }

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    console.error("POST /api/enrollments exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, admin_note } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const dbStatus = status === "approved" ? "active" : status;

    // Update 100% directly in Supabase Database
    const { error } = await supabase
      .from("enrollments")
      .update({
        status: dbStatus,
        admin_note: admin_note || "",
        updated_at: now,
      })
      .eq("id", id);

    if (error) {
      console.error("Supabase PATCH enrollments error:", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PATCH /api/enrollments exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    if (clearAll) {
      await supabase.from("enrollments").delete().neq("status", "impossible_status_999");
      return NextResponse.json({ success: true, enrollments: [] });
    }

    if (id) {
      await supabase.from("enrollments").delete().eq("id", id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Missing id or all parameter" }, { status: 400 });
  } catch (err: any) {
    console.error("DELETE /api/enrollments exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
