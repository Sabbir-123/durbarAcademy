"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, User } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

import { saveUserStore } from "@/utils/userStore";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      console.log("Supabase Auth Signup Notice (Fallback local save active):", signUpError.message);
    }

    // Always register student with their own password
    saveUserStore({
      id: data?.user?.id || "u-std-" + Date.now(),
      full_name: fullName,
      email: trimmedEmail,
      role: "student",
      password: password,
    });

    router.push("/complete-profile");
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
          <h3 className="text-lg font-bold text-white">নতুন অ্যাকাউন্ট তৈরি করুন</h3>
          <p className="text-xs text-slate-300">
            নিবন্ধন সম্পন্ন করে আপনার ভর্তি প্রস্তুতি যাত্রা শুরু করুন।
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">পূর্ণ নাম</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="যেমন: সাকিব আহমেদ"
                className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-[#F59E0B] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">ইমেল ঠিকানা</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-[#F59E0B] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৮ ডিজিট"
                className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-[#F59E0B] outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#F59E0B] to-[#FACC15] hover:from-[#FACC15] hover:to-[#F59E0B] rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>প্রসেসিং হচ্ছে...</span> : (
              <>
                <span>নিবন্ধন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center pt-2 text-xs text-slate-400">
          ইতিমধ্যে অ্যাকাউন্ট রয়েছে?{" "}
          <Link href="/login" className="text-[#FACC15] font-bold hover:underline">
            লগইন করুন
          </Link>
        </div>

      </div>
    </div>
  );
}
