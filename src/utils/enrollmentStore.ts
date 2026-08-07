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

export function getStoredEnrollments(): EnrollmentRecord[] {
  if (typeof window === "undefined") return DEFAULT_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RECORDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_RECORDS;
  } catch {
    return DEFAULT_RECORDS;
  }
}

export function saveEnrollmentStore(record: EnrollmentRecord): EnrollmentRecord[] {
  const current = getStoredEnrollments();
  const existingIdx = current.findIndex(
    (e) => e.id === record.id || (e.trx_id && e.trx_id === record.trx_id)
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

export async function deleteEnrollmentRequestStore(enrollmentId: string): Promise<EnrollmentRecord[]> {
  const current = getStoredEnrollments();
  const updated = current.filter((e) => e.id !== enrollmentId);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("durbar_enrollments_updated"));
  }

  try {
    await fetch(`/api/enrollments?id=${encodeURIComponent(enrollmentId)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("deleteEnrollmentRequestStore API warning:", err);
  }

  return updated;
}

export async function clearAllEnrollmentRequestsStore(): Promise<EnrollmentRecord[]> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("durbar_enrollments_updated"));
  }

  try {
    await fetch("/api/enrollments?all=true", {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("clearAllEnrollmentRequestsStore API warning:", err);
  }

  return [];
}

export async function fetchEnrollmentsFromDatabase(): Promise<EnrollmentRecord[]> {
  const localItems = getStoredEnrollments();

  if (typeof window === "undefined") return localItems;

  try {
    // 1. Sync local items to server API first
    for (const item of localItems) {
      try {
        await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
      } catch (err) {}
    }

    // 2. Fetch all combined enrollments from server API
    const res = await fetch("/api/enrollments", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.enrollments)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.enrollments));
        return data.enrollments;
      }
    }
  } catch (err) {
    console.warn("fetchEnrollmentsFromDatabase API exception:", err);
  }

  return getStoredEnrollments();
}

export async function submitEnrollmentRequest(
  record: Omit<EnrollmentRecord, "id" | "created_at" | "status"> & { id?: string }
): Promise<EnrollmentRecord> {
  const rawId = record.id || `ENR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newRecord: EnrollmentRecord = {
    ...record,
    id: rawId,
    status: "pending",
    created_at: now,
    updated_at: now,
  };

  // 1. Save locally for instant UI update
  saveEnrollmentStore(newRecord);

  // 2. Push to Server API route so Admin receives it instantly
  try {
    await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord),
    });
  } catch (err) {
    console.warn("submitEnrollmentRequest API post warning:", err);
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

  if (target) {
    const updatedRecord: EnrollmentRecord = {
      ...target,
      status,
      admin_note: admin_note || "",
      updated_at: now,
    };

    saveEnrollmentStore(updatedRecord);

    try {
      await fetch("/api/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: enrollmentId, status, admin_note }),
      });
    } catch (err) {
      console.warn("updateEnrollmentStatusStore API patch warning:", err);
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
      await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecord),
      });
    } catch (err) {
      console.warn("resubmitEnrollmentRequestStore API post warning:", err);
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
