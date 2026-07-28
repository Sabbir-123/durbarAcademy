"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { GraduationCap, ArrowRight, AlertCircle } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

export default function CompleteProfilePage() {
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkUserSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      // Auto-provision admin user if logged in with the admin email
      if (user.email === "ahmedsabbir2013@gmail.com") {
        try {
          // Ensure profile exists
          await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              email: user.email,
              full_name: "Ahmed Sabbir",
              updated_at: new Date().toISOString()
            });

          // Ensure admin role exists
          await supabase
            .from("user_roles")
            .upsert({
              user_id: user.id,
              role: "admin"
            }, { onConflict: "user_id" });

          router.push("/admin/dashboard");
          return;
        } catch (err) {
          console.error("Failed to auto-provision admin:", err);
        }
      }
      
      // Get role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      const role = roleData?.role;
      
      // If role is admin, teacher, or accountant, bypass complete-profile page immediately
      if (role === "admin" || role === "teacher" || role === "accountant") {
        router.push(`/${role}/dashboard`);
        return;
      }

      // Check if profile is already complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, college, city")
        .eq("id", user.id)
        .single();

      if (profile?.phone && profile?.college && profile?.city) {
        // Already complete, redirect to student dashboard
        router.push("/student/dashboard");
      }
    }
    checkUserSession();
  }, []);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("সেশন পাওয়া যায়নি। অনুগ্রহ করে পুনরায় লগইন করুন।");
      setLoading(false);
      return;
    }

    // Upsert profile record to make sure it exists (resolves foreign key check on user_roles)
    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "শিক্ষার্থী",
        phone,
        college,
        city,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Safely check if role already exists to avoid primary key duplicates
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    let role = roleData?.role;

    if (!role) {
      const defaultRole = user.email === "ahmedsabbir2013@gmail.com" ? "admin" : "student";
      // Default to student/admin if no role is defined in DB
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: defaultRole
        });
      
      if (!roleError) {
        role = defaultRole;
      }
    }

    router.push(`/${role || "student"}/dashboard`);
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
          <h3 className="text-lg font-bold text-white">আপনার প্রোফাইল সম্পন্ন করুন</h3>
          <p className="text-xs text-slate-300">
            ভর্তি গাইডলাইন ও ব্যাচ কভারেজের জন্য প্রয়োজনীয় তথ্য প্রদান করুন।
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleComplete} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">মোবাইল নম্বর:*</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="যেমন: ০১xxxxxxxxx"
              className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white focus:border-[#F59E0B] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">এইচএসসি কলেজ:*</label>
            <input
              type="text"
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
              className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white focus:border-[#F59E0B] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">শহর/জেলা:*</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="যেমন: ঢাকা / চট্টগ্রাম / রাজশাহী"
              className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white focus:border-[#F59E0B] outline-none"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-bold text-slate-950 bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md cursor-pointer"
            >
              <span>সম্পন্ন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="w-full py-3 text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all text-center cursor-pointer"
            >
              লগআউট (Logout)
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
