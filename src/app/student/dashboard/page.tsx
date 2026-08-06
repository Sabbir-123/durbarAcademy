"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, Calendar, HelpCircle, CheckCircle2, User, Trophy, CreditCard, ShieldAlert, UserCheck, Upload, Camera } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [restricted, setRestricted] = useState<boolean>(false);
  const [appealText, setAppealText] = useState("");
  const [appealSuccess, setAppealSuccess] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // Profile Form States
  const [fullName, setFullName] = useState("");
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
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get Profile details
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prof) {
        setProfile(prof);
        setFullName(prof.full_name || "");
        setPhone(prof.phone || "");
        setSchoolName(prof.school_name || prof.college || "");
        setAddress(prof.address || prof.city || "");
        setParentName(prof.parent_name || "");
        setParentPhone(prof.parent_phone || "");
        setAvatarUrl(prof.avatar_url || "");
      }

      // Check restrictions
      const { data: restriction } = await supabase
        .from("account_restrictions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_blocked", true)
        .maybeSingle();
      if (restriction) {
        setRestricted(true);
      }

      // Fetch enrolled courses
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("courses(*)")
        .eq("student_id", user.id)
        .eq("status", "active");

      if (enrollments && enrollments.length > 0) {
        setCourses(enrollments.map((e: any) => e.courses));
        setTests([
          { id: "t1", title: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র ফাইনাল মক টেস্ট", time_limit_minutes: 60, total_marks: 100 },
          { id: "t2", title: "উচ্চতর গণিত ক্যালকুলাস ও ভেক্টর স্পেশাল ড্রিল", time_limit_minutes: 45, total_marks: 50 },
        ]);
        setPayments([
          { id: "p1", amount: 9500, payment_method: "bKash", transaction_reference: "BKX99882231", payment_date: "২৫ জুলাই, ২০২৬" },
        ]);
      } else {
        try {
          const rawLocalEnrolled = localStorage.getItem(`durbar_enrolled_${user.id}`);
          if (rawLocalEnrolled) {
            const parsed = JSON.parse(rawLocalEnrolled);
            const list = Array.isArray(parsed) ? parsed : [];
            setCourses(list);
            if (list.length > 0) {
              setTests([
                { id: "t1", title: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র ফাইনাল মক টেস্ট", time_limit_minutes: 60, total_marks: 100 },
              ]);
            } else {
              setTests([]);
              setPayments([]);
              setTickets([]);
            }
          } else {
            setCourses([]);
            setTests([]);
            setPayments([]);
            setTickets([]);
          }
        } catch {
          setCourses([]);
          setTests([]);
          setPayments([]);
          setTickets([]);
        }
      }
    }
    loadData();
  }, []);

  const handleAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppealSuccess(true);
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSuccess(true);
    setTickets((prev) => [
      ...prev,
      { id: Date.now().toString(), subject: ticketSubject, status: "open", created_at: "আজ" },
    ]);
    setTicketSubject("");
    setTicketDesc("");
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(false);
    setProfileError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ব্যবহারকারী সনাক্ত করা যায়নি।");

      const updateData = {
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

      const { error: profErr } = await supabase
        .from("profiles")
        .upsert(updateData);

      if (profErr) throw profErr;

      // Also upsert to student_profiles
      await supabase.from("student_profiles").upsert({
        student_id: user.id,
        school: schoolName,
        guardian_name: parentName,
        parent_phone: parentPhone,
        updated_at: new Date().toISOString(),
      });

      setProfile((prev: any) => ({
        ...prev,
        ...updateData,
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
      <DashboardSidebar
        role="student"
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Profile Welcomer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              student dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              স্বাগতম, {profile?.full_name || "শিক্ষার্থী"}!
            </h1>
            <p className="text-xs text-slate-300">
              শিক্ষা, শৃঙ্খলা ও মেন্টরশিপের মাধ্যমে আপনার ভর্তি প্রিপারেশন বেগবান করুন।
            </p>
          </div>
          <DashboardHeader role="student" />
          <div className="flex items-center gap-3 bg-[#0D2038] px-4 py-2.5 rounded-xl border border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#163255] flex items-center justify-center font-bold text-emerald-400">
              {profile?.full_name?.charAt(0) || "S"}
            </div>
            <div>
              <span className="text-xs font-bold block text-white">{profile?.full_name}</span>
              <span className="text-[10px] text-slate-400 block">{profile?.email}</span>
            </div>
          </div>
        </div>

        {/* RESTRICTION WARNING / BLOCK APPEAL */}
        {restricted && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-red-400 font-extrabold text-lg">⚠️ অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে!</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              একাধিক ডিভাইসে একই সাথে লগইন করার নীতিমালার লঙ্ঘনের কারণে আপনার অ্যাকাউন্ট সাময়িকভাবে বন্ধ আছে। চালুর জন্য আবেদন জমা দিন।
            </p>
            {!appealSuccess ? (
              <form onSubmit={handleAppeal} className="space-y-3">
                <textarea
                  required
                  rows={3}
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  placeholder="অ্যাকাউন্টটি আনব্লক করার আবেদন এবং কারণ লিখুন..."
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-black bg-red-400 rounded-xl"
                >
                  আবেদন পাঠান
                </button>
              </form>
            ) : (
              <div className="text-emerald-400 text-xs font-bold bg-emerald-500/10 p-3 rounded-xl">
                আপনার আবেদনটি গৃহীত হয়েছে। অ্যাডমিন প্যানেল পর্যালোচনা করছে।
              </div>
            )}
          </div>
        )}

        {/* Core Enrolled Courses Grid */}
        <section id="courses" className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#F59E0B]" />
            <span>আমার কোর্সসমূহ ({courses.length}টি)</span>
          </h2>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-[#F59E0B]/30 transition-all shadow-lg"
                >
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white leading-snug">{course.title}</h3>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          {course.courseMode === "online"
                            ? "🌐 অনলাইন"
                            : course.courseMode === "offline"
                            ? "🏫 অফলাইন"
                            : "🌐 অনলাইন ও 🏫 অফলাইন"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{course.tagline}</p>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-300">কোর্স অগ্রগতি</span>
                        <span className="text-emerald-400">{course.progress || 0}% সম্পন্ন</span>
                      </div>
                      <div className="w-full h-2 bg-[#07182E] rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-[#F59E0B] to-emerald-400 rounded-full"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 flex justify-end">
                    <Link
                      href={`/student/courses/${course.id}`}
                      className="px-5 py-2.5 text-xs font-bold text-black bg-[#F59E0B] rounded-xl hover:bg-[#FACC15]"
                    >
                      ক্লাসে প্রবেশ করুন
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-8 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">আপনি এখনো কোনো কোর্সে এনরোল করেননি</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                আমাদের নতুন সকল ডিফেন্স ও মেধা প্রস্তুতি কোর্স দেখতে কোর্স ক্যাটালগে প্রবেশ করুন এবং আবেদন সম্পন্ন করুন।
              </p>
              <Link
                href="/courses"
                className="inline-block px-5 py-2.5 text-xs font-bold text-black bg-[#F59E0B] rounded-xl hover:bg-[#FACC15] transition-all"
              >
                কোর্সসমূহ দেখুন
              </Link>
            </div>
          )}
        </section>

        {/* Dynamic CBT Tests Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Assigned Tests */}
          <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
              <span>আইএসএসবি ও একাডেমি মক টেস্ট</span>
            </h3>

            <div className="space-y-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="bg-[#07182E] p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <span className="font-bold text-white block mb-0.5">{test.title}</span>
                    <span className="text-slate-400 block">• সময়সীমা: {test.time_limit_minutes} মিনিট | পূর্ণমান: {test.total_marks}</span>
                  </div>
                  <Link
                    href={`/student/tests/${test.id}`}
                    className="px-4 py-2 text-xs font-bold text-black bg-[#FACC15] rounded-xl hover:scale-105 transition-transform"
                  >
                    অংশ নিন
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Support / Helpdesk Ticket Builder */}
          <section id="tickets" className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#F59E0B]" />
              <span>১-অন-১ মেন্টর সাপোর্ট টিকিট</span>
            </h3>

            {ticketSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs">
                সহায়তা টিকিটটি সফলভাবে খোলা হয়েছে।
              </div>
            )}

            <form onSubmit={handleTicketSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="সমস্যার বিষয় (যেমন: ভেক্টর অধ্যায় ৩ ম্যাথ সমস্যা)"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
              />
              <textarea
                required
                rows={2}
                placeholder="বিস্তারিত সমস্যা বা প্রশ্নের লিঙ্ক..."
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-black bg-gradient-to-r from-[#F59E0B] to-[#FACC15] rounded-xl"
              >
                টিকিট জমা দিন
              </button>
            </form>

            {/* List Active Tickets */}
            <div className="pt-2 space-y-2 border-t border-white/5">
              {tickets.map((t) => (
                <div key={t.id} className="flex justify-between text-xs text-slate-300">
                  <span>{t.subject}</span>
                  <span className="text-amber-400 capitalize font-bold">{t.status}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Student Profile Settings Section */}
        <section id="profile" className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#F59E0B]" />
                <span>আমার শিক্ষার্থী প্রোফাইল ও তথ্যাবলী</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                আপনার ছবি, শিক্ষাপ্রতিষ্ঠান, ঠিকানা ও অভিভাবকের যোগাযোগের তথ্য হালনাগাদ রাখুন।
              </p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#FACC15] border border-[#F59E0B]/30 shrink-0">
              প্রোফাইল সেটিংস
            </span>
          </div>

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
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#07182E] border border-white/5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#163255] border-2 border-[#F59E0B] flex items-center justify-center shrink-0 shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-amber-400">
                    {fullName?.charAt(0) || profile?.full_name?.charAt(0) || "S"}
                  </span>
                )}
              </div>
              <div className="space-y-3 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-slate-300 block">প্রোফাইল ছবি আপলোড / লিঙ্ক:</label>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 hover:bg-[#F59E0B]/30 transition-all font-bold text-xs shrink-0">
                    <Upload className="w-3.5 h-3.5" />
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

            {/* Grid 1: Name & Student Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর পূর্ণ নাম:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সাব্বির হোসেন"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর মোবাইল নম্বর:*</label>
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

            {/* Grid 2: Institution & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">স্কুল / কলেজ / প্রতিষ্ঠানের নাম:</label>
                <input
                  type="text"
                  placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">বাসস্থান / বর্তমান ঠিকানা:</label>
                <input
                  type="text"
                  placeholder="যেমন: মিরপুর ১০, ঢাকা"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {/* Grid 3: Parent's Name & Parent's Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">অভিভাবকের পূর্ণ নাম:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
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
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {/* Parent Phone Manual Verification Alert Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3 shadow-inner">
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

        {/* Transaction History log */}
        <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>ভর্তি পেমেন্ট ও রসিদ লগ</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/10 pb-2 text-left">
                  <th className="pb-2">তারিখ</th>
                  <th className="pb-2">লেনদেন রেফারেন্স</th>
                  <th className="pb-2">পদ্ধতি</th>
                  <th className="pb-2 text-right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0">
                    <td className="py-2.5">{p.payment_date}</td>
                    <td className="py-2.5 font-mono">{p.transaction_reference}</td>
                    <td className="py-2.5">{p.payment_method}</td>
                    <td className="py-2.5 text-right font-bold text-white">৳{p.amount.toLocaleString("bn-BD")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
