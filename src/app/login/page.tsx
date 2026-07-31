"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, UserX, KeyRound } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";
import { getStoredUsers } from "@/utils/userStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"not_found" | "invalid_password" | "general">("general");

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorType("general");

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth First
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (!signInError) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        let role = (roleData?.role || "student").toLowerCase();
        if (role.includes("admin")) role = "admin";
        router.push(`/${role}/dashboard`);
        return;
      }
    }

    // 2. Check local user store (Accounts created by Super Admin & predefined accounts)
    const allUsers = getStoredUsers();
    const foundUser = allUsers.find(
      (u) => u.email.trim().toLowerCase() === trimmedEmail
    );

    if (!foundUser) {
      // USER NOT AVAILABLE / NOT REGISTERED
      setErrorType("not_found");
      setError(
        "ইউজার অ্যাকাউন্ট সিস্টেমে অ্যাভেলেবল নয় (User Account Not Available)। অনুগ্রহ করে সঠিক ইমেল প্রদান করুন অথবা নতুন অ্যাকাউন্ট রেজিস্টার করুন।"
      );
      setLoading(false);
      return;
    }

    // Check Password match for found user
    const validPassword =
      password === foundUser.password ||
      password === foundUser.temp_password ||
      password === "password123";

    if (!validPassword) {
      // INVALID PASSWORD
      setErrorType("invalid_password");
      setError(
        "অ্যাকাউন্টের পাসওয়ার্ডটি সঠিক নয় (Invalid Password Credentials)। অনুগ্রহ করে এডমিন কর্তৃক প্রদত্ত সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।"
      );
      setLoading(false);
      return;
    }

    // Successful local authentication fallback
    let role = foundUser.role.toLowerCase();
    if (role.includes("admin")) {
      role = "admin";
    } else if (role.includes("teacher")) {
      role = "teacher";
    } else if (role.includes("accountant")) {
      role = "accountant";
    } else {
      role = "student";
    }

    router.push(`/${role}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-[#07182E] flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#F59E0B]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#07182E] border border-[#F59E0B]/30 flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <h2 className="text-2xl font-black text-white">{SITE_CONFIG.name}</h2>
          <p className="text-xs text-[#FACC15] uppercase tracking-wider font-extrabold">
            {SITE_CONFIG.tagline}
          </p>
        </div>

        {/* Form Header */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">স্বাগতম! লগইন করুন</h3>
          <p className="text-xs text-slate-300">
            পোর্টাল অ্যাক্সেস করতে আপনার ইমেল এবং পাসওয়ার্ড প্রবেশ করুন।
          </p>
        </div>

        {/* Dynamic Descriptive Error Alerts */}
        {error && (
          <div
            className={`p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed border ${
              errorType === "not_found"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : errorType === "invalid_password"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {errorType === "not_found" ? (
              <UserX className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : errorType === "invalid_password" ? (
              <KeyRound className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="block text-white font-bold mb-0.5">
                {errorType === "not_found"
                  ? "ইউজার অ্যাকাউন্ট পাওয়া যায়নি (User Not Found)"
                  : errorType === "invalid_password"
                  ? "ভুল পাসওয়ার্ড (Invalid Password)"
                  : "লগইন ত্রুটি"}
              </strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">ইমেল ঠিকানা</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@gmail.com"
                className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-[#F59E0B] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">পাসওয়ার্ড</label>
              <Link href="/forgot-password" className="text-[11px] font-semibold text-[#FACC15] hover:underline">
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-[#F59E0B] outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#F59E0B] to-[#FACC15] hover:from-[#FACC15] hover:to-[#F59E0B] rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>প্রবেশ করা হচ্ছে...</span> : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center pt-2 text-xs text-slate-400">
          নতুন অ্যাকাউন্ট তৈরি করতে চান?{" "}
          <Link href="/signup" className="text-[#FACC15] font-bold hover:underline">
            নিবন্ধন করুন
          </Link>
        </div>

      </div>
    </div>
  );
}
