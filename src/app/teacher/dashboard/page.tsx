"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, Users, HelpCircle, CheckCircle, Plus, FileText, Sparkles, Coins } from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketReply, setTicketReply] = useState<Record<string, string>>({});
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseSuccess, setExpenseSuccess] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(prof);

      // Fetch assigned courses fallback
      setAssignedCourses([
        { id: "c1", title: "বুয়েট ও সিকেআরইউইটি স্পেশাল অ্যাডমিশন ২০২৬", students_count: 142, lessons_count: 24 },
        { id: "c2", title: "ডিএমসি মেডিকেল ভর্তি প্রিপারেশন মাস্টারক্লাস", students_count: 98, lessons_count: 18 },
      ]);

      // Fetch pending support tickets fallback
      setTickets([
        { id: "tk1", student_name: "ফাহিম রেজওয়ান", subject: "ক্যালকুলাস চ্যাপ্টার ৪ ডাউট সলভ", status: "open", description: "ম্যাথ বইয়ের প্রশ্ন নং ১২-এর লিমিট অংশটি বুঝতে পারছি না।" },
      ]);
    }
    loadData();
  }, []);

  const handleTicketReplySubmit = (ticketId: string) => {
    alert(`টিকিট ${ticketId}-এর উত্তর জমা দেওয়া হয়েছে।`);
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseSuccess(true);
    setExpenseAmount("");
    setExpenseDesc("");
  };

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
              instructor dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              স্বাগতম, {profile?.full_name || "শিক্ষক"}!
            </h1>
            <p className="text-xs text-slate-300">
              শিক্ষার্থীদের লিডারশিপ ও একাডেমি কোর্স কারিকুলাম পরিচালনা প্যানেল।
            </p>
          </div>
        </div>

        {/* Overview Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-[#F59E0B] block">০২ টি</span>
              <span className="text-xs text-slate-300">বরাদ্দকৃত কোর্সসমূহ</span>
            </div>
            <BookOpen className="w-8 h-8 text-[#F59E0B] opacity-40" />
          </div>

          <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-emerald-400 block">২৪০ জন</span>
              <span className="text-xs text-slate-300">মোট অধ্যয়নরত শিক্ষার্থী</span>
            </div>
            <Users className="w-8 h-8 text-emerald-400 opacity-40" />
          </div>

          <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-white block">{tickets.length} টি</span>
              <span className="text-xs text-slate-300">সমাধানহীন সহায়তা টিকিট</span>
            </div>
            <HelpCircle className="w-8 h-8 text-slate-400 opacity-40" />
          </div>
        </div>

        {/* Assigned Courses Management Grid */}
        <section id="content" className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#F59E0B]" />
            <span>আমার বরাদ্দকৃত কোর্স ও কারিকুলাম</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-[#F59E0B]/30 transition-all shadow-lg"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white leading-snug">{course.title}</h3>
                  <div className="flex gap-4 text-xs text-slate-400 pt-1">
                    <span>• শিক্ষার্থী: {course.students_count} জন</span>
                    <span>• লেকচার: {course.lessons_count} টি</span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex justify-end">
                  <Link
                    href={`/teacher/courses/${course.id}`}
                    className="px-5 py-2.5 text-xs font-bold text-black bg-[#F59E0B] rounded-xl hover:bg-[#FACC15]"
                  >
                    সিলেবাস এডিট করুন
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Helpdesk Support Queue */}
          <section id="tickets" className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#F59E0B]" />
              <span>শিক্ষার্থী ডাউট সলভ টিকিটের সারি</span>
            </h3>

            {tickets.length === 0 ? (
              <div className="text-xs text-slate-400 italic">কোনো পেন্ডিং টিকিট নেই।</div>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div key={t.id} className="bg-[#07182E] p-4 rounded-xl border border-white/5 space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-[#FACC15]">{t.student_name}</span>
                      <span className="text-slate-400">{t.status}</span>
                    </div>
                    <p className="font-semibold text-white">{t.subject}</p>
                    <p className="text-slate-300 italic">"{t.description}"</p>
                    
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <textarea
                        rows={2}
                        value={ticketReply[t.id] || ""}
                        onChange={(e) => setTicketReply({ ...ticketReply, [t.id]: e.target.value })}
                        placeholder="আপনার উত্তর প্রদান করুন..."
                        className="w-full bg-[#0D2038] border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                      />
                      <button
                        onClick={() => handleTicketReplySubmit(t.id)}
                        className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg"
                      >
                        জবাব পাঠান
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Expense Request Form */}
          <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              <span>ব্যয় বিল ও বাজেট রিকুইজিশন ফরম</span>
            </h3>

            {expenseSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs">
                আপনার ব্যয়ের রিকুইজিশন সফলভাবে অ্যাডমিনের কাছে পাঠানো হয়েছে।
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">টাকার পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  placeholder="যেমন: ১৫০০"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">ব্যয়ের উদ্দেশ্য/বিবরণ</label>
                <textarea
                  required
                  rows={2}
                  placeholder="যেমন: পদার্থবিজ্ঞান কোয়েশ্চেন ব্যাংক প্রিন্টিং ও কুরিয়ার খরচ"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl shadow-md"
              >
                অনুমোদনের জন্য পাঠান
              </button>
            </form>
          </section>

        </div>

      </main>
    </div>
  );
}
