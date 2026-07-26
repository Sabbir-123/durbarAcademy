"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { GraduationCap, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#07182E] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <GraduationCap className="w-10 h-10 text-[#F59E0B] mx-auto" />
          <h2 className="text-2xl font-black text-white">{SITE_CONFIG.name}</h2>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">পাসওয়ার্ড পুনরুদ্ধার করুন</h3>
          <p className="text-xs text-slate-300">
            আপনার অ্যাকাউন্টের নিবন্ধিত ইমেলটি প্রবেশ করুন।
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-xs">
            <CheckCircle className="w-5 h-5" />
            <span>পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেলে পাঠানো হয়েছে।</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">ইমেল ঠিকানা</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white focus:border-[#F59E0B] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs font-bold text-slate-950 bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "প্রসেসিং..." : "পাসওয়ার্ড রিসেট লিঙ্ক পাঠান"}
          </button>
        </form>

        <div className="text-center text-xs">
          <Link href="/login" className="text-[#FACC15] font-bold hover:underline">
            লগইন পেজে ফিরে যান
          </Link>
        </div>

      </div>
    </div>
  );
}
