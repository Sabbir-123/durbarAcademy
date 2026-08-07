import { createClient } from "@/utils/supabase/client";

/**
 * Standardized Student ID Generator
 * Format: DA-STU-XXXXX (e.g. DA-STU-10824)
 */
export function generateStudentId(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `DA-STU-${randomDigits}`;
}

/**
 * Ensures the student has a unique student code in public.profiles.
 * If missing, generates one and updates the database.
 */
export async function ensureStudentCode(userId: string, email?: string): Promise<string> {
  if (!userId) return generateStudentId();

  try {
    const supabase = createClient();
    // 1. Check if profile exists and has student_code
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("student_code, full_name, email")
      .eq("id", userId)
      .maybeSingle();

    if (!error && profile?.student_code) {
      return profile.student_code;
    }

    // 2. Generate new student code
    const newStudentCode = generateStudentId();

    // 3. Upsert into public.profiles
    await supabase.from("profiles").upsert({
      id: userId,
      student_code: newStudentCode,
      email: email || profile?.email || "",
      updated_at: new Date().toISOString(),
    });

    return newStudentCode;
  } catch (err) {
    console.warn("ensureStudentCode exception:", err);
    return generateStudentId();
  }
}
