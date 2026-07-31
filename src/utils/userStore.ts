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

export const SUPER_ADMIN_EMAIL = "ahmedsabbir2013@gmail.com";

const DEFAULT_USERS: AppUser[] = [
  {
    id: "u7",
    full_name: "Ahmed Sabbir",
    email: SUPER_ADMIN_EMAIL,
    role: "Super Admin",
    password: "password123",
  },
  {
    id: "u1",
    full_name: "সাকিব আহমেদ",
    email: "sakib@durbar.com",
    role: "student",
    password: "password123",
  },
  {
    id: "u2",
    full_name: "তামান্না খাতুন",
    email: "sabbir.exprovia@gmail.com",
    role: "student",
    password: "password123",
  },
  {
    id: "u3",
    full_name: "ড. সাজ্জাদ হোসেন",
    email: "sajjad@durbar.com",
    role: "teacher",
    password: "password123",
  },
  {
    id: "u4",
    full_name: "ফারহান আহমেদ",
    email: "farhan@durbar.com",
    role: "teacher",
    password: "password123",
  },
  {
    id: "u5",
    full_name: "রকিবুল ইসলাম",
    email: "rokibul@durbar.com",
    role: "accountant",
    password: "password123",
  },
  {
    id: "u6",
    full_name: "তানজিলুর রহমান",
    email: "tanjil@durbar.com",
    role: "Admin 2",
    password: "password123",
  },
];

export function isSuperAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

export function getStoredUsers(): AppUser[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: AppUser[] = DEFAULT_USERS;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }

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
