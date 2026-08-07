"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import { UserCheck, Upload, CheckCircle2, ShieldAlert } from "lucide-react";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const { data: studentProf } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("student_id", user.id)
        .maybeSingle();

      let localSaved: any = {};
      try {
        const raw = localStorage.getItem(`durbar_student_profile_${user.id}`);
        if (raw) localSaved = JSON.parse(raw);
      } catch {}

      const mergedProfile = {
        ...prof,
        full_name: prof?.full_name || localSaved.full_name || "",
        phone: prof?.phone || localSaved.phone || "",
        school_name: prof?.school_name || studentProf?.school || prof?.college || localSaved.school_name || "",
        address: prof?.address || prof?.city || localSaved.address || "",
        parent_name: prof?.parent_name || studentProf?.guardian_name || localSaved.parent_name || "",
        parent_phone: prof?.parent_phone || studentProf?.parent_phone || localSaved.parent_phone || "",
        avatar_url: prof?.avatar_url || localSaved.avatar_url || "",
      };

      setProfile(mergedProfile);
      setFullName(mergedProfile.full_name);
      setPhone(mergedProfile.phone);
      setSchoolName(mergedProfile.school_name);
      setAddress(mergedProfile.address);
      setParentName(mergedProfile.parent_name);
      setParentPhone(mergedProfile.parent_phone);
      setAvatarUrl(mergedProfile.avatar_url);
    }
    loadData();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(false);
    setProfileError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ব্যবহারকারী সনাক্ত করা যায়নি।");

      const fullUpdateData = {
        id: user.id,
        email: user.email,
        full_name: fullName,
        phone: phone,
        college: schoolName,
        school_name: schoolName,
        address: address,
        parent_name: parentName,
        parent_phone: parentPhone,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      // 1. Try full upsert to profiles table
      const { error: profErr } = await supabase
        .from("profiles")
        .upsert(fullUpdateData);

      // 2. Fallback to standard columns if custom columns not in schema cache yet
      if (profErr) {
        const standardUpdateData = {
          id: user.id,
          email: user.email,
          full_name: fullName,
          phone: phone,
          college: schoolName,
          city: address,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        };
        await supabase.from("profiles").upsert(standardUpdateData);
      }

      // 3. Upsert to student_profiles table
      try {
        await supabase.from("student_profiles").upsert({
          student_id: user.id,
          school: schoolName,
          guardian_name: parentName,
          parent_phone: parentPhone,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      // 4. Save to local storage for persistent recovery
      try {
        localStorage.setItem(`durbar_student_profile_${user.id}`, JSON.stringify(fullUpdateData));
      } catch {}

      setProfile((prev: any) => ({
        ...prev,
        ...fullUpdateData,
      }));

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 5000);
    } catch (err: any) {
      setProfileError(err.message || "প্রোফাইল তথ্য সংরক্ষণে সমস্যা হয়েছে।");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("ছবি ফাইলের সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে।");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar role="student" activeTab="profile" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              student profile settings
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <UserCheck className="w-7 h-7 text-[#F59E0B]" />
              <span>আমার শিক্ষার্থী প্রোফাইল</span>
            </h1>
            <p className="text-xs text-slate-300">
              আপনার ছবি, শিক্ষাপ্রতিষ্ঠান, বাসস্থান এবং অভিভাবকের যোগাযোগের তথ্য হালনাগাদ রাখুন।
            </p>
          </div>
          <DashboardHeader role="student" />
        </div>

        {/* Profile Settings Card */}
        <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl max-w-4xl">
          {profileSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>আপনার প্রোফাইল তথ্য সফলভাবে ডাটাবেজে সংরক্ষণ করা হয়েছে!</span>
            </div>
          )}

          {profileError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs font-bold animate-fade-in">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-6 text-xs">
            {/* Avatar / Profile Picture Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-[#07182E] border border-white/5">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#163255] border-2 border-[#F59E0B] flex items-center justify-center shrink-0 shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-amber-400">
                    {fullName?.charAt(0) || profile?.full_name?.charAt(0) || "S"}
                  </span>
                )}
              </div>
              <div className="space-y-3 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-slate-300 block">প্রোফাইল ছবি আপলোড / লিঙ্ক:</label>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 hover:bg-[#F59E0B]/30 transition-all font-bold text-xs shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>নতুন ছবি আপলোড করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  placeholder="অথবা ইমপ্রেশন/ছবি URL সরাসরি প্রদান করুন..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-[#0D2038] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#F59E0B]"
                />
                <span className="text-[10px] text-slate-400 block">
                  ডিভাইস থেকে সরাসরি ছবি বাছাই করতে "নতুন ছবি আপলোড করুন" বাটনে ক্লিক করুন।
                </span>
              </div>
            </div>

            {/* Grid 1: Name, Email & Student Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর পূর্ণ নাম:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সাব্বির হোসেন"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ইমেইল এড্রেস:*</label>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={email}
                  placeholder="student@example.com"
                  className="w-full bg-[#07182E]/60 border border-white/10 rounded-xl p-3.5 text-amber-400 font-mono outline-none cursor-not-allowed opacity-90"
                />
                <span className="text-[10px] text-slate-400 block mt-1">অফিশিয়াল অ্যাকাউন্ট ইমেইল এড্রেস</span>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর মোবাইল নম্বর:*</label>
                <input
                  type="tel"
                  required
                  placeholder="০১৭xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {/* Grid 2: Institution & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="font-bold text-slate-300 block mb-1">স্কুল / কলেজ / প্রতিষ্ঠানের নাম:</label>
                <input
                  type="text"
                  placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">বাসস্থান / বর্তমান ঠিকানা:</label>
                <input
                  type="text"
                  placeholder="যেমন: মিরপুর ১০, ঢাকা"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {/* Grid 3: Parent's Name & Parent's Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="font-bold text-slate-300 block mb-1">অভিভাবকের পূর্ণ নাম:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">অভিভাবকের মোবাইল নম্বর:*</label>
                <input
                  type="tel"
                  required
                  placeholder="০১৮xxxxxxxx"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {/* Parent Phone Manual Verification Alert Box */}
            <div className="p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3 shadow-inner">
              <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="font-extrabold block text-[#FACC15]">অভিভাবক মোবাইল নম্বর ম্যানুয়াল সচ্ছতা যাচাই নীতিমালা:</strong>
                <p className="text-[11px] leading-relaxed text-amber-200/90">
                  অভিভাবকের প্রদানকৃত মোবাইল নম্বরটি যেকোনো সময় আমাদের একাডেমির সিকিউরিটি টিম ও প্রশাসনিক কর্তৃপক্ষ কর্তৃক ফোন কলের মাধ্যমে ম্যানুয়ালি যাচাই (Manual Verification) করা হবে।
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-8 py-3.5 bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] text-black font-bold text-xs rounded-xl shadow-lg gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSavingProfile ? "সংরক্ষণ করা হচ্ছে..." : "প্রোফাইল তথ্য সেভ করুন"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
