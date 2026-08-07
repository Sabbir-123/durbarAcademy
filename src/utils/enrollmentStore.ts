import { createClient } from "@/utils/supabase/client";

export interface EnrollmentRecord {
  id: string;
  student_id: string;
  student_email?: string;
  course_id: string;
  course_title: string;
  course_price?: number;
  student_name: string;
  student_phone: string;
  college?: string;
  branch: string;
  payment_method: string;
  sender_number: string;
  trx_id: string;
  payment_screenshot?: string;
  status: "pending" | "approved" | "rejected" | "modification_needed";
  admin_note?: string;
  created_at: string;
  updated_at?: string;
}

const STORAGE_KEY = "durbar_enrollment_requests_v1";

const DEFAULT_RECORDS: EnrollmentRecord[] = [];

/** Helper to convert arbitrary string IDs (e.g. "ENR-1234", "guest-5678") to valid UUID format for PostgreSQL */
export function toValidUUID(str: string): string {
  if (!str) return "00000000-0000-4000-8000-000000000001";
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;

  const digits = str.replace(/\D/g, "");
  const padded = (digits || "1").padStart(12, "0").slice(-12);
  return `00000000-0000-4000-8000-${padded}`;
}

export function getStoredEnrollments(): EnrollmentRecord[] {
  if (typeof window === "undefined") return DEFAULT_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_RECORDS;
  } catch {
    return DEFAULT_RECORDS;
  }
}

export function saveEnrollmentStore(record: EnrollmentRecord): EnrollmentRecord[] {
  const current = getStoredEnrollments();
  const existingIdx = current.findIndex(
    (e) => e.id === record.id || (e.student_id === record.student_id && e.course_id === record.course_id)
  );

  let updated: EnrollmentRecord[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...record };
  } else {
    updated = [record, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("durbar_enrollments_updated"));
  }
  return updated;
}

export async function fetchEnrollmentsFromDatabase(): Promise<EnrollmentRecord[]> {
  if (typeof window === "undefined") return getStoredEnrollments();
  try {
    const supabase = createClient();

    // Select directly from enrollments table without fragile joins that break on FK mismatch
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Fetch enrollments error from Supabase:", error);
      return getStoredEnrollments();
    }

    if (!data || data.length === 0) {
      return getStoredEnrollments();
    }

    const dbRecords: EnrollmentRecord[] = data.map((item: any) => ({
      id: item.id,
      student_id: item.student_id || "",
      student_email: item.student_email || item.email || "",
      course_id: item.course_id || "",
      course_title: item.course_title || "ডিফেন্স ও মিলিটারি কোর্স",
      course_price: Number(item.course_price) || 8500,
      student_name: item.student_name || "শিক্ষার্থী",
      student_phone: item.student_phone || item.sender_number || "",
      college: item.college || "",
      branch: item.branch || "online",
      payment_method: item.payment_method || "bKash",
      sender_number: item.sender_number || "",
      trx_id: item.trx_id || "",
      payment_screenshot: item.payment_screenshot || "",
      status: (item.status === "active" ? "approved" : item.status) as any || "pending",
      admin_note: item.admin_note || "",
      created_at: item.enrolled_at || item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    }));

    for (const rec of dbRecords) {
      saveEnrollmentStore(rec);
    }
    return dbRecords;
  } catch (err) {
    console.warn("fetchEnrollmentsFromDatabase exception:", err);
    return getStoredEnrollments();
  }
}

