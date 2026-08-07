"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import { HelpCircle, CheckCircle2, MessageSquare, Send, Clock } from "lucide-react";

export default function StudentTicketsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

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
      setProfile(prof);

      // Load initial tickets from local state or DB
      try {
        const raw = localStorage.getItem(`durbar_tickets_${user.id}`);
        if (raw) {
          setTickets(JSON.parse(raw));
        } else {
          setTickets([
            { id: "t1", subject: "পদার্থবিজ্ঞান ভেক্টর অধ্যায় ৩ গাণিতিক প্রশ্ন সমাধান", status: "open", created_at: "গতকাল" },
          ]);
        }
      } catch {
        setTickets([]);
      }
    }
    loadData();
  }, []);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
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
      <DashboardSidebar role="student" activeTab="tickets" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              1-on-1 mentor support
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <HelpCircle className="w-7 h-7 text-[#F59E0B]" />
              <span>সহায়তা টিকিট</span>
            </h1>
            <p className="text-xs text-slate-300">
              আপনার যেকোনো বিষয়ের গাণিতিক সমস্যা বা একাডেমিক প্রশ্নের জন্য সরাসরি মেন্টর সাপোর্ট টিকিট খুলুন।
            </p>
          </div>
          <DashboardHeader role="student" />
        </div>

        {/* Support Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Card */}
          <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-[#F59E0B]" />
                <span>নতুন সাপোর্ট টিকিট জমা দিন</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                বিষয় এবং প্রশ্নের বিস্তারিত লিখে সাবমিট করুন। আমাদের ইন্সট্রাক্টর দ্রুত সমাধান পাঠাবেন।
              </p>
            </div>

            {ticketSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>সহায়তা টিকিটটি সফলভাবে জমা দেওয়া হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">সমস্যার বিষয়:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: উচ্চতর গণিত ক্যালকুলাস অধ্যায় ৫ সমস্যা"
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
                  placeholder="আপনার গাণিতিক সমস্যাটি বিস্তারিত ব্যাখ্যা করুন অথবা ডক/ছবি লিঙ্ক প্রদান করুন..."
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
          </section>

          {/* Ticket History */}
          <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <span>আমার পূর্ববর্তী টিকিটসমূহ ({tickets.length}টি)</span>
                </h2>
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
                        <span>জমা দেওয়ার সময়: {t.created_at}</span>
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
              💡 <strong>পরামর্শ:</strong> দ্রুত সমাধানের জন্য আপনার ফেসবুক মেসেঞ্জার বা টেলিগ্রাম আইডি উল্লেখ করতে পারেন।
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
