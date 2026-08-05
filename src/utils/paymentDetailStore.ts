"use client";

import { createClient } from "@/utils/supabase/client";

export interface PaymentDetail {
  id: string;
  method_type: "bkash" | "nagad" | "rocket" | "bank" | "other";
  title: string;                 // Display label e.g., "bKash Personal" or "DBBL Bank Account"
  account_type?: "personal" | "agent" | "merchant" | "bank_account"; // Mobile banking category or bank account
  mobile_number?: string;        // Phone number for bKash/Nagad/Rocket
  
  // Bank specific fields
  bank_name?: string;            // e.g. Dutch-Bangla Bank PLC
  account_holder_name?: string;  // e.g. Durbar Academy Ltd.
  account_number?: string;       // Account number
  branch_name?: string;          // Branch name
  district?: string;             // District name
  routing_number?: string;       // Routing number (optional)
  
  instructions?: string;         // Guidance notes for students
  is_active: boolean;            // Active / inactive status toggle
  created_at: string;
  updated_at: string;
}

// Initial seed data if database table is completely empty on first launch
export const INITIAL_PAYMENT_DETAILS: PaymentDetail[] = [
  {
    id: "pay-bkash-1",
    method_type: "bkash",
    title: "bKash (বিকাশ) পার্সোনাল",
    account_type: "personal",
    mobile_number: "01712345678",
    instructions: "bKash অ্যাপ থেকে Send Money সিলেক্ট করে ফি পাঠিয়ে TrxID প্রদান করুন।",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "pay-bkash-2",
    method_type: "bkash",
    title: "bKash (বিকাশ) মার্চেন্ট",
    account_type: "merchant",
    mobile_number: "01888990011",
    instructions: "bKash অ্যাপে Make Payment এর মাধ্যমে মার্চেন্ট পেমেন্ট সম্পন্ন করুন।",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "pay-nagad-1",
    method_type: "nagad",
    title: "Nagad (নগদ) পার্সোনাল",
    account_type: "personal",
    mobile_number: "01788776655",
    instructions: "নগদ অ্যাপ অথবা *167# ডায়াল করে সেন্ড মানি করুন।",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "pay-bank-1",
    method_type: "bank",
    title: "ডাচ-বাংলা ব্যাংক লিমিটেড (DBBL)",
    account_type: "bank_account",
    bank_name: "Dutch-Bangla Bank PLC",
    account_holder_name: "Durbar Academy Ltd.",
    account_number: "164.110.9876543",
    branch_name: "Dhanmondi Branch",
    district: "Dhaka",
    routing_number: "090261111",
    instructions: "ব্যাংক জমা বা অনলাইনে EFT/NPSB এর মাধ্যমে ফান্ড ট্রান্সফার করুন এবং রেফারেন্স বা জমা রশিদ নম্বর দিন।",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const STORAGE_KEY = "durbar_payment_details_db_cache";

function getStoredFallback(): PaymentDetail[] {
  if (typeof window === "undefined") return INITIAL_PAYMENT_DETAILS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PAYMENT_DETAILS;
  } catch {
    return INITIAL_PAYMENT_DETAILS;
  }
}

function setStoredFallback(items: PaymentDetail[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("durbar_payment_details_updated"));
  } catch {}
}

/**
 * Fetch payment details directly from Supabase database `payment_details` table.
 * Fallbacks to local storage seamlessly if Supabase table is not created yet.
 */
export async function fetchPaymentDetailsFromDatabase(): Promise<PaymentDetail[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("payment_details")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Payment Details DB Note] Supabase query:", error.message);
      return getStoredFallback();
    }

    if (!data || data.length === 0) {
      const fallback = getStoredFallback();
      try {
        await supabase.from("payment_details").upsert(fallback);
      } catch {}
      return fallback;
    }

    const dbItems: PaymentDetail[] = data.map((item: any) => ({
      id: item.id,
      method_type: item.method_type || "bkash",
      title: item.title || "Payment Account",
      account_type: item.account_type || "personal",
      mobile_number: item.mobile_number || "",
      bank_name: item.bank_name || "",
      account_holder_name: item.account_holder_name || "",
      account_number: item.account_number || "",
      branch_name: item.branch_name || "",
      district: item.district || "",
      routing_number: item.routing_number || "",
      instructions: item.instructions || "",
      is_active: item.is_active ?? true,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    }));

    setStoredFallback(dbItems);
    return dbItems;
  } catch (err) {
    return getStoredFallback();
  }
}

