"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, ChevronRight, Award, Clock } from "lucide-react";
import Link from "next/link";

export default function StudentCoursesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadEnrolledCourses() {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(prof);

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("courses(*)")
        .eq("student_id", user.id)
        .eq("status", "active");

      if (enrollments && enrollments.length > 0) {
        setCourses(enrollments.map((e: any) => e.courses));
      } else {
        try {
          const rawLocalEnrolled = localStorage.getItem(`durbar_enrolled_${user.id}`);
          if (rawLocalEnrolled) {
            const parsed = JSON.parse(rawLocalEnrolled);
            setCourses(Array.isArray(parsed) ? parsed : []);
          } else {
            setCourses([]);
          }
        } catch {
          setCourses([]);
        }
      }
      setIsLoading(false);
    }
    loadEnrolledCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar role="student" activeTab="courses" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              my enrolled courses
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-[#F59E0B]" />
              <span>আমার কোর্সসমূহ ({courses.length}টি)</span>
            </h1>
            <p className="text-xs text-slate-300">
              আপনার ভর্তি হওয়া ডিফেন্স ও মেধা প্রস্তুতি কোর্স কারিকুলাম এবং চলমান ক্লাসের তালিকা।
            </p>
          </div>
          <DashboardHeader role="student" />
        </div>

        {/* Courses Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 h-56 animate-pulse"
              >
                <div className="h-6 bg-white/10 rounded-lg w-3/4 mb-4" />
                <div className="h-4 bg-white/5 rounded-lg w-1/2 mb-6" />
                <div className="h-3 bg-white/10 rounded-full w-full mt-8" />
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#F59E0B]/40 transition-all shadow-xl group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug group-hover:text-[#FACC15] transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                        {course.tagline || course.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                      {course.courseMode === "online"
                        ? "🌐 অনলাইন"
                        : course.courseMode === "offline"
                        ? "🏫 অফলাইন"
                        : "🌐 অনলাইন ও 🏫 অফলাইন"}
                    </span>
                  </div>

                  {/* Course Details Info */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-[#07182E] p-3 rounded-2xl border border-white/5 flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-[#F59E0B] shrink-0" />
                      <span>মেয়াদ: {course.duration || "নির্ধারিত সময়"}</span>
                    </div>
                    <div className="bg-[#07182E] p-3 rounded-2xl border border-white/5 flex items-center gap-2 text-slate-300">
                      <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>সার্টিফিকেট অন্তর্ভুক্ত</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-300">কোর্স লাইভ অগ্রগতি</span>
                      <span className="text-emerald-400">{course.progress || 0}% সম্পন্ন</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#07182E] rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">ব্যাচ: {course.batch_code || "নিয়মিত ব্যাচ"}</span>
                  <Link
                    href={`/student/courses/${course.id}`}
                    className="px-6 py-3 text-xs font-extrabold text-black bg-gradient-to-r from-[#F59E0B] to-[#FACC15] rounded-xl hover:scale-105 transition-all shadow-lg gold-glow flex items-center gap-2"
                  >
                    <span>ক্লাসে প্রবেশ করুন</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-12 text-center space-y-5 shadow-2xl max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">আপনি এখনো কোনো কোর্সে এনরোল করেননি</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                আমাদের বাংলাদেশ ডিফেন্স ও মিলিটারি একাডেমি প্রস্তুতি কোর্সে ভর্তি হয়ে আপনার অফিসার হওয়ার যাত্রা বেগবান করুন।
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-xs font-bold text-black bg-gradient-to-r from-[#F59E0B] to-[#FACC15] rounded-xl hover:scale-105 transition-all shadow-lg gold-glow"
            >
              <span>সকল কোর্স দেখুন</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
