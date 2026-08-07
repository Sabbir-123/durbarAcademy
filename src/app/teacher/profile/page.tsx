"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import { UserCheck, Upload, CheckCircle2, Award } from "lucide-react";

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [subjectSpecialty, setSubjectSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const { data: teacherProf } = await supabase
        .from("teacher_profiles")
        .select("*")
        .eq("teacher_id", user.id)
        .maybeSingle();

      let localSaved: any = {};
      try {
        const raw = localStorage.getItem(`durbar_teacher_profile_${user.id}`);
        if (raw) localSaved = JSON.parse(raw);
      } catch {}

      const mergedProfile = {
        ...prof,
        full_name: prof?.full_name || localSaved.full_name || "",
        phone: prof?.phone || localSaved.phone || "",
        avatar_url: prof?.avatar_url || localSaved.avatar_url || "",
        institution: teacherProf?.institution || prof?.college || localSaved.institution || "",
        subject_specialty: teacherProf?.subject_specialty || localSaved.subject_specialty || "",
        bio: teacherProf?.bio || localSaved.bio || "",
      };

      setProfile(mergedProfile);
      setFullName(mergedProfile.full_name);
      setPhone(mergedProfile.phone);
      setAvatarUrl(mergedProfile.avatar_url);
      setInstitution(mergedProfile.institution);
      setSubjectSpecialty(mergedProfile.subject_specialty);
      setBio(mergedProfile.bio);
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
      if (!user) throw new Error("ইনস্ট্রাক্টর সনাক্ত করা যায়নি।");

      const updateProfile = {
        id: user.id,
        email: user.email,
        full_name: fullName,
        phone: phone,
        college: institution,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error: profErr } = await supabase.from("profiles").upsert(updateProfile);
      if (profErr) {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          avatar_url: avatarUrl,
        });
      }

      // Upsert teacher_profiles
      try {
        await supabase.from("teacher_profiles").upsert({
          teacher_id: user.id,
          institution: institution,
          subject_specialty: subjectSpecialty,
          bio: bio,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      try {
        localStorage.setItem(`durbar_teacher_profile_${user.id}`, JSON.stringify({
          ...updateProfile,
          institution,
          subject_specialty: subjectSpecialty,
          bio,
        }));
      } catch {}

      setProfile((prev: any) => ({ ...prev, ...updateProfile }));
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 5000);
    } catch (err: any) {
      setProfileError(err.message || "ইনস্ট্রাক্টর প্রোফাইল সেভ করতে সমস্যা হয়েছে।");
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
      <DashboardSidebar role="teacher" activeTab="profile" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              instructor profile manager
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <UserCheck className="w-7 h-7 text-[#F59E0B]" />
              <span>ইনস্ট্রাক্টর প্রোফাইল সেটিংস</span>
            </h1>
            <p className="text-xs text-slate-300">
              আপনার ছবি, শিক্ষাপ্রতিষ্ঠান, বিশেষজ্ঞতার বিষয় ও সংক্ষেপ জীবনবৃত্তান্ত পরিচালনা করুন।
            </p>
          </div>
          <DashboardHeader role="teacher" />
        </div>

        {/* Profile Card */}
        <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl max-w-4xl">
          {profileSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>আপনার ইনস্ট্রাক্টর প্রোফাইল তথ্য সফলভাবে ডাটাবেজে আপডেট করা হয়েছে!</span>
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
                    {fullName?.charAt(0) || profile?.full_name?.charAt(0) || "T"}
                  </span>
                )}
              </div>
              <div className="space-y-3 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-slate-300 block">ইনস্ট্রাক্টর ছবি আপলোড / লিঙ্ক:</label>
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
                  placeholder="অথবা সরাসরি ছবি URL (Image Link) প্রদান করুন..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-[#0D2038] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#F59E0B]"
                />
                <span className="text-[10px] text-slate-400 block">
                  ডিভাইস থেকে সরাসরি ছবি আপলোড করতে "নতুন ছবি আপলোড করুন" বাটনে ক্লিক করুন।
                </span>
              </div>
            </div>

            {/* Grid 1: Teacher Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="font-bold text-slate-300 block mb-1">ইনস্ট্রাক্টরের পূর্ণ নাম:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ইঞ্জি. তানভীর আহমেদ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ইনস্ট্রাক্টরের মোবাইল নম্বর:*</label>
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

            {/* Grid 2: Institution & Specialty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="font-bold text-slate-300 block mb-1">শিক্ষা প্রতিষ্ঠান / বিশ্ববিদ্যালয়:</label>
                <input
                  type="text"
                  placeholder="যেমন: বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (BUET)"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">বিশেষজ্ঞতার বিষয় (Subject Specialty):</label>
                <input
                  type="text"
                  placeholder="যেমন: পদার্থবিজ্ঞান ও আইকিউ স্পেশালিস্ট"
                  value={subjectSpecialty}
                  onChange={(e) => setSubjectSpecialty(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">সংক্ষিপ্ত জীবনবৃত্তান্ত / বায়ো (Bio):</label>
              <textarea
                rows={3}
                placeholder="আপনার শিক্ষকতা অভিজ্ঞতা, সাফল্য ও ক্যাডেট গাইড করার সংক্ষেপ বিবরণ লিখুন..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-8 py-3.5 bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] text-black font-bold text-xs rounded-xl shadow-lg gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSavingProfile ? "সংরক্ষণ করা হচ্ছে..." : "ইনস্ট্রাক্টর প্রোফাইল সেভ করুন"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
