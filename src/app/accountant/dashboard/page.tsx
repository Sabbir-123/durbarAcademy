"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { createClient } from "@/utils/supabase/client";
import { Coins, TrendingUp, CreditCard, CheckCircle, XCircle, ArrowUpRight, BarChart2 } from "lucide-react";

export default function AccountantDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [totalRevenue, setTotalRevenue] = useState(184000);
  const [pendingExpenses, setPendingExpenses] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  
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

      // Seed Expense requests fallback
      setPendingExpenses([
        { id: "e1", requested_by: "ড. সাজ্জাদ হোসেন", amount: 1500, description: "পদার্থবিজ্ঞান প্রশ্নব্যাংক কুরিয়ার খরচ", status: "pending" },
        { id: "e2", requested_by: "ইঞ্জি. সাকিব আহমেদ", amount: 4500, description: "১-অন-১ লাইভ সলভ সফটওয়্যার প্রিমিয়াম সাবস্ক্রিপশন", status: "pending" },
      ]);

      // Seed Inflow/Outflow transactions fallback
      setTransactions([
        { id: "tx1", type: "income", source: "বুয়েট অ্যাডমিশন স্পেশাল ভর্তি ফি", amount: 9500, date: "আজ" },
        { id: "tx2", type: "expense", source: "সার্ভার ও হোস্টিং রিনিউয়াল বিল", amount: 12000, date: "আজ" },
        { id: "tx3", type: "income", source: "মেডিকেল ভর্তি মাস্টারক্লাস ভর্তি ফি", amount: 8900, date: "গতকাল" },
      ]);

      // Seed Budget categories fallback
      setBudgets([
        { category: "স্টাফ স্যালারি ও মেন্টর ফি", allocated: 120000, spent: 85000 },
        { category: "মার্কেটিং ও বুস্টিং খরচ", allocated: 45000, spent: 32000 },
        { category: "প্রিন্টিং ও কুরিয়ার বিতরণ", allocated: 25000, spent: 14000 },
      ]);
    }
    loadData();
  }, []);

  const handleExpenseAction = (id: string, action: "approved" | "rejected") => {
    alert(`ব্যয় রিকুইজিশন ${id} ${action === "approved" ? "অনুমোদিত" : "বাতিল"} করা হয়েছে।`);
    setPendingExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar role="accountant" activeTab="dashboard" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        
        {/* Top Welcomer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              finance & accounts
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              স্বাগতম, {profile?.full_name || "অ্যাকাউন্ট্যান্ট"}!
            </h1>
            <p className="text-xs text-slate-300">
              দুর্বার একাডেমির আয়-ব্যয় বিবরণী, বেতন এবং বাজেট বরাদ্দকরণ প্যানেল।
            </p>
          </div>
        </div>

        {/* Overview Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-emerald-400 block">৳{totalRevenue.toLocaleString("bn-BD")}</span>
              <span className="text-xs text-slate-300">মোট সঞ্চিত আয়</span>
            </div>
            <Coins className="w-8 h-8 text-emerald-400 opacity-40" />
          </div>

          <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-[#F59E0B] block">{pendingExpenses.length} টি</span>
              <span className="text-xs text-slate-300">পেন্ডিং ব্যয় রিকুইজিশন</span>
            </div>
            <TrendingUp className="w-8 h-8 text-[#F59E0B] opacity-40" />
          </div>

          <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-white block">৳১,৯০,০০০</span>
              <span className="text-xs text-slate-300">বাজেট বরাদ্দ লিমিট</span>
            </div>
            <BarChart2 className="w-8 h-8 text-slate-400 opacity-40" />
          </div>
        </div>

        {/* Financial Budget allocations progress */}
        <section id="budget" className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#F59E0B]" />
            <span>চলতি মাসের বিভাগীয় বাজেট লিমিট</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {budgets.map((b, idx) => {
              const pct = Math.round((b.spent / b.allocated) * 100);

              return (
                <div key={idx} className="bg-[#0D2038] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-white block leading-snug">{b.category}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      বরাদ্দ: ৳{b.allocated.toLocaleString("bn-BD")} | ব্যয়িত: ৳{b.spent.toLocaleString("bn-BD")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-[#07182E] rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-[#F59E0B] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 block">{pct}% ব্যবহৃত</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Actionable Requisitions Queue */}
          <section className="lg:col-span-7 bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FACC15]" />
              <span>অনুমোদনহীন ব্যয়ের আবেদনসমূহ (রিকুইজিশন)</span>
            </h3>

            {pendingExpenses.length === 0 ? (
              <div className="text-xs text-slate-400 italic">অনুমোদনের জন্য কোনো রিকুইজিশন পেন্ডিং নেই।</div>
            ) : (
              <div className="space-y-3">
                {pendingExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-[#07182E] p-4 rounded-xl border border-white/5 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-white block">{exp.description}</span>
                      <span className="text-slate-400 block">আবেদনকারী: {exp.requested_by} | পরিমাণ: ৳{exp.amount}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExpenseAction(exp.id, "approved")}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExpenseAction(exp.id, "rejected")}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Inflow/Outflow ledger */}
          <section id="reports" className="lg:col-span-5 bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#F59E0B]" />
              <span>সাম্প্রতিক লেনদেন লেজার</span>
            </h3>

            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-[#07182E] p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{tx.source}</span>
                    <span className="text-[10px] text-slate-400 block">{tx.date}</span>
                  </div>
                  <span className={`font-bold flex items-center gap-0.5 ${
                    tx.type === "income" ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {tx.type === "income" ? "+" : "-"} ৳{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>

      </main>
    </div>
  );
}
