"use client";

import { useState, useEffect } from "react";
import { COURSES } from "@/data/courses";
import { X, CheckCircle2, ShieldCheck, CreditCard, Sparkles, PhoneCall } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface RegistrationModalProps {
  initialCourseId?: string;
  onClose: () => void;
}

export default function RegistrationModal({ initialCourseId, onClose }: RegistrationModalProps) {
  const [courses, setCourses] = useState<any[]>(COURSES);
  const [branches, setBranches] = useState<any[]>([
    { id: "online", label: "অনলাইন" },
    { id: "dhaka", label: "ঢাকা শাখা" },
    { id: "chattogram", label: "চট্টগ্রাম শাখা" },
    { id: "rajshahi", label: "রাজশাহী শাখা" },
  ]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([
    { id: "bkash", label: "bKash (বিকাশ)" },
    { id: "nagad", label: "Nagad (নগদ)" },
    { id: "card", label: "কার্ড / ব্যাংক" },
  ]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("online");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch courses
        const { data: dbCourses } = await supabase
          .from("courses")
          .select("*")
          .order("title");

        if (dbCourses && dbCourses.length > 0) {
          setCourses(
            dbCourses.map((c) => ({
              id: c.id,
              title: c.title,
              price: Number(c.price),
              slug: c.slug,
            }))
          );
        }

        // Fetch branches
        const { data: dbBranches } = await supabase
          .from("admission_branches")
          .select("*")
          .order("created_at");

        if (dbBranches && dbBranches.length > 0) {
          setBranches(
            dbBranches.map((b) => ({
              id: b.name,
              label: b.label,
            }))
          );
        }

        // Fetch payment methods
        const { data: dbPayments } = await supabase
          .from("admission_payment_methods")
          .select("*")
          .order("created_at");

        if (dbPayments && dbPayments.length > 0) {
          setPaymentMethods(
            dbPayments.map((p) => ({
              id: p.name,
              label: p.label,
            }))
          );
        }
      } catch (err) {
        console.error("Error loading dynamic admission settings, using static fallbacks:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Update selectedCourseId once courses are loaded or if initialCourseId changes
  useEffect(() => {
    if (courses.length > 0) {
      const match = courses.find((c) => c.id === initialCourseId || c.slug === initialCourseId);
      if (match) {
        setSelectedCourseId(match.id);
      } else if (!selectedCourseId) {
        setSelectedCourseId(courses[0].id);
      }
    }
  }, [courses, initialCourseId]);

  // Set default branch and payment method once loaded
  useEffect(() => {
    if (branches.length > 0 && !branches.some((b) => b.id === branch)) {
      setBranch(branches[0].id);
    }
  }, [branches]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethods.some((p) => p.id === paymentMethod)) {
      setPaymentMethod(paymentMethods[0].id);
    }
  }, [paymentMethods]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0] || COURSES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বর প্রদান করুন।");
      return;
    }
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0D2038] border border-white/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="space-y-1 pr-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>দুর্বার একাডেমি ভর্তি পোর্টাল</span>
              </div>
              <h3 className="text-xl font-bold text-white">ভর্তি ফর্ম ও আসন বুকিং</h3>
              <p className="text-xs text-slate-300">
                তথ্য প্রদান করে এখনই তোমার কাঙ্ক্ষিত ব্যাচে আসন নিশ্চিত করো।
              </p>
            </div>

            {/* Course Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">পছন্দের কোর্স নির্বাচন করুন:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#F59E0B] outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — (৳{c.price.toLocaleString("bn-BD")})
                  </option>
                ))}
              </select>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">শিক্ষার্থীর নাম:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-[#F59E0B] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">মোবাইল নম্বর:*</label>
                <input
                  type="tel"
                  required
                  placeholder="০১৭xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-[#F59E0B] outline-none"
                />
              </div>
            </div>

            {/* College */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">এইচএসসি কলেজ / প্রতিষ্ঠান:</label>
              <input
                type="text"
                placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-[#F59E0B] outline-none"
              />
            </div>

            {/* Branch Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">পছন্দের শাখা / প্ল্যাটফর্ম:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {branches.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => setBranch(b.id)}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      branch === b.id
                        ? "bg-[#F59E0B] text-black border-[#F59E0B]"
                        : "bg-[#07182E] border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">পেমেন্ট মেথড:</label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((pm) => (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      paymentMethod === pm.id
                        ? "bg-[#163255] border-[#F59E0B] text-[#F59E0B]"
                        : "bg-[#07182E] border-white/10 text-slate-400"
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Fee & Submit */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">মোট প্রদেয় কোর্স ফি:</span>
                <span className="text-xl font-extrabold text-white">
                  ৳{selectedCourse.price.toLocaleString("bn-BD")}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 text-xs font-bold text-black bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] rounded-xl shadow-lg gold-glow hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                আবেদন নিশ্চিত করুন ও ফি প্রদান করুন
              </button>
            </div>
          </form>
        ) : (
          /* Success Screen */
          <div className="text-center space-y-5 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white">ভর্তি আবেদন সফল হয়েছে!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                অভিনন্দন <span className="text-[#F59E0B] font-bold">{name}</span>! দুর্বার একাডেমি পরিবারের সাথে তোমার যাত্রা শুরু হতে চলেছে।
              </p>
            </div>

            <div className="bg-[#07182E] p-4 rounded-2xl border border-white/10 text-xs space-y-2 text-left max-w-md mx-auto">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">রেফারেন্স ট্র্যাকিং আইডি:</span>
                <span className="text-[#F59E0B] font-bold">DA-2026-8849</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">মনোনীত কোর্স:</span>
                <span className="text-white font-bold">{selectedCourse.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">শাখা:</span>
                <span className="text-emerald-400 font-bold capitalize">{branch}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <PhoneCall className="w-4 h-4 text-[#F59E0B]" />
              <span>আমাদের প্রতিনিধি ২ ঘণ্টার মধ্যে তোমাকে কল করবেন (১৬৮৯৯)।</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 text-xs font-bold text-black bg-[#F59E0B] rounded-xl hover:bg-[#FACC15]"
            >
              ড্যাশবোর্ডে ফিরে যান
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