/**
 * Save/Upsert payment detail DIRECTLY into Supabase database.
 * Gracefully handles missing database table without crashing the UI.
 */
export async function savePaymentDetailToDatabase(item: Partial<PaymentDetail>): Promise<PaymentDetail[]> {
  const current = getStoredFallback();
  const now = new Date().toISOString();

  const newItem: PaymentDetail = {
    id: item.id || `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    method_type: item.method_type || "bkash",
    title: item.title || "নতুন পেমেন্ট মেথড",
    account_type: item.account_type || "personal",
    mobile_number: item.mobile_number || "",
    bank_name: item.bank_name || "",
    account_holder_name: item.account_holder_name || "",
    account_number: item.account_number || "",
    branch_name: item.branch_name || "",
    district: item.district || "",
    routing_number: item.routing_number || "",
    instructions: item.instructions || "",
    is_active: item.is_active ?? true,
    created_at: item.created_at || now,
    updated_at: now,
  };

  let updatedList: PaymentDetail[];
  if (item.id) {
    updatedList = current.map((p) => (p.id === item.id ? { ...p, ...item, updated_at: now } as PaymentDetail : p));
  } else {
    updatedList = [newItem, ...current];
  }

  // Update local cache immediately so UI feels instant
  setStoredFallback(updatedList);

  // Sync to Supabase DB asynchronously
  try {
    const supabase = createClient();
    const { error } = await supabase.from("payment_details").upsert(newItem);
    if (error) {
      console.warn("[Payment Details DB Note]: Table 'public.payment_details' does not exist yet in Supabase. Please run the SQL migration in Supabase SQL Editor.");
    }
  } catch (e) {
    console.warn("Supabase upsert skipped:", e);
  }

  return updatedList;
}

/**
 * Delete payment detail DIRECTLY from Supabase database.
 */
export async function deletePaymentDetailFromDatabase(id: string): Promise<PaymentDetail[]> {
  const current = getStoredFallback();
  const updatedList = current.filter((p) => p.id !== id);
  setStoredFallback(updatedList);

  try {
    const supabase = createClient();
    const { error } = await supabase.from("payment_details").delete().eq("id", id);
    if (error) {
      console.warn("[Payment Details DB Note] Delete failed:", error.message);
    }
  } catch (e) {
    console.warn("Supabase delete skipped:", e);
  }

  return updatedList;
}

/**
 * Toggle payment detail active status DIRECTLY in Supabase database.
 */
export async function togglePaymentDetailStatusInDatabase(id: string, currentStatus: boolean): Promise<PaymentDetail[]> {
  const current = getStoredFallback();
  const updatedList = current.map((p) =>
    p.id === id ? { ...p, is_active: !currentStatus, updated_at: new Date().toISOString() } : p
  );
  setStoredFallback(updatedList);

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("payment_details")
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.warn("[Payment Details DB Note] Update status failed:", error.message);
    }
  } catch (e) {
    console.warn("Supabase status update skipped:", e);
  }

  return updatedList;
}

// Backward compatibility exports
export const getStoredPaymentDetails = getStoredFallback;
export const syncPaymentDetailsFromSupabase = fetchPaymentDetailsFromDatabase;
export const savePaymentDetailStore = savePaymentDetailToDatabase;
export const deletePaymentDetailStore = deletePaymentDetailFromDatabase;
export const togglePaymentDetailStatusStore = (id: string) => {
  const current = getStoredFallback();
  const found = current.find(p => p.id === id);
  return togglePaymentDetailStatusInDatabase(id, found ? found.is_active : false);
};
export function subscribePaymentDetailsStore(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("durbar_payment_details_updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("durbar_payment_details_updated", callback);
    window.removeEventListener("storage", callback);
  };
}
