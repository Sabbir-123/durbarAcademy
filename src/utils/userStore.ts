import { createClient } from "@/utils/supabase/client";

export interface AppUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  password?: string;
  temp_password?: string;
  permissions?: any;
}

const STORAGE_KEY = "durbar_academy_users_v1";
const DELETED_KEY = "durbar_academy_deleted_ids_v1";

export const SUPER_ADMIN_EMAIL = "ahmedsabbir2013@gmail.com";

const DEFAULT_USERS: AppUser[] = [
  {
    id: "u7",
    full_name: "Ahmed Sabbir",
    email: SUPER_ADMIN_EMAIL,
    role: "Super Admin",
    password: "password123",
  },
];

export function isSuperAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

export function getCurrentUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("durbar_current_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AppUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem("durbar_current_user");
  } else {
    localStorage.setItem("durbar_current_user", JSON.stringify(user));
  }
}

// ── Deleted-user blocklist helpers ──────────────────────────────────────────
function getDeletedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addDeletedId(userId: string): void {
  if (typeof window === "undefined") return;
  const ids = getDeletedIds();
  ids.add(userId);
  localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]));
}

export function isUserDeleted(userId: string): boolean {
  return getDeletedIds().has(userId);
}
// ────────────────────────────────────────────────────────────────────────────

export async function fetchUsersFromDatabase(): Promise<AppUser[]> {
  if (typeof window === "undefined") return getStoredUsers();
  try {
    const supabase = createClient();
    const { data: profilesData, error } = await supabase.from("profiles").select(`
      id,
      email,
      full_name,
      user_roles (
        role
      )
    `);

    if (error || !profilesData || profilesData.length === 0) {
      return getStoredUsers();
    }

    const dbUsers: AppUser[] = profilesData.map((p: any) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name || p.email?.split("@")[0] || "User",
      role: p.user_roles?.role || (isSuperAdminEmail(p.email) ? "Super Admin" : "student"),
    }));

    for (const u of dbUsers) {
      saveUserStore(u);
    }
    return getStoredUsers();
  } catch (err) {
    return getStoredUsers();
  }
}

export function getStoredUsers(): AppUser[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const deletedIds = getDeletedIds();
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: AppUser[] = DEFAULT_USERS;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }

    // Filter out any users that were permanently deleted
    list = list.filter((u) => !deletedIds.has(u.id));

    // Ensure ahmedsabbir2013@gmail.com is ALWAYS present and designated as Super Admin
    const sabbirIdx = list.findIndex((u) => isSuperAdminEmail(u.email));
    if (sabbirIdx >= 0) {
      list[sabbirIdx].role = "Super Admin";
    } else {
      list.unshift({
        id: "u7",
        full_name: "Ahmed Sabbir",
        email: SUPER_ADMIN_EMAIL,
        role: "Super Admin",
        password: "password123",
      });
    }

    return list;
  } catch (err) {
    console.error("Error reading stored users:", err);
    return DEFAULT_USERS;
  }
}

export function saveUserStore(user: AppUser): AppUser[] {
  // ── BLOCKLIST CHECK: never re-add a deleted user ─────────────────
  if (isUserDeleted(user.id)) return getStoredUsers();
  // Also block by email in case id differs
  const deletedIds = getDeletedIds();
  const existing = getStoredUsers();
  const byEmail = existing.find(
    (u) => u.email.toLowerCase() === user.email.toLowerCase()
  );
  if (byEmail && deletedIds.has(byEmail.id)) return existing;
  // ─────────────────────────────────────────────────────────────────

  const current = getStoredUsers();

  // Prevent changing Super Admin role or email
  if (isSuperAdminEmail(user.email)) {
    user.role = "Super Admin";
  }

  const existingIdx = current.findIndex(
    (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
  );

  let updated: AppUser[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...user };
  } else {
    updated = [user, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("durbar_users_updated"));
  }
  return updated;
}

export function updateUserRoleStore(userId: string, newRole: string): AppUser[] {
  const current = getStoredUsers();
  const target = current.find((u) => u.id === userId);

  if (target && (isSuperAdminEmail(target.email) || target.role.toLowerCase() === "super admin")) {
    console.warn("Cannot change Super Admin role.");
    return current;
  }

  const updated = current.map((u) =>
    u.id === userId ? { ...u, role: newRole } : u
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("durbar_users_updated"));
  }
  return updated;
}

export function updateUserStore(userId: string, updatedData: Partial<AppUser>): AppUser[] {
  const current = getStoredUsers();
  const target = current.find((u) => u.id === userId);

  if (target && (isSuperAdminEmail(target.email) || target.role.toLowerCase() === "super admin")) {
    // Preserve Super Admin role & email
    updatedData.role = "Super Admin";
    updatedData.email = SUPER_ADMIN_EMAIL;
  }

  // PRIVACY & SECURITY GUARD: Admin CANNOT change any user's password via edit profile
  delete updatedData.password;
  delete updatedData.temp_password;

  const updated = current.map((u) =>
    u.id === userId ? { ...u, ...updatedData } : u
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("durbar_users_updated"));
  }
  return updated;
}

export function deleteUserStore(userId: string): AppUser[] {
  const current = getStoredUsers();
  const target = current.find((u) => u.id === userId);

  if (target && (isSuperAdminEmail(target.email) || target.role.toLowerCase() === "super admin")) {
    console.warn("Super Admin account cannot be deleted.");
    return current;
  }

  // Persist to blocklist so Supabase re-sync can't bring this user back
  addDeletedId(userId);

  const updated = current.filter((u) => u.id !== userId);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("durbar_users_updated"));
  }
  return updated;
}

export function subscribeUserStore(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("durbar_users_updated", handler);
  return () => window.removeEventListener("durbar_users_updated", handler);
}
