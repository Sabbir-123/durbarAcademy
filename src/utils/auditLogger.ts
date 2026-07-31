import { createClient } from "./supabase/client";

export interface AuditLogItem {
  id: string;
  timestamp: string; // ISO string
  actor: string;
  role: string;
  action: string;
  details: string;
}

const STORE_KEY = "durbar_audit_logs_store_v1";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Seed realistic audit logs covering actions
const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "log-101",
    timestamp: new Date().toISOString(),
    actor: "Ahmed Sabbir (Super Admin)",
    role: "admin",
    action: "কোর্স আপডেট",
    details: 'BAFA Preliminary Course-এর ভর্তি ফি ৳৮,৫০০ নির্ধারণ করা হয়েছে।',
  },
  {
    id: "log-102",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actor: "Ahmed Sabbir (Super Admin)",
    role: "admin",
    action: "ইউজার রোল প্রমোশন",
    details: 'তানজিলুর রহমান (tanjil@durbar.com)-কে Admin রোল প্রদান করা হয়েছে।',
  },
  {
    id: "log-103",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    actor: "তানজিলুর রহমান (Admin 2)",
    role: "admin",
    action: "সাকসেস স্টোরি যুক্ত",
    details: 'ক্যাডেট ফাহিম রেজওয়ান (BAFA 88th Flight Cadet)-এর সাফল্য অন্তর্ভুক্ত করা হয়েছে।',
  },
  {
    id: "log-104",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    actor: "ড. সাজ্জাদ হোসেন",
    role: "teacher",
    action: "কোর্স কারিকুলাম আপডেট",
    details: 'BMA Long Course-এ আইকিউ ও সাইকোলজিক্যাল টেস্ট ২ টি নতুন ওএমআর সংযোজন করা হয়েছে।',
  },
  {
    id: "log-105",
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    actor: "রকিবুল ইসলাম",
    role: "accountant",
    action: "আয়-ব্যয় রিপোর্ট এন্ট্রি",
    details: 'জুলাই ২০২৬ মাসের শিক্ষক সম্মানী ও ডিজিটাল ওএমআর ওভাল সার্ভার ব্যয় রেজিস্টার করা হয়েছে।',
  },
  {
    id: "log-106",
    timestamp: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
    actor: "System",
    role: "system",
    action: "স্বয়ংক্রিয় ডাটাবেজ ক্লিনআপ",
    details: '৩০ দিনের পুরোনো অডিট লগ ও অস্থায়ী ক্যাশ মেমোরি স্বয়ংক্রিয়ভাবে মোছা হয়েছে।',
  },
  {
    id: "log-107",
    timestamp: new Date(Date.now() - 1000 * 3600 * 36).toISOString(),
    actor: "Ahmed Sabbir (Super Admin)",
    role: "admin",
    action: "নতুন কোর্স তৈরি",
    details: 'ISSB Rapid Course (স্বল্পমেয়াদী ২ সপ্তাহের স্পেশাল বুটক্যাম্প) তৈরি করা হয়েছে।',
  },
  {
    id: "log-108",
    timestamp: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
    actor: "ড. সাজ্জাদ হোসেন",
    role: "teacher",
    action: "সাকসেস স্টোরি সম্পাদনা",
    details: 'ক্যাডেট তানভীর আহমেদ (BMA Long Course) রিভিউ আপডেট করা হয়েছে।',
  },
  {
    id: "log-109",
    timestamp: new Date(Date.now() - 1000 * 3600 * 60).toISOString(),
    actor: "System",
    role: "system",
    action: "সিকিউরিটি অডিট স্ক্যান",
    details: 'সিস্টেম রোল পারমিশন ও আরবিএসি গ্রান্ট সফলভাবে যাচাই করা হয়েছে।',
  },
  {
    id: "log-110",
    timestamp: new Date(Date.now() - 1000 * 3600 * 72).toISOString(),
    actor: "Ahmed Sabbir (Super Admin)",
    role: "admin",
    action: "নতুন ইউজার তৈরি",
    details: 'ফারহান আহমেদ (farhan@durbar.com)-কে Teacher রোল দিয়ে নিবন্ধিত করা হয়েছে।',
  },
  {
    id: "log-111",
    timestamp: new Date(Date.now() - 1000 * 3600 * 96).toISOString(),
    actor: "রকিবুল ইসলাম",
    role: "accountant",
    action: "ভর্তি ফি রেজিস্ট্রি",
    details: '১৫ জন শিক্ষার্থীর ভর্তি পেমেন্ট গেটওয়ে স্টেটমেন্ট ভেরিফাই করা হয়েছে।',
  },
  {
    id: "log-112",
    timestamp: new Date(Date.now() - 1000 * 3600 * 120).toISOString(),
    actor: "Ahmed Sabbir (Super Admin)",
    role: "admin",
    action: "পাবলিশ স্ট্যাটাস পরিবর্তন",
    details: 'BN Preliminary Course অনলাইন দৃশ্যমান (Published) করা হয়েছে।',
  },
  {
    id: "log-113",
    timestamp: new Date(Date.now() - 1000 * 3600 * 144).toISOString(),
    actor: "তানজিলুর রহমান (Admin 2)",
    role: "admin",
    action: "কোর্স বিবরণ সংশোধন",
    details: 'BAFA Preliminary Course-এর শারীরিক যোগ্যতা ও মেডিকেলের নতুন নিয়ম আপডেট করা হয়েছে।',
  },
  {
    id: "log-114",
    timestamp: new Date(Date.now() - 1000 * 3600 * 168).toISOString(),
    actor: "System",
    role: "system",
    action: "সার্ভার হেলথ চেক",
    details: 'দুর্বার একাডেমি অ্যাপ সার্ভার ও ব্যাকএন্ড এপিআই সেশন গ্রিন রেজিস্টার করা হয়েছে।',
  },
  {
    id: "log-115",
    timestamp: new Date(Date.now() - 1000 * 3600 * 192).toISOString(),
    actor: "Ahmed Sabbir (Super Admin)",
    role: "admin",
    action: "ইউজার রোল পরিবর্তন",
    details: 'সাকিব আহমেদ-কে Student রোল থেকে প্রমোট করা হয়েছে।',
  },
  {
    id: "log-116",
    timestamp: new Date(Date.now() - 1000 * 3600 * 216).toISOString(),
    actor: "ড. সাজ্জাদ হোসেন",
    role: "teacher",
    action: "লাইভ ক্লাস শিডিউল",
    details: 'আইএসএসবি ডাউট সলভিং বুটক্যাম্প শিডিউল পাবলিশ করা হয়েছে।',
  },
  {
    id: "log-117",
    timestamp: new Date(Date.now() - 1000 * 3600 * 240).toISOString(),
    actor: "Ahmed Sabbir (Super Admin)",
    role: "admin",
    action: "সাকসেস স্টোরি পাবলিশ",
    details: 'ক্যাডেট নাফিস আনজুম (BN 2026 Officer Candidate) স্টোরি পাবলিশড করা হয়েছে।',
  },
  {
    id: "log-118",
    timestamp: new Date(Date.now() - 1000 * 3600 * 264).toISOString(),
    actor: "System",
    role: "system",
    action: "অটোমেটেড ব্যাকআপ",
    details: 'সিস্টেম স্কিমা ডাটাবেজ ব্যাকআপ সম্পন্ন হয়েছে।',
  },
];

