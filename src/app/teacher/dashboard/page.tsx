"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import { StudentSuccess } from "@/data/testimonials";
import {
  getStoredSuccessStories,
  subscribeSuccessStoriesStore,
} from "@/utils/successStoryStore";
import { getStoredCourses, subscribeCoursesStore, syncCoursesFromSupabase } from "@/utils/courseStore";
import { getCurrentUser, getStoredUsers, isSuperAdminEmail } from "@/utils/userStore";
import {
  BookOpen,
  Users,
  Trophy,
  Video,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  UserCheck,
  Upload,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [coursesCount, setCoursesCount] = useState(0);
  const [successStories, setSuccessStories] = useState<StudentSuccess[]>([]);

  // Navigation & Profile Form States
  const [activeTab, setActiveTab] = useState("dashboard");
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
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setActiveTab(hash);
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    setSuccessStories(getStoredSuccessStories());

    const unsubStories = subscribeSuccessStoriesStore(() => {
      setSuccessStories(getStoredSuccessStories());
    });

    function calculateAssignedCourses(profEmail?: string, authEmail?: string, profFullName?: string) {
      const curr = getCurrentUser();
      const allUsers = typeof window !== "undefined" ? getStoredUsers() : [];

      const teacherName = (profFullName || profile?.full_name || curr?.full_name || "").trim().toLowerCase();
      const teacherEmailFromStore = allUsers.find(
        (u) =>
          (teacherName && u.full_name.trim().toLowerCase() === teacherName) ||
          (profile?.id && u.id === profile.id)
      )?.email;

      const teacherEmail = (
        teacherEmailFromStore ||
        profEmail ||
        authEmail ||
        curr?.email ||
        profile?.email ||
        ""
      ).trim().toLowerCase();

      const isUserAdmin =
        profile?.role?.toLowerCase().includes("admin") ||
        curr?.role?.toLowerCase().includes("admin") ||
        isSuperAdminEmail(teacherEmail);

      const allCourses = getStoredCourses();
      const assigned = allCourses.filter((c) => {
        if (isUserAdmin) return true;
        if (c.teacherEmails && c.teacherEmails.length > 0) {
          // 1. Direct Email match
          if (teacherEmail && c.teacherEmails.some((e) => e.trim().toLowerCase() === teacherEmail)) {
            return true;
          }

          // 2. Name match in instructors
          if (teacherName && c.instructors && c.instructors.length > 0) {
            const nameMatch = c.instructors.some((inst) =>
              inst.toLowerCase().includes(teacherName) || teacherName.includes(inst.toLowerCase())
            );
            if (nameMatch) return true;
          }

          // 3. UserStore lookup match
          if (teacherName) {
            const matchedUser = allUsers.find((u) => u.full_name.trim().toLowerCase() === teacherName);
            if (
              matchedUser &&
              c.teacherEmails.some((e) => e.trim().toLowerCase() === matchedUser.email.trim().toLowerCase())
            ) {
              return true;
            }
          }

          if (teacherEmail || teacherName) return false;
        }
        return true;
      });
      setCoursesCount(assigned.length);
    }

    calculateAssignedCourses();

    const unsubCourses = subscribeCoursesStore(() => {
      calculateAssignedCourses();
    });

    async function loadData() {
      await syncCoursesFromSupabase();
      calculateAssignedCourses();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data: teacherProf } = await supabase
          .from("teacher_profiles")
          .select("*")
          .eq("teacher_id", user.id)
          .maybeSingle();

        if (prof) {
          setProfile(prof);
          setFullName(prof.full_name || "");
          setPhone(prof.phone || "");
          setAvatarUrl(prof.avatar_url || "");
          setInstitution(teacherProf?.institution || prof.college || "");
          setSubjectSpecialty(teacherProf?.subject_specialty || "");
          setBio(teacherProf?.bio || "");
          calculateAssignedCourses(prof?.email, user?.email, prof?.full_name);
        }
      }
    }
    loadData();

    return () => {
      unsubStories();
      unsubCourses();
    };
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(false);
    setProfileError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      if (profErr) throw profErr;

      // Upsert teacher_profiles
      await supabase.from("teacher_profiles").upsert({
        teacher_id: user.id,
        institution: institution,
        subject_specialty: subjectSpecialty,
        bio: bio,
        updated_at: new Date().toISOString(),
      });

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
      <DashboardSidebar
        role="teacher"
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Welcomer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              instructor dashboard overview
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              স্বাগতম, {profile?.full_name || "ইনস্ট্রাক্টর"}!
            </h1>
            <p className="text-xs text-slate-300">
              কোর্স কারিকুলাম, কন্টেন্ট ম্যানেজমেন্ট এবং কৃতি শিক্ষার্থীদের সাকসেস স্টোরি প্যানেল।
            </p>
          </div>
          <DashboardHeader role="teacher" />
        </div>

        {/* Overview Quick Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/teacher/courses"
            className="bg-[#0D2038] p-5 rounded-3xl border border-white/10 flex items-center justify-between hover:border-[#F59E0B]/40 transition-all group shadow-md"
          >
            <div>
              <span className="text-2xl font-black text-[#F59E0B] block">{coursesCount} টি</span>
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                সক্রিয় ডিফেন্স কোর্স কারিকুলাম →
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/teacher/classes"
            className="bg-[#0D2038] p-5 rounded-3xl border border-white/10 flex items-center justify-between hover:border-sky-400/40 transition-all group shadow-md"
          >
            <div>
              <span className="text-2xl font-black text-sky-400 block">ক্লাস ও কন্টেন্ট</span>
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                ব্যাচ, মডিউল ও ভিডিও ম্যানেজমেন্ট →
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Video className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/teacher/stories"
            className="bg-[#0D2038] p-5 rounded-3xl border border-white/10 flex items-center justify-between hover:border-amber-400/40 transition-all group shadow-md"
          >
            <div>
              <span className="text-2xl font-black text-amber-400 block">{successStories.length} টি</span>
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                কৃতি শিক্ষার্থী সাকসেস স্টোরিজ →
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
          </Link>
        </div>

        {/* Quick Access Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Curriculum Shortcut Panel */}
          <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#F59E0B]" />
                  <span>কোর্স কারিকুলাম ও সিলেবাস</span>
                </h3>
                <span className="text-xs font-bold text-[#FACC15] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full border border-[#F59E0B]/20">
                  {coursesCount} টি কোর্স
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ডিফেন্স ও মিলিটারি ক্যাডেটের জন্য বিষয়ভিত্তিক বিস্তারিত সিলেবাস, লেকচার প্ল্যান এবং কোর্স ফি পরিচালনা করার জন্য ডেডিকেটেড পেজ ব্যবহার করুন।
              </p>
            </div>

            <Link
              href="/teacher/courses"
              className="w-full py-3.5 bg-[#F59E0B] text-black font-bold text-xs rounded-xl hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>কোর্স কারিকুলাম পেজে যান</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Success Stories Shortcut Panel */}
          <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>কৃতি শিক্ষার্থী সাফল্য স্টোরি (CRUD)</span>
                </h3>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  {successStories.length} টি প্রকাশ
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                বাংলাদেশ বিমান বাহিনী (BAFA), সেনাবাহিনী (BMA), নৌবাহিনী (BN) ও ISSB পরীক্ষায় সুপারিশপ্রাপ্ত সফল ক্যাডেটদের তথ্য ওয়েবসাইট গ্যালারিতে যোগ বা সম্পাদনা করুন।
              </p>
            </div>

            <Link
              href="/teacher/stories"
              className="w-full py-3.5 bg-[#07182E] border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>সাকসেস স্টোরি পেজে যান</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Class & Test Content Manager Shortcut */}
        <div className="bg-[#0D2038] border border-sky-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ক্লাস ম্যানেজার & অনলাইন টেস্ট বিল্ডার</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                ব্যাচ, মাইলস্টোন, মডিউল অনুযায়ী ইউটিউব ভিডিও লিংক (Unlisted) এবং MCQ & True/False কুইজ সেটআপ করুন।
              </p>
            </div>
          </div>

          <Link
            href="/teacher/classes"
            className="px-5 py-3 bg-sky-500 text-white font-extrabold text-xs rounded-xl hover:brightness-110 shadow-lg transition-all shrink-0 flex items-center gap-2"
          >
            <span>ক্লাস কন্টেন্ট পরিচালনা</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Teacher / Instructor Profile Settings Section */}
        <section id="profile" className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#F59E0B]" />
                <span>আমার ইনস্ট্রাক্টর প্রোফাইল ও তথ্যাবলী</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                আপনার ইনস্ট্রাক্টর ছবি, শিক্ষাপ্রতিষ্ঠান, বিশেষজ্ঞতার বিষয় ও বায়ো ইনফরমেশন আপডেট করুন।
              </p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#FACC15] border border-[#F59E0B]/30 shrink-0">
              ইনস্ট্রাক্টর প্রোফাইল সেটিংস
            </span>
          </div>

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
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#07182E] border border-white/5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#163255] border-2 border-[#F59E0B] flex items-center justify-center shrink-0 shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-amber-400">
                    {fullName?.charAt(0) || profile?.full_name?.charAt(0) || "T"}
                  </span>
                )}
              </div>
              <div className="space-y-3 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-slate-300 block">ইনস্ট্রাক্টর ছবি আপলোড / লিঙ্ক:</label>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 hover:bg-[#F59E0B]/30 transition-all font-bold text-xs shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>নতুন ছবি ফাইল আপলোড করুন</span>
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
                  ডিভাইস থেকে সরাসরি ছবি আপলোড করতে "নতুন ছবি ফাইল আপলোড করুন" বাটনে ক্লিক করুন।
                </span>
              </div>
            </div>

            {/* Grid 1: Teacher Name & Teacher Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">ইনস্ট্রাক্টরের পূর্ণ নাম:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ইঞ্জি. তানভীর আহমেদ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
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
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {/* Grid 2: Institution & Subject Specialty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">শিক্ষা প্রতিষ্ঠান / বিশ্ববিদ্যালয়:</label>
                <input
                  type="text"
                  placeholder="যেমন: বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (BUET)"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">বিশেষজ্ঞতার বিষয় (Subject Specialty):</label>
                <input
                  type="text"
                  placeholder="যেমন: পদার্থবিজ্ঞান ও আইকিউ স্পেশালিস্ট"
                  value={subjectSpecialty}
                  onChange={(e) => setSubjectSpecialty(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {/* Bio Field */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">সংক্ষিপ্ত জীবনবৃত্তান্ত / বায়ো (Bio):</label>
              <textarea
                rows={3}
                placeholder="আপনার শিক্ষকতা অভিজ্ঞতা, সাফল্য ও ক্যাডেট গাইড করার সংক্ষেপ বিবরণ লিখুন..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
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
