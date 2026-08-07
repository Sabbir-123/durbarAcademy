"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import {
  getStoredEnrollments,
  subscribeEnrollmentStore,
  EnrollmentRecord,
  fetchEnrollmentsFromDatabase,
} from "@/utils/enrollmentStore";
import {
  BookOpen,
  Trophy,
  CreditCard,
  UserCheck,
  HelpCircle,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Edit,
} from "lucide-react";
import Link from "next/link";

import { ensureStudentCode } from "@/utils/studentIdGenerator";
import ProgressLoader from "@/components/ProgressLoader";

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [studentCode, setStudentCode] = useState<string>("");
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [restricted, setRestricted] = useState<boolean>(false);
  const [appealText, setAppealText] = useState("");
  const [appealSuccess, setAppealSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get or ensure Unique Student ID
      const code = await ensureStudentCode(user.id, user.email);
      setStudentCode(code);

      // Get Profile details directly from Supabase DB
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({
        ...prof,
        full_name: prof?.full_name || "শিক্ষার্থী",
        email: prof?.email || user.email,
        avatar_url: prof?.avatar_url || "",
        student_code: prof?.student_code || code,
      });

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

      // Fetch enrollments directly from pure Database API
      const freshLocal = await fetchEnrollmentsFromDatabase();
      const studentRecs = freshLocal.filter((e) => {
        if (user) {
          if (e.student_id && e.student_id === user.id) return true;
          if (user.email && e.student_email && e.student_email.toLowerCase() === user.email.toLowerCase()) return true;
          if (prof?.phone && e.student_phone && (e.student_phone.includes(prof.phone) || prof.phone.includes(e.student_phone))) return true;
          return false;
        }
        return true;
      });

      setEnrollments(studentRecs);

      const approvedCount = studentRecs.filter(
        (e) => e.status === "approved" || (e.status as any) === "active"
      ).length;

      if (approvedCount > 0) {
        setTests([
          { id: "t1", title: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র ফাইনাল মক টেস্ট", time_limit_minutes: 60, total_marks: 100 },
          { id: "t2", title: "উচ্চতর গণিত ক্যালকুলাস ও ভেক্টর স্পেশাল ড্রিল", time_limit_minutes: 45, total_marks: 50 },
        ]);
      } else {
        setTests([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppealSuccess(true);
  };

  const approvedEnrollments = enrollments.filter(
    (e) => e.status === "approved" || (e.status as any) === "active"
  );
  const pendingEnrollments = enrollments.filter((e) => e.status === "pending");
  const actionRequiredEnrollments = enrollments.filter(
    (e) => e.status === "modification_needed" || e.status === "rejected"
  );

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar role="student" activeTab="dashboard" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Profile Welcomer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
                student dashboard overview
              </span>
              {studentCode && (
                <span className="text-[11px] font-black text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  আইডি: {studentCode}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              স্বাগতম, {profile?.full_name || "শিক্ষার্থী"}!
            </h1>
            <p className="text-xs text-slate-300">
              শিক্ষা, শৃঙ্খলা ও মেন্টরশিপের মাধ্যমে আপনার ডিফেন্স অফিসার ভর্তি প্রিপারেশন বেগবান করুন।
            </p>
          </div>
          <DashboardHeader
            role="student"
            studentCode={studentCode || profile?.student_code}
            studentId={profile?.id}
            studentEmail={profile?.email}
          />
        </div>

        {loading && <ProgressLoader label="ডাটাবেজ থেকে শিক্ষার্থীর তথ্য ও ভর্তি স্ট্যাটাস লোড হচ্ছে..." />}

        {/* NOTIFICATION CENTER FOR PENDING / MODIFICATION ACTION REQUIRED */}
        {actionRequiredEnrollments.map((record) => (
          <div
            key={record.id}
            className={`border rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl animate-fade-in ${
              record.status === "modification_needed"
                ? "bg-sky-500/10 border-sky-500/40 text-sky-200"
                : "bg-red-500/10 border-red-500/40 text-red-200"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-black text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>
                  {record.status === "modification_needed"
                    ? "⚠️ ভর্তি আবেদনে তথ্য সংশোধন প্রয়োজন"
                    : "❌ ভর্তি আবেদনটি বাতিল করা হয়েছে"}
                </span>
              </div>
              <Link
                href="/student/courses"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-slate-200 transition-all shrink-0"
              >
                {record.status === "modification_needed" ? "তথ্য সংশোধন করুন →" : "পুনরায় আবেদন করুন →"}
              </Link>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              কোর্স: <strong className="text-white">{record.course_title}</strong> — 
              {record.admin_note ? ` অ্যাডমিন নির্দেশনা: "${record.admin_note}"` : " তথ্যাবলী যাঁচাই করে আপডেট জমা দিন।"}
            </p>
          </div>
        ))}

        {pendingEnrollments.map((record) => (
          <div
            key={record.id}
            className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-2 shadow-xl text-amber-200 animate-fade-in"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-black text-sm text-amber-400">
                <Clock className="w-5 h-5 shrink-0" />
                <span>⏳ পেমেন্ট ভেরিফিকেশন পর্যবেক্ষণাধীন রয়েছে (Pending Admin Approval)</span>
              </div>
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                TrxID: {record.trx_id}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার <strong className="text-white">{record.course_title}</strong> কোর্সের ভর্তি পেমেন্ট যাঁচাই করা হচ্ছে। অ্যাডমিন প্যানেল থেকে অনুমোদনের পর ২৪ ঘণ্টার মধ্যে ক্লাস এক্সেস সক্রিয় হবে।
            </p>
          </div>
        ))}

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

        {/* Quick Portal Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/student/courses"
            className="bg-[#0D2038] p-6 rounded-3xl border border-white/10 flex items-center justify-between hover:border-[#F59E0B]/40 transition-all group shadow-md"
          >
            <div>
              <span className="text-2xl font-black text-[#F59E0B] block">{enrollments.length} টি</span>
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors font-bold mt-1 block">
                আমার কোর্সসমূহ →
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/student/profile"
            className="bg-[#0D2038] p-6 rounded-3xl border border-white/10 flex items-center justify-between hover:border-emerald-400/40 transition-all group shadow-md"
          >
            <div>
              <span className="text-base font-extrabold text-emerald-400 block">প্রোফাইল তথ্য</span>
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors font-bold mt-1 block">
                আমার প্রোফাইল সেটিং →
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/student/courses#tickets"
            className="bg-[#0D2038] p-6 rounded-3xl border border-white/10 flex items-center justify-between hover:border-sky-400/40 transition-all group shadow-md"
          >
            <div>
              <span className="text-base font-extrabold text-sky-400 block">১-অন-১ সাপোর্ট</span>
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors font-bold mt-1 block">
                সহায়তা টিকিট খুলুন →
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <HelpCircle className="w-6 h-6" />
            </div>
          </Link>
        </div>

        {/* Core Enrolled Courses Preview Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#F59E0B]" />
              <span>আমার কোর্সসমূহ ({enrollments.length}টি)</span>
            </h2>
            <Link
              href="/student/courses"
              className="text-xs font-bold text-[#FACC15] hover:underline flex items-center gap-1"
            >
              <span>সকল কোর্স পেজ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.slice(0, 2).map((record) => {
                const isApproved = record.status === "approved" || (record.status as any) === "active";
                const isPending = record.status === "pending";

                return (
                  <div
                    key={record.id}
                    className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-[#F59E0B]/30 transition-all shadow-lg"
                  >
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-white leading-snug">{record.course_title}</h3>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize shrink-0 ${
                              isApproved
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : isPending
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {isApproved
                              ? "✅ ভর্তি অনুমোদিত"
                              : isPending
                              ? "⏳ পেমেন্ট যাঁচাইাধীন"
                              : "❌ আবেদন বাতিল/সংশোধন"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          পেমেন্ট নম্বর: <strong className="font-mono text-white">{record.sender_number}</strong> • TrxID: <strong className="font-mono text-[#F59E0B]">{record.trx_id}</strong>
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-300">কোর্স লাইভ অগ্রগতি</span>
                          <span className="text-emerald-400">{isApproved ? "100%" : "0% (অপেক্ষমান)"}</span>
                        </div>
                        <div className="w-full h-2 bg-[#07182E] rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div
                            className={`h-full rounded-full ${
                              isApproved ? "bg-gradient-to-r from-[#F59E0B] to-emerald-400 w-full" : "bg-amber-500/30 w-1/12"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5 flex justify-end">
                      {isApproved ? (
                        <Link
                          href={`/student/courses/${record.course_id}`}
                          className="px-5 py-2.5 text-xs font-extrabold text-black bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl transition-all"
                        >
                          ক্লাসে প্রবেশ করুন
                        </Link>
                      ) : (
                        <Link
                          href="/student/courses"
                          className="px-5 py-2.5 text-xs font-bold text-slate-300 bg-white/5 rounded-xl border border-white/10 hover:text-white"
                        >
                          বিস্তারিত স্ট্যাটাস দেখুন →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
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

        {/* CBT Tests Section */}
        {tests.length > 0 && (
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
        )}

        {/* Transaction History Log */}
        {enrollments.length > 0 && (
          <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>ভর্তি পেমেন্ট ও রসিদ খতিয়ান</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 pb-2 text-left">
                    <th className="pb-2">তারিখ</th>
                    <th className="pb-2">কোর্স</th>
                    <th className="pb-2">প্রেরক নম্বর & TrxID</th>
                    <th className="pb-2">পদ্ধতি</th>
                    <th className="pb-2 text-right">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 last:border-0">
                      <td className="py-2.5">{new Date(p.created_at).toLocaleDateString("bn-BD")}</td>
                      <td className="py-2.5 font-bold text-white">{p.course_title}</td>
                      <td className="py-2.5 font-mono">{p.sender_number} ({p.trx_id})</td>
                      <td className="py-2.5 uppercase">{p.payment_method}</td>
                      <td className="py-2.5 text-right font-bold">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                            p.status === "approved" || (p.status as any) === "active"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : p.status === "rejected"
                              ? "bg-red-500/20 text-red-300"
                              : p.status === "modification_needed"
                              ? "bg-sky-500/20 text-sky-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {p.status === "approved" || (p.status as any) === "active"
                            ? "অনুমোদিত"
                            : p.status === "rejected"
                            ? "বাতিল"
                            : p.status === "modification_needed"
                            ? "সংশোধন প্রয়োজন"
                            : "অপেক্ষমান"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