/**
 * Get stored audit logs while automatically purging logs older than 30 days.
 */
export function getStoredAuditLogs(): AuditLogItem[] {
  if (typeof window === "undefined") return INITIAL_AUDIT_LOGS;

  try {
    const raw = localStorage.getItem(STORE_KEY);
    let logs: AuditLogItem[] = raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;

    if (!Array.isArray(logs) || logs.length === 0) {
      logs = INITIAL_AUDIT_LOGS;
    }

    const now = Date.now();
    // AUTOMATIC 30-DAY PURGE FILTER
    const validLogs = logs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      return !isNaN(logTime) && now - logTime <= THIRTY_DAYS_MS;
    });

    if (validLogs.length !== logs.length) {
      localStorage.setItem(STORE_KEY, JSON.stringify(validLogs));
    }

    return validLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (err) {
    console.error("Failed to load stored audit logs:", err);
    return INITIAL_AUDIT_LOGS;
  }
}

/**
 * Track a new action in the audit trail.
 */
export async function logAuditAction(
  action: string,
  details: string,
  actor: string = "Ahmed Sabbir (Super Admin)",
  role: string = "admin"
): Promise<AuditLogItem> {
  const currentLogs = getStoredAuditLogs();

  const newLog: AuditLogItem = {
    id: "log-" + Date.now(),
    timestamp: new Date().toISOString(),
    actor,
    role,
    action,
    details,
  };

  const updatedLogs = [newLog, ...currentLogs];

  if (typeof window !== "undefined") {
    localStorage.setItem(STORE_KEY, JSON.stringify(updatedLogs));
  }

  // Background Supabase Log insertion
  try {
    const supabase = createClient();
    await supabase.from("audit_logs").insert([
      {
        id: newLog.id,
        timestamp: newLog.timestamp,
        actor_user_id: newLog.actor,
        actor_role: newLog.role,
        action: newLog.action,
        after_state: { details: newLog.details },
      },
    ]);
  } catch (err) {
    console.log("Supabase audit log insert skipped:", err);
  }

  return newLog;
}