export async function submitEnrollmentRequest(
  record: Omit<EnrollmentRecord, "id" | "created_at" | "status"> & { id?: string }
): Promise<EnrollmentRecord> {
  const rawId = record.id || `ENR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const validDbId = toValidUUID(rawId);
  const now = new Date().toISOString();

  const supabase = createClient();
  let authenticatedStudentId = record.student_id;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      authenticatedStudentId = user.id;
    }
  } catch {}

  const validStudentUUID = toValidUUID(authenticatedStudentId);
  const validCourseUUID = toValidUUID(record.course_id);

  const newRecord: EnrollmentRecord = {
    ...record,
    id: rawId,
    student_id: authenticatedStudentId,
    status: "pending",
    created_at: now,
    updated_at: now,
  };

  // 1. Save to local storage store for instant client update
  saveEnrollmentStore(newRecord);

  // 2. Persist to Supabase database so Admin Panel receives it instantly!
  try {
    const payload: any = {
      id: validDbId,
      student_id: validStudentUUID,
      course_id: validCourseUUID,
      status: "pending",
      trx_id: newRecord.trx_id,
      sender_number: newRecord.sender_number,
      payment_method: newRecord.payment_method,
      payment_screenshot: newRecord.payment_screenshot || "",
      student_name: newRecord.student_name,
      student_phone: newRecord.student_phone,
      branch: newRecord.branch,
      college: newRecord.college || "",
      course_title: newRecord.course_title,
      course_price: newRecord.course_price || 8500,
      student_email: newRecord.student_email || "",
      updated_at: now,
    };

    const { error: upsertErr } = await supabase
      .from("enrollments")
      .upsert(payload);

    if (upsertErr) {
      console.warn("Supabase upsert with FK error, attempting fallback without foreign keys:", upsertErr);
      // Fallback: insert with null course_id & student_id if foreign key constraints failed
      await supabase.from("enrollments").upsert({
        ...payload,
        student_id: null,
        course_id: null,
      });
    }
  } catch (err) {
    console.warn("Supabase enrollments submit exception:", err);
  }

  return newRecord;
}

export async function updateEnrollmentStatusStore(
  enrollmentId: string,
  status: "approved" | "rejected" | "modification_needed",
  admin_note?: string
): Promise<EnrollmentRecord[]> {
  const current = getStoredEnrollments();
  const target = current.find((e) => e.id === enrollmentId);
  const now = new Date().toISOString();

  const dbStatus = status === "approved" ? "active" : status;

  if (target) {
    const updatedRecord: EnrollmentRecord = {
      ...target,
      status,
      admin_note: admin_note || "",
      updated_at: now,
    };

    saveEnrollmentStore(updatedRecord);

    try {
      const supabase = createClient();
      const validDbId = toValidUUID(enrollmentId);

      const { error } = await supabase
        .from("enrollments")
        .update({
          status: dbStatus,
          admin_note: admin_note || "",
          updated_at: now,
        })
        .or(`id.eq.${enrollmentId},id.eq.${validDbId}`);

      if (error) {
        console.warn("Supabase status update error:", error);
      }
    } catch (err) {
      console.warn("Supabase status update exception:", err);
    }
  }

  return getStoredEnrollments();
}

export async function resubmitEnrollmentRequestStore(
  enrollmentId: string,
  updatedFields: Partial<EnrollmentRecord>
): Promise<EnrollmentRecord[]> {
  const current = getStoredEnrollments();
  const target = current.find((e) => e.id === enrollmentId);
  const now = new Date().toISOString();

  if (target) {
    const updatedRecord: EnrollmentRecord = {
      ...target,
      ...updatedFields,
      status: "pending",
      admin_note: "",
      updated_at: now,
    };

    saveEnrollmentStore(updatedRecord);

    try {
      const supabase = createClient();
      const validDbId = toValidUUID(enrollmentId);

      await supabase
        .from("enrollments")
        .update({
          status: "pending",
          trx_id: updatedRecord.trx_id,
          sender_number: updatedRecord.sender_number,
          payment_method: updatedRecord.payment_method,
          payment_screenshot: updatedRecord.payment_screenshot,
          student_name: updatedRecord.student_name,
          student_phone: updatedRecord.student_phone,
          branch: updatedRecord.branch,
          college: updatedRecord.college,
          admin_note: "",
          updated_at: now,
        })
        .or(`id.eq.${enrollmentId},id.eq.${validDbId}`);
    } catch (err) {
      console.warn("Supabase resubmission exception:", err);
    }
  }

  return getStoredEnrollments();
}

export function subscribeEnrollmentStore(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("durbar_enrollments_updated", handler);
  return () => window.removeEventListener("durbar_enrollments_updated", handler);
}
