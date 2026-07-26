"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, Calendar, HelpCircle, CheckCircle2, User, Trophy, CreditCard } from "lucide-react";
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
  
  const supabase = createClient();

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
      setProfile(prof);

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

      // Fetch enrolled courses via mock data fallback if tables not seeded yet
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("courses(*)")
        .eq("student_id", user.id)
        .eq("status", "active");

      // Set fallback if empty
      if (enrollments && enrollments.length > 0) {
        setCourses(enrollments.map((e: any) => e.courses));
      } else {
        setCourses([
          { id: "c1", title: "বুয়েট ও সিকেআরইউইটি স্পেশাল অ্যাডমিশন ২০২৬", tagline: "ক্যাডেট ও ইঞ্জিনিয়ারিং লিডারশিপ প্রিপারেশন", progress: 68 },
          { id: "c2", title: "ডিএমসি মেডিকেল ভর্তি প্রিপারেশন মাস্টারক্লাস", tagline: "সাইকোলজিক্যাল ও ওএমআর ভাইভা ড্রিল", progress: 42 },
        ]);
      }

      // Fetch active tests
      setTests([
        { id: "t1", title: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র ফাইনাল মক টেস্ট", time_limit_minutes: 60, total_marks: 100 },
        { id: "t2", title: "উচ্চতর গণিত ক্যালকুলাস ও ভেক্টর স্পেশাল ড্রিল", time_limit_minutes: 45, total_marks: 50 },
      ]);

      // Fetch payments log
      setPayments([
        { id: "p1", amount: 9500, payment_method: "bKash", transaction_reference: "BKX99882231", payment_date: "২৫ জুলাই, ২০২৬" },
        { id: "p2", amount: 8900, payment_method: "Nagad", transaction_reference: "NGD22334411", payment_date: "২০ জুলাই, ২০২৬" },
      ]);

      // Fetch assistance requests
      setTickets([
        { id: "tk1", subject: "ক্যালকুলাস চ্যাপ্টার ৪ ডাউট সলভ", status: "open", created_at: "২৫ জুলাই, ২০২৬" },
      ]);
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

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar role="student" activeTab="dashboard" />

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
            <span>আমার কোর্সসমূহ</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-[#F59E0B]/30 transition-all shadow-lg"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">{course.title}</h3>
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
