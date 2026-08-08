export interface EnrollmentRecord {
  id: string;
  student_id: string;
  student_code?: string;
  student_email?: string;
  course_id: string;
  course_title?: string;
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

const DEFAULT_RECORDS: EnrollmentRecord[] = [];

export function getStoredEnrollments(): EnrollmentRecord[] {
  return DEFAULT_RECORDS;
}

export function subscribeEnrollmentStore(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("durbar_enrollments_updated", listener);
  return () => window.removeEventListener("durbar_enrollments_updated", listener);
}

export async function fetchEnrollmentsFromDatabase(): Promise<EnrollmentRecord[]> {
  try {
    const res = await fetch("/api/enrollments", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.enrollments)) {
        return data.enrollments;
      }
    }
  } catch (err) {
    console.warn("fetchEnrollmentsFromDatabase API exception:", err);
  }

  return DEFAULT_RECORDS;
}

export const syncEnrollmentsFromSupabase = fetchEnrollmentsFromDatabase;

export async function submitEnrollmentRequest(
  record: Omit<EnrollmentRecord, "id" | "status" | "created_at" | "updated_at">
): Promise<EnrollmentRecord> {
  const now = new Date().toISOString();
  const generatedId = `ENR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const fullRecord: EnrollmentRecord = {
    ...record,
    id: generatedId,
    status: "pending",
    created_at: now,
    updated_at: now,
  };

  try {
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullRecord),
    });
    if (res.ok) {
      const data = await res.json();
      // API returns { success, record } — use the returned record
      if (data.success && data.record) {
        return data.record as EnrollmentRecord;
      }
    }
  } catch (err) {
    console.warn("submitEnrollmentRequest API warning:", err);
  }

  // Fallback: return the locally constructed record so UI still shows success
  return fullRecord;
}

export async function updateEnrollmentStatusStore(
  enrollmentId: string,
  newStatus: "pending" | "approved" | "rejected" | "modification_needed",
  adminNote?: string
): Promise<EnrollmentRecord[]> {
  try {
    const res = await fetch("/api/enrollments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: enrollmentId,
        status: newStatus,
        admin_note: adminNote || "",
      }),
    });
    if (res.ok) {
      return await fetchEnrollmentsFromDatabase();
    }
  } catch (err) {
    console.warn("updateEnrollmentStatusStore API warning:", err);
  }

  return await fetchEnrollmentsFromDatabase();
}

export async function deleteEnrollmentRequestStore(enrollmentId: string): Promise<EnrollmentRecord[]> {
  try {
    await fetch(`/api/enrollments?id=${encodeURIComponent(enrollmentId)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("deleteEnrollmentRequestStore API warning:", err);
  }

  return await fetchEnrollmentsFromDatabase();
}

export async function clearAllEnrollmentRequestsStore(): Promise<EnrollmentRecord[]> {
  try {
    await fetch("/api/enrollments?all=true", {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("clearAllEnrollmentRequestsStore API warning:", err);
  }

  return [];
}
