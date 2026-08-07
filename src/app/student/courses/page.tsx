"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import RegistrationModal from "@/components/RegistrationModal";
import ProgressLoader from "@/components/ProgressLoader";
import { createClient } from "@/utils/supabase/client";
import {
  getStoredEnrollments,
  subscribeEnrollmentStore,
  submitEnrollmentRequest,
  updateEnrollmentStatusStore,
  EnrollmentRecord,
  fetchEnrollmentsFromDatabase,
} from "@/utils/enrollmentStore";
import {
  BookOpen,
  ChevronRight,
  Award,
  Clock,
  HelpCircle,
  CheckCircle2,
  Send,
  MessageSquare,
  AlertTriangle,
  Lock,
  Edit,
  X,
  Upload,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function StudentCoursesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modification Modal State
  const [modTargetRecord, setModTargetRecord] = useState<EnrollmentRecord | null>(null);
  const [modSenderNumber, setModSenderNumber] = useState("");
  const [modTrxId, setModTrxId] = useState("");
  const [modPaymentScreenshot, setModPaymentScreenshot] = useState("");
  const [modSuccess, setModSuccess] = useState(false);

  // Re-Enroll Checkout Modal State
  const [reEnrollModalCourseId, setReEnrollModalCourseId] = useState<string | null>(null);

  // Support Ticket States
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const supabase = createClient();

  const loadData = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let prof: any = null;
    if (user) {
      setCurrentUser(user);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      prof = profileData;
      setProfile(prof);
    }

    const freshLocal = await fetchEnrollmentsFromDatabase();

    if (user) {
      const studentRecs = freshLocal.filter((e) => {
        if (e.student_id && e.student_id === user.id) return true;
        if (user.email && e.student_email && e.student_email.toLowerCase() === user.email.toLowerCase()) return true;
        if (prof?.phone && e.student_phone && (e.student_phone.includes(prof.phone) || prof.phone.includes(e.student_phone))) return true;
        return false;
      });

      setEnrollments(studentRecs);
    } else {
      setEnrollments([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeEnrollmentStore(() => {
      loadData();
    });
    return () => unsub();
  }, []);

  const handleModFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("পেমেন্ট রসিদ ফাইলের সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে।");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setModPaymentScreenshot(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResubmitModification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTargetRecord) return;
    if (!modSenderNumber.trim() || !modTrxId.trim()) {
      alert("অনুগ্রহ করে আপনার প্রেরক নম্বর ও ১২ ডিজিট TrxID প্রদান করুন।");
      return;
    }

    // PATCH the enrollment with updated payment info + reset status to pending for re-review
    try {
      await fetch("/api/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: modTargetRecord.id,
          status: "pending",
          admin_note: "",
          sender_number: modSenderNumber,
          trx_id: modTrxId,
          payment_screenshot: modPaymentScreenshot,
        }),
      });
    } catch (err) {
      console.warn("Resubmit modification PATCH error:", err);
    }

    setModSuccess(true);
    setTimeout(() => {
      setModSuccess(false);
      setModTargetRecord(null);
    }, 2500);
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const newTicket = {
      id: Date.now().toString(),
      subject: ticketSubject,
      description: ticketDesc,
      status: "open",
      created_at: "আজ",
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);

    if (user) {
      try {
        localStorage.setItem(`durbar_tickets_${user.id}`, JSON.stringify(updated));
      } catch {}
    }

    setTicketSuccess(true);
    setTicketSubject("");
    setTicketDesc("");

    setTimeout(() => setTicketSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar role="student" activeTab="courses" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              my enrolled courses & mentor desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-[#F59E0B]" />
              <span>আমার কোর্সসমূহ ({enrollments.length}টি)</span>
            </h1>
            <p className="text-xs text-slate-300">
              আপনার ভর্তি হওয়া কোর্স কারিকুলাম, পেমেন্ট যাঁচাই স্ট্যাটাস এবং ১-অন-১ মেন্টর সহায়তা টিকিট ডেস্ক।
            </p>
          </div>
          <DashboardHeader role="student" />
        </div>

        {/* Courses Content Grid */}
        {isLoading ? (
          <ProgressLoader label="ডাটাবেজ থেকে ভর্তি তথ্য লোড করা হচ্ছে..." />
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((record) => {
              const isApproved = record.status === "approved" || (record.status as any) === "active";
              const isPending = record.status === "pending";
              const isRejected = record.status === "rejected";
              const isModNeeded = record.status === "modification_needed";

              return (
                <div
                  key={record.id}
                  className={`bg-[#0D2038] border rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all shadow-xl ${
                    isApproved
                      ? "border-emerald-500/40 hover:border-emerald-400"
                      : isPending
                      ? "border-amber-500/40"
                      : isModNeeded
                      ? "border-sky-500/50"
                      : "border-red-500/40"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Course Title & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                          {record.course_title}
                        </h2>
                        <p className="text-xs text-slate-300 mt-1">
                          শাখা: <strong className="text-amber-400 font-bold capitalize">{record.branch}</strong> • ফি: ৳{record.course_price?.toLocaleString("bn-BD") || "৮,৫০০"}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-3 py-1 rounded-full shrink-0 ${
                          isApproved
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isPending
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : isModNeeded
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 animate-pulse"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {isApproved
                          ? "✅ ভর্তি অনুমোদিত"
                          : isPending
                          ? "⏳ পেমেন্ট যাঁচাইাধীন"
                          : isModNeeded
                          ? "⚠️ তথ্য সংশোধন প্রয়োজন"
                          : "❌ আবেদন বাতিল"}
                      </span>
                    </div>

                    {/* Status Alert Banners based on Admin Action */}
                    {isPending && (
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3.5 rounded-2xl text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>ভর্তি আবেদন পর্যবেক্ষণাধীন রয়েছে (Pending Approval)</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          আপনার পেমেন্ট (TrxID: <strong className="font-mono text-amber-400">{record.trx_id}</strong>) যাচাই করা হচ্ছে। অ্যাডমিন প্যানেল থেকে অনুমোদনের পর ২৪ ঘণ্টার মধ্যে ক্লাস এক্সেস চালু হবে।
                        </p>
                      </div>
                    )}

                    {isRejected && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3.5 rounded-2xl text-xs space-y-1.5">
                        <div className="font-bold flex items-center gap-1.5 text-red-400">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>আপনার ভর্তি আবেদনটি বাতিল করা হয়েছে</span>
                        </div>
                        {record.admin_note && (
                          <p className="text-[11px] text-slate-200 bg-red-950/40 p-2.5 rounded-xl border border-red-500/20">
                            <strong>বাতিলের কারণ:</strong> {record.admin_note}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          ভুল TrxID বা পেমেন্ট ট্রানজেকশনের কারণে বাতিল হয়ে থাকলে নিচে বোতামে চেপে পুনরায় আবেদন করতে পারবেন।
                        </p>
                      </div>
                    )}

                    {isModNeeded && (
                      <div className="bg-sky-500/10 border border-sky-500/30 text-sky-300 p-3.5 rounded-2xl text-xs space-y-2">
                        <div className="font-bold flex items-center gap-1.5 text-sky-400">
                          <Edit className="w-4 h-4 shrink-0" />
                          <span>আপনার ভর্তি আবেদনে তথ্য সংশোধন প্রয়োজন</span>
                        </div>
                        {record.admin_note && (
                          <p className="text-[11px] text-slate-200 bg-sky-950/40 p-2.5 rounded-xl border border-sky-500/20">
                            <strong>অ্যাডমিন নির্দেশনা:</strong> {record.admin_note}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Course Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-[#07182E] p-3 rounded-2xl border border-white/5 flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-[#F59E0B] shrink-0" />
                        <span>পেমেন্ট নম্বর: <strong className="font-mono text-white">{record.sender_number}</strong></span>
                      </div>
                      <div className="bg-[#07182E] p-3 rounded-2xl border border-white/5 flex items-center gap-2 text-slate-300">
                        <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>TrxID: <strong className="font-mono text-white">{record.trx_id}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 font-mono">ID: {record.id.slice(0, 10)}</span>

                    {isApproved ? (
                      <Link
                        href={`/student/courses/${record.course_id}`}
                        className="px-6 py-3 text-xs font-extrabold text-black bg-gradient-to-r from-[#F59E0B] to-[#FACC15] rounded-xl hover:scale-105 transition-all shadow-lg gold-glow flex items-center gap-2"
                      >
                        <span>ক্লাসে প্রবেশ করুন</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : isPending ? (
                      <button
                        disabled
                        className="px-5 py-2.5 text-xs font-bold text-slate-400 bg-white/5 rounded-xl border border-white/10 cursor-not-allowed flex items-center gap-2"
                        title="অ্যাডমিন প্যানেল থেকে অনুমোদন শেষ হলে ক্লাস এক্সেস সক্রিয় হবে"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>অনুমোদনের অপেক্ষায়</span>
                      </button>
                    ) : isModNeeded ? (
                      <Link
                        href={`/checkout?courseId=${record.course_id}&editEnrollmentId=${record.id}`}
                        className="px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 rounded-xl shadow-lg transition-all flex items-center gap-2 animate-bounce-subtle"
                      >
                        <Edit className="w-4 h-4" />
                        <span>তথ্য সংশোধন করুন →</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/checkout?courseId=${record.course_id}`}
                        className="px-5 py-2.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg transition-all flex items-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>পুনরায় ভর্তি আবেদন করুন</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-12 text-center space-y-5 shadow-2xl max-w-2xl mx-auto my-4">
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

        {/* ------------------------------------------------------------- */}
        {/* Integrated 1-on-1 Mentor Support Ticket Section */}
        {/* ------------------------------------------------------------- */}
        <section id="tickets" className="space-y-6 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-[#F59E0B]" />
                <span>১-অন-১ মেন্টর সহায়তা টিকিট ডেস্ক</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                কোর্সের যেকোনো অধ্যায়ের ম্যাথ, আইকিউ বা ফিজিক্স সমস্যার সমাধান পেতে নিচে আপনার সহায়তার টিকিট জমা দিন।
              </p>
            </div>
            <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-[#F59E0B]/10 text-[#FACC15] border border-[#F59E0B]/30 shrink-0">
              মেন্টর হেল্পডেস্ক
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* New Ticket Builder Form */}
            <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#F59E0B]" />
                  <span>নতুন সাপোর্ট টিকিট জমা দিন</span>
                </h3>
              </div>

              {ticketSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>সহায়তা টিকিটটি সফলভাবে জমা দেওয়া হয়েছে!</span>
                </div>
              )}

              <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">সমস্যার বিষয় (Subject):*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ভেক্টর অধ্যায় ৩ ম্যাথ সমাধান লিঙ্ক"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">বিস্তারিত সমস্যা বা লিঙ্ক:*</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="আপনার সমস্যাটি বিস্তারিত ব্যাখ্যা করুন অথবা গুগল ড্রাইভ/ডক লিঙ্ক প্রদান করুন..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] text-black font-bold text-xs rounded-xl shadow-lg gold-glow hover:scale-[1.01] transition-all"
                >
                  টিকিট জমা দিন
                </button>
              </form>
            </div>

            {/* Active & Past Tickets List */}
            <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                    <span>আমার খতিয়ান টিকিটসমূহ ({tickets.length}টি)</span>
                  </h3>
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
                    মেন্টর ডেস্ক
                  </span>
                </div>

                <div className="space-y-3">
                  {tickets.length > 0 ? (
                    tickets.map((t) => (
                      <div
                        key={t.id}
                        className="bg-[#07182E] p-4 rounded-2xl border border-white/5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white leading-snug">{t.subject}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize shrink-0 ${
                              t.status === "open"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {t.status === "open" ? "অপেক্ষমান" : "সমাধান করা হয়েছে"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>জমা দেওয়ার সময়: {t.created_at}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-400 py-8">
                      আপনার কোনো খতিয়ান টিকিট নেই।
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#07182E] border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                💡 <strong>পরামর্শ:</strong> দ্রুত সমাধানের জন্য আপনার ফেসবুক আইডি বা ফোন নম্বর পোস্টে যুক্ত রাখুন।
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* STUDENT ENROLLMENT MODIFICATION FORM MODAL */}
        {/* ------------------------------------------------------------- */}
        {modTargetRecord && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0D2038] border border-white/15 rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl relative">
              <button
                onClick={() => setModTargetRecord(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-bold">
                  <Edit className="w-3.5 h-3.5" />
                  <span>ভর্তি তথ্য সংশোধন ও পুনর্প্রেরণ</span>
                </div>
                <h3 className="text-xl font-bold text-white">আবেদনের তথ্য আপডেট করুন</h3>
                <p className="text-xs text-slate-300">
                  কোর্স: <strong className="text-white">{modTargetRecord.course_title}</strong>
                </p>
              </div>

              {modTargetRecord.admin_note && (
                <div className="p-3 bg-[#07182E] rounded-xl border border-sky-500/30 text-xs text-sky-300">
                  <strong>অ্যাডমিন নির্দেশনা:</strong> {modTargetRecord.admin_note}
                </div>
              )}

              {modSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>আপনার তথ্য সফলভাবে পুনর্প্রেরণ করা হয়েছে! অ্যাডমিন পর্যালোচনা করছে।</span>
                </div>
              )}

              <form onSubmit={handleResubmitModification} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">প্রেরক মোবাইল/ব্যাংক নম্বর:*</label>
                  <input
                    type="tel"
                    required
                    placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                    value={modSenderNumber}
                    onChange={(e) => setModSenderNumber(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white focus:border-[#F59E0B] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">পেমেন্ট ট্রানজেকশন আইডি (TrxID):*</label>
                  <input
                    type="text"
                    required
                    placeholder="১২ ডিজিটের TrxID"
                    value={modTrxId}
                    onChange={(e) => setModTrxId(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white font-mono focus:border-[#F59E0B] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">পেমেন্ট স্ক্রিনশট (আপডেট করুন):</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 bg-[#07182E] border border-dashed border-white/20 rounded-xl p-3 text-slate-300 cursor-pointer flex items-center justify-center gap-2 hover:border-[#F59E0B]">
                      <Upload className="w-4 h-4 text-[#F59E0B]" />
                      <span>{modPaymentScreenshot ? "ছবি পরিবর্তন করুন" : "নতুন রসিদ আপলোড করুন"}</span>
                      <input type="file" accept="image/*" onChange={handleModFileChange} className="hidden" />
                    </label>
                    {modPaymentScreenshot && (
                      <div className="w-12 h-12 rounded-xl border border-white/20 overflow-hidden relative shrink-0">
                        <img src={modPaymentScreenshot} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModTargetRecord(null)}
                    className="w-1/2 py-3 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 bg-gradient-to-r from-[#F59E0B] to-[#FACC15] text-black font-black rounded-xl hover:scale-[1.01] transition-all shadow-lg"
                  >
                    সংশোধিত তথ্য জমা দিন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* RE-ENROLL CHECKOUT MODAL */}
        {/* ------------------------------------------------------------- */}
        {reEnrollModalCourseId && (
          <RegistrationModal
            initialCourseId={reEnrollModalCourseId}
            onClose={() => setReEnrollModalCourseId(null)}
          />
        )}
      </main>
    </div>
  );
}
