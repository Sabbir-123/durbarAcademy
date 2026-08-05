"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { GraduationCap, ArrowRight, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";
import { setCurrentUser, saveUserStore } from "@/utils/userStore";

export default function CompleteProfilePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [college, setCollege] = useState("");
  const [city, setCity] = useState("");
  const [parentPhone, setParentPhone] = useState("");
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
          await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              email: user.email,
              full_name: "Ahmed Sabbir",
              updated_at: new Date().toISOString()
            });

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
        .select("full_name, phone, college, city")
        .eq("id", user.id)
        .single();

      const { data: studentProf } = await supabase
        .from("student_profiles")
        .select("parent_phone")
        .eq("student_id", user.id)
        .single();

      if (profile?.full_name) setFullName(profile.full_name);
      if (profile?.phone) setPhone(profile.phone);
      if (profile?.college) setCollege(profile.college);
      if (profile?.city) setCity(profile.city);
      if (studentProf?.parent_phone) setParentPhone(studentProf.parent_phone);

      if (profile?.phone && profile?.college && studentProf?.parent_phone) {
        // Check if coming directly from completed enrollment or already done
        const pendingRedirect = sessionStorage.getItem("pending_enroll_course");
        if (pendingRedirect) {
          sessionStorage.removeItem("pending_enroll_course");
          router.push(`/courses`);
          return;
        }
        router.push("/student/dashboard");
      }
    }
    checkUserSession();
  }, []);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!parentPhone || parentPhone.length < 11) {
      setError("অনুগ্রহ করে অভিভাবকের ১১ ডিজিটের বৈধ মোবাইল নম্বর প্রদান করুন।");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("সেশন পাওয়া যায়নি। অনুগ্রহ করে পুনরায় লগইন করুন।");
      setLoading(false);
      return;
    }

    const userName = fullName.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "শিক্ষার্থী";

    // 1. Upsert profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email!,
        full_name: userName,
        phone,
        college,
        city: city || "ঢাকা",
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      console.warn("Supabase profiles update fallback:", updateError);
    }

    // 2. Upsert student_profiles table with parent phone
    try {
      await supabase
        .from("student_profiles")
        .upsert({
          student_id: user.id,
          parent_phone: parentPhone,
          school: college,
          updated_at: new Date().toISOString(),
        });
    } catch (e) {
      console.warn("Supabase student_profiles fallback:", e);
    }

    // 3. Update local user store
    setCurrentUser({
      id: user.id,
      full_name: userName,
      email: user.email!,
      role: "student",
      phone: phone,
      parent_phone: parentPhone,
      whatsapp: whatsapp || phone,
      college: college,
    });

    saveUserStore({
      id: user.id,
      full_name: userName,
      email: user.email!,
      role: "student",
    });

    setLoading(false);

    // Redirect to student dashboard
    router.push("/student/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#07182E] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <GraduationCap className="w-10 h-10 text-[#F59E0B] mx-auto" />
          <h2 className="text-2xl font-black text-white">{SITE_CONFIG.name}</h2>
        </div>

        <div className="space-y-1 text-center">
          <h3 className="text-xl font-bold text-white">শিক্ষার্থীর প্রোফাইল তথ্য প্রদান করুন</h3>
          <p className="text-xs text-slate-300">
            ভর্তি চূড়ান্তকরণ, ক্লাস অ্যাক্সেস ও সিকিউরিটির জন্য নিচের প্রতিটি তথ্য সঠিকভাবে পূরণ করুন।
          </p>
        </div>

        {/* Parent Phone Manual Verification Alert Box */}
        <div className="bg-[#07182E] border border-[#F59E0B]/40 p-4 rounded-2xl space-y-1.5 text-xs text-left">
          <div className="flex items-center gap-2 text-[#F59E0B] font-extrabold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>সিকিউরিটি ও ভেরিফিকেশন নোটিশ:</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            ⚠️ <strong className="text-amber-400">অভিভাবকের মোবাইল নম্বরটি পরবর্তীতে আমাদের একাডেমি টিম কর্তৃক ম্যানুয়ালি যাচাই করা হবে।</strong> ভুল তথ্য প্রদান করলে ভর্তি বাতিল হতে পারে।
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleComplete} className="space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">শিক্ষার্থীর নাম (Full Name):*</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="যেমন: তানভীর আহমেদ"
              className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-[#F59E0B] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">মোবাইল নম্বর:*</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="যেমন: ০১৭xxxxxxxx"
                className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-[#F59E0B] outline-none"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">হোয়াটসঅ্যাপ নম্বর (WhatsApp):</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="যেমন: ০১৭xxxxxxxx"
                className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-[#F59E0B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* College / Institution */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">স্কুল / কলেজ / প্রতিষ্ঠান:*</label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
                className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-[#F59E0B] outline-none"
              />
            </div>

            {/* District / City */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">জেলা / শহর:*</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="যেমন: ঢাকা / চট্টগ্রাম"
                className="w-full bg-[#07182E] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-[#F59E0B] outline-none"
              />
            </div>
          </div>

          {/* Parent's Mobile Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#FACC15]">অভিভাবকের মোবাইল নম্বর (Parent's Number):*</label>
              <span className="text-[10px] text-amber-400 font-semibold">(ম্যানুয়ালি যাচাই করা হবে)</span>
            </div>
            <input
              type="tel"
              required
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="যেমন: ০১৮xxxxxxxx (অভিভাবকের নম্বর)"
              className="w-full bg-[#07182E] border border-[#F59E0B]/40 rounded-xl py-3 px-4 text-xs text-white focus:border-[#F59E0B] outline-none font-mono"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-black text-black bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:scale-[1.01] cursor-pointer"
            >
              <span>প্রোফাইল তথ্য জমা দিন ও ড্যাশবোর্ডে প্রবেশ করুন</span>
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
