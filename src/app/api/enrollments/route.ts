import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hbtzcraviwaldjuksmyb.supabase.co";
// IMPORTANT: Use the service role key (server-side only) so DB writes bypass RLS
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_TBqS5-Vc3g0PiX2C18IWVg_70ssUgqG";

const supabase = createClient(supabaseUrl, supabaseKey);


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

    const cleanList = (data || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id || "",
      student_code: r.student_code || "",
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

const isValidUUID = (str?: string): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();

    const recordId = isValidUUID(body.id) ? body.id : crypto.randomUUID();

    const record = {
      id: recordId,
      student_id: body.student_id || "",
      student_code: body.student_code || "",
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

    // Save directly to Supabase Database with UUID resilience
    let { error } = await supabase.from("enrollments").upsert({
      id: record.id,
      student_id: isValidUUID(record.student_id) ? record.student_id : (record.student_id || null),
      student_code: record.student_code,
      course_id: isValidUUID(record.course_id) ? record.course_id : (record.course_id || null),
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

    if (error && error.message.includes("uuid")) {
      console.warn("Retrying upsert with sanitized UUID fields:", error.message);
      const fallbackResult = await supabase.from("enrollments").upsert({
        id: record.id,
        student_id: isValidUUID(record.student_id) ? record.student_id : null,
        course_id: isValidUUID(record.course_id) ? record.course_id : null,
        student_code: record.student_code,
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
      error = fallbackResult.error;
    }

    if (error) {
      console.error("Supabase POST enrollments error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Auto-create initial submission notification
    try {
      const notifStudentId = isValidUUID(record.student_id) ? record.student_id : null;
      await supabase.from("notifications").upsert({
        id: crypto.randomUUID(),
        student_id: notifStudentId,
        student_email: record.student_email,
        title: "ভর্তি আবেদন জমা হয়েছে",
        message: `আপনার ${record.course_title} কোর্সের আবেদন সফলভাবে জমা হয়েছে। আগামী ২৪ ঘণ্টার মধ্যে অ্যাডমিন প্যানেল থেকে যাঁচাই করে জানিয়ে দেওয়া হবে।`,
        type: "info",
        action_url: "/student/courses",
        is_read: false,
        created_at: now,
      });
    } catch (notifErr) {}

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

    // Build update payload — always include status/admin_note,
    // also accept payment resubmission fields
    const updatePayload: Record<string, any> = {
      status: dbStatus,
      admin_note: admin_note || "",
      updated_at: now,
    };
    if (body.sender_number !== undefined) updatePayload.sender_number = body.sender_number;
    if (body.trx_id !== undefined) updatePayload.trx_id = body.trx_id;
    if (body.payment_screenshot !== undefined) updatePayload.payment_screenshot = body.payment_screenshot;

    // Fetch existing enrollment to get student_id & course_title
    const { data: existing } = await supabase.from("enrollments").select("*").eq("id", id).maybeSingle();

    // Update Supabase Database
    const { error } = await supabase
      .from("enrollments")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Supabase PATCH enrollments error:", error.message);
    }

    // Create tailored live notification for the student based on status
    if (existing) {
      let notifTitle = "ভর্তি আবেদন আপডেট";
      let notifMsg = `আপনার ${existing.course_title || "কোর্স"} আবেদনের স্ট্যাটাস আপডেট হয়েছে।`;
      let notifType = "info";
      let actionUrl = "/student/courses";

      if (status === "approved") {
        notifTitle = "✅ ভর্তি আবেদন অনুমোদিত হয়েছে!";
        notifMsg = `অভিনন্দন! আপনার ${existing.course_title || "কোর্স"} কোর্সে ভর্তি নিশ্চিত হয়েছে। এখন সকল ক্লাস ও পরীক্ষার পূর্ণ অ্যাক্সেস পাবেন।`;
        notifType = "approved";
        actionUrl = `/student/courses/${existing.course_id}`;
      } else if (status === "rejected") {
        notifTitle = "❌ ভর্তি আবেদন বাতিল হয়েছে";
        notifMsg = `দুঃখিত, আপনার ${existing.course_title || "কোর্স"} কোর্সের আবেদনটি বাতিল করা হয়েছে। কারণ: ${admin_note || "পেমেন্ট তথ্য যাঁচাই করা যায়নি।"}`;
        notifType = "rejected";
        actionUrl = "/student/courses";
      } else if (status === "modification_needed") {
        notifTitle = "⚠️ আবেদন তথ্য সংশোধন নির্দেশ";
        notifMsg = `আপনার ${existing.course_title || "কোর্স"} কোর্সের আবেদনে তথ্যের সংশোধন প্রয়োজন। নির্দেশ: ${admin_note || "সঠিক ট্রানজেকশন আইডি বা রসিদ প্রদান করুন।"}`;
        notifType = "modification_needed";
        actionUrl = `/checkout?courseId=${existing.course_id}&editEnrollmentId=${existing.id}`;
      }

      try {
        await supabase.from("notifications").upsert({
          id: `NOTIF-${status.toUpperCase()}-${id}-${Date.now()}`,
          student_id: existing.student_id,
          student_email: existing.student_email,
          title: notifTitle,
          message: notifMsg,
          type: notifType,
          action_url: actionUrl,
          is_read: false,
          created_at: now,
        });
      } catch (notifErr) {}
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
