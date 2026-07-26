"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Auth state change will be picked up by middleware or redirect directly
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      const role = roleData?.role || "student";
      router.push(`/${role}/dashboard`);
    } else {
      setLoading(false);
    }
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

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
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
                placeholder="email@domain.com"
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
