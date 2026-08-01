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
import { getStoredCourses, subscribeCoursesStore } from "@/utils/courseStore";
import { getCurrentUser } from "@/utils/userStore";
import {
  BookOpen,
  Users,
  Trophy,
  Video,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [coursesCount, setCoursesCount] = useState(0);
  const [successStories, setSuccessStories] = useState<StudentSuccess[]>([]);

  const supabase = createClient();

  useEffect(() => {
    setSuccessStories(getStoredSuccessStories());

    const unsubStories = subscribeSuccessStoriesStore(() => {
      setSuccessStories(getStoredSuccessStories());
    });

    function calculateAssignedCourses(profEmail?: string, authEmail?: string) {
      const curr = getCurrentUser();
      const teacherEmail = (profEmail || authEmail || curr?.email || "").trim().toLowerCase();
      const allCourses = getStoredCourses();
      const assigned = allCourses.filter((c) => {
        if (c.teacherEmails && c.teacherEmails.length > 0) {
          if (!teacherEmail) return false;
          return c.teacherEmails.some((e) => e.trim().toLowerCase() === teacherEmail);
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(prof);
        calculateAssignedCourses(prof?.email, user.email);
      }
    }
    loadData();

    return () => {
      unsubStories();
      unsubCourses();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar role="teacher" activeTab="dashboard" />

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
      </main>
    </div>
  );
}
