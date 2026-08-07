import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hbtzcraviwaldjuksmyb.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_TBqS5-Vc3g0PiX2C18IWVg_70ssUgqG";

const supabase = createClient(supabaseUrl, supabaseKey);

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db_enrollments.json");

function readDiskEnrollments(): any[] {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.warn("Error reading db_enrollments.json:", err);
  }
  return [];
}

function writeDiskEnrollments(data: any[]) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Error writing to db_enrollments.json:", err);
  }
}

export async function GET() {
  const diskList = readDiskEnrollments();

  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, enrollments: diskList });
    }

    const mergedMap = new Map();
    diskList.forEach((r) => mergedMap.set(r.id, r));

    data.forEach((r: any) => {
      mergedMap.set(r.id, {
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
      });
    });

    const combinedList = Array.from(mergedMap.values()).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    writeDiskEnrollments(combinedList);

    return NextResponse.json({ success: true, enrollments: combinedList });
  } catch (err: any) {
    return NextResponse.json({ success: true, enrollments: diskList });
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

    // 1. Save to persistent server JSON file
    const currentList = readDiskEnrollments();
    const existingIdx = currentList.findIndex((e) => e.id === record.id || (e.trx_id && e.trx_id === record.trx_id));
    if (existingIdx >= 0) {
      currentList[existingIdx] = { ...currentList[existingIdx], ...record };
    } else {
      currentList.unshift(record);
    }
    writeDiskEnrollments(currentList);

    // 2. Also try inserting to Supabase DB if SQL table schema is active
    try {
      await supabase.from("enrollments").upsert({
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
    } catch (dbErr: any) {}

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
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

    // 1. Update persistent server JSON file
    const currentList = readDiskEnrollments();
    const idx = currentList.findIndex((e) => e.id === id);
    if (idx >= 0) {
      currentList[idx].status = status;
      currentList[idx].admin_note = admin_note || "";
      currentList[idx].updated_at = now;
      writeDiskEnrollments(currentList);
    }

    // 2. Update Supabase DB
    const dbStatus = status === "approved" ? "active" : status;
    try {
      await supabase
        .from("enrollments")
        .update({
          status: dbStatus,
          admin_note: admin_note || "",
          updated_at: now,
        })
        .eq("id", id);
    } catch (dbErr: any) {}

    return NextResponse.json({ success: true, updatedRecord: idx >= 0 ? currentList[idx] : null });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    if (clearAll) {
      writeDiskEnrollments([]);
      try {
        await supabase.from("enrollments").delete().neq("id", "impossible_non_existent_id_999");
      } catch (err) {}
      return NextResponse.json({ success: true, enrollments: [] });
    }

    if (id) {
      const currentList = readDiskEnrollments();
      const updatedList = currentList.filter((e) => e.id !== id);
      writeDiskEnrollments(updatedList);

      try {
        await supabase.from("enrollments").delete().eq("id", id);
      } catch (err) {}

      return NextResponse.json({ success: true, enrollments: updatedList });
    }

    return NextResponse.json({ success: false, error: "Missing id or all parameter" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
