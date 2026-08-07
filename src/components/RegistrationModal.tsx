"use client";

import { useState, useEffect } from "react";
import { COURSES } from "@/data/courses";
import { getStoredCourses } from "@/utils/courseStore";
import { X, CheckCircle2, ShieldCheck, CreditCard, Sparkles, PhoneCall, Copy, Check, Info, Upload, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  getStoredPaymentDetails,
  subscribePaymentDetailsStore,
  syncPaymentDetailsFromSupabase,
  fetchPaymentDetailsFromDatabase,
  PaymentDetail,
} from "@/utils/paymentDetailStore";
import { submitEnrollmentRequest } from "@/utils/enrollmentStore";

interface RegistrationModalProps {
  initialCourseId?: string;
  onClose: () => void;
}

export default function RegistrationModal({ initialCourseId, onClose }: RegistrationModalProps) {
  const [courses, setCourses] = useState<any[]>(getStoredCourses());
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

  const [paymentDetailsList, setPaymentDetailsList] = useState<PaymentDetail[]>(getStoredPaymentDetails());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("online");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const localCourses = getStoredCourses();
        // Fetch courses
        const { data: dbCourses } = await supabase
          .from("courses")
          .select("*")
          .order("title");

        if (dbCourses && dbCourses.length > 0) {
          setCourses(
            dbCourses.map((c) => {
              let extraData: any = {};
              if (c.description && c.description.startsWith("{")) {
                try { extraData = JSON.parse(c.description); } catch (e) {}
              }
              const localMatch = localCourses.find((lc) => lc.id === c.id || (lc as any).slug === c.slug);
              return {
                id: c.id,
                title: c.title,
                price: Number(c.price),
                slug: c.slug,
                courseMode: extraData.courseMode || localMatch?.courseMode || "both",
              };
            })
          );
        } else {
          setCourses(localCourses);
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

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0] || COURSES[0];
  const courseMode = selectedCourse?.courseMode || "both";

  const visibleBranches = branches.filter((b) => {
    if (courseMode === "online") return b.id === "online";
    if (courseMode === "offline") return b.id !== "online";
    return true;
  });

  // Set default branch when visibleBranches change
  useEffect(() => {
    if (visibleBranches.length > 0 && !visibleBranches.some((b) => b.id === branch)) {
      setBranch(visibleBranches[0].id);
    }
  }, [visibleBranches, branch]);

  useEffect(() => {
    async function loadPaymentDetailsFromDb() {
      const items = await fetchPaymentDetailsFromDatabase();
      if (items) {
        setPaymentDetailsList(items);
      }
    }

    loadPaymentDetailsFromDb();

    // Subscribe to Postgres Realtime changes on payment_details table directly from Supabase
    const channel = supabase
      .channel("payment_details_db_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_details" }, () => {
        loadPaymentDetailsFromDb();
      })
      .subscribe();

    const unsubStore = subscribePaymentDetailsStore(() => {
      loadPaymentDetailsFromDb();
    });

    return () => {
      supabase.removeChannel(channel);
      unsubStore();
    };
  }, []);

  const handleCopyText = (id: string, textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeAccountsForSelectedMethod = paymentDetailsList.filter((p) => {
    if (!p.is_active) return false;
    if (paymentMethod === "bkash") return p.method_type === "bkash";
    if (paymentMethod === "nagad") return p.method_type === "nagad";
    if (paymentMethod === "card" || paymentMethod === "bank") return p.method_type === "bank";
    return p.method_type === paymentMethod;
  });

  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethods.some((p) => p.id === paymentMethod)) {
      setPaymentMethod(paymentMethods[0].id);
    }
  }, [paymentMethods]);

  const handleScreenshotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("পেমেন্ট রসিদ ফাইলের সাইজ সর্বোচ্চ ১০ মেগাবাইট (10MB) হতে পারবে।");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.75);
          setPaymentScreenshot(compressed);
        } else {
          setPaymentScreenshot(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বর প্রদান করুন।");
      return;
    }
    if (!trxId.trim()) {
      alert("অনুগ্রহ করে আপনার পেমেন্ট ট্রানজেকশন আইডি (TrxID) প্রদান করুন।");
      return;
    }
    if (!senderNumber.trim()) {
      alert("অনুগ্রহ করে যে নম্বর থেকে ফি পাঠিয়েছেন (প্রেরক মোবাইল/ব্যাংক নম্বর) তা উল্লেখ করুন।");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const studentId = user?.id || `guest-${Date.now()}`;

    const newReq = await submitEnrollmentRequest({
      student_id: studentId,
      student_email: user?.email || "",
      course_id: selectedCourse.id,
      course_title: selectedCourse.title,
      course_price: selectedCourse.price,
      student_name: name,
      student_phone: phone,
      college: college,
      branch: branch,
      payment_method: paymentMethod,
      sender_number: senderNumber,
      trx_id: trxId,
      payment_screenshot: paymentScreenshot,
    });

    setTrackingId(newReq.id);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="registration-modal-card bg-[#0D2038] border border-white/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">পছন্দের শাখা / প্ল্যাটফর্ম:</label>
                <span className="text-[10px] text-amber-400 font-bold">
                  {courseMode === "online" ? "🌐 শুধুমাত্র অনলাইন" : courseMode === "offline" ? "🏫 শুধুমাত্র অফলাইন" : "🌐 অনলাইন ও 🏫 অফলাইন"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {visibleBranches.map((b) => (
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

            {/* Dynamic Payment Details Display Box */}
            {activeAccountsForSelectedMethod.length > 0 ? (
              <div className="space-y-2 bg-[#07182E] p-3.5 rounded-2xl border border-[#F59E0B]/30 shadow-inner">
                <span className="text-[10px] font-bold text-[#FACC15] uppercase tracking-wider block">
                  অফিসিয়াল পেমেন্ট অ্যাকাউন্ট তথ্য (Send Fee Here):
                </span>
                <div className="space-y-2.5">
                  {activeAccountsForSelectedMethod.map((acc) => (
                    <div key={acc.id} className="p-3 bg-[#0D2038] rounded-xl border border-white/10 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{acc.title}</span>
                          {acc.account_type && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#F59E0B]/20 text-[#F59E0B] capitalize">
                              {acc.account_type === "personal"
                                ? "পার্সোনাল"
                                : acc.account_type === "agent"
                                ? "এজেন্ট"
                                : acc.account_type === "merchant"
                                ? "মার্চেন্ট / পেমেন্ট"
                                : "ব্যাংক"}
                            </span>
                          )}
                        </div>

                        {/* Copy button */}
                        {(acc.mobile_number || acc.account_number) && (
                          <button
                            type="button"
                            onClick={() => handleCopyText(acc.id, acc.mobile_number || acc.account_number || "")}
                            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all shrink-0"
                          >
                            {copiedId === acc.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">কপি হয়েছে!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#F59E0B]" />
                                <span>কপি করুন</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {acc.method_type === "bank" ? (
                        <div className="space-y-1 text-[11px] text-slate-300">
                          <div>ব্যাংক: <strong className="text-white">{acc.bank_name}</strong></div>
                          <div>হিসাবধারীর নাম: <strong className="text-[#F59E0B]">{acc.account_holder_name}</strong></div>
                          <div>হিসাব নম্বর: <strong className="text-white font-mono">{acc.account_number}</strong></div>
                          <div>শাখা ও জেলা: <span className="text-slate-300">{acc.branch_name ? `${acc.branch_name}, ${acc.district || ""}` : acc.district || ""}</span></div>
                          {acc.routing_number && <div>রাউটিং নম্বর: <strong className="text-emerald-400 font-mono">{acc.routing_number}</strong></div>}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-slate-400 text-[11px]">পেমেন্ট নম্বর:</span>
                          <span className="text-base font-black font-mono text-[#F59E0B]">
                            {acc.mobile_number}
                          </span>
                        </div>
                      )}

                      {acc.instructions && (
                        <p className="text-[10px] text-slate-400 border-t border-white/5 pt-1 mt-1 leading-relaxed">
                          💡 {acc.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#07182E] p-3 rounded-xl border border-white/10 text-center text-xs text-slate-400">
                এই পেমেন্ট মেথডের জন্য সক্রিয় কোনো নম্বর পাওয়া যায়নি। সহায়তার জন্য ১৬৮৯৯ কল করুন।
              </div>
            )}

            {/* Sender Number & Transaction ID Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  প্রেরক মোবাইল/ব্যাংক নম্বর:*
                </label>
                <input
                  type="tel"
                  required
                  placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-[#F59E0B] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  পেমেন্ট ট্রানজেকশন আইডি (TrxID):*
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 9J8A7B6C5D"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-[#F59E0B] outline-none"
                />
              </div>
            </div>

            {/* Payment Screenshot Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>পেমেন্ট রসিদ / স্ক্রিনশট (অপশনাল):</span>
                <span className="text-[10px] text-slate-400">মেগাবাইট সর্বোচ্চ ৫MB</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 bg-[#07182E] border border-dashed border-white/20 hover:border-[#F59E0B] rounded-xl p-3 text-xs text-slate-300 cursor-pointer flex items-center justify-center gap-2 transition-all">
                  <Upload className="w-4 h-4 text-[#F59E0B]" />
                  <span>{paymentScreenshot ? "ছবি পরিবর্তন করুন" : "পেমেন্ট স্ক্রিনশট আপলোড করুন"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotFileChange}
                    className="hidden"
                  />
                </label>
                {paymentScreenshot && (
                  <div className="w-10 h-10 rounded-xl border border-white/20 overflow-hidden relative shrink-0">
                    <img src={paymentScreenshot} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
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
                className="w-full py-3.5 text-xs font-extrabold text-black bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] rounded-xl shadow-lg gold-glow hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                ভর্তি নিশ্চিত ও আবেদন জমা দিন
              </button>
            </div>
          </form>
        ) : (
          /* Thank You Admission Pop-up Modal */
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white leading-tight">
                ভর্তি আবেদনের জন্য ধন্যবাদ!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                আমাদের অ্যাডমিন প্যানেল থেকে আপনার পেমেন্ট ট্রানজেকশন যাঁচাই করে <strong className="text-[#FACC15]">আগামী ২৪ ঘণ্টার মধ্যে</strong> ভর্তি নিশ্চিত করা হবে এবং আপনাকে নোটিফিকেশনের মাধ্যমে জানানো হবে।
              </p>
            </div>

            <div className="bg-[#07182E] p-4 rounded-2xl border border-white/10 text-xs space-y-2.5 text-left max-w-md mx-auto">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">আবেদন ট্র্যাকিং নম্বর:</span>
                <span className="text-[#F59E0B] font-extrabold font-mono">{trackingId}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">মনোনীত কোর্স:</span>
                <span className="text-white font-bold">{selectedCourse.title}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">প্রেরক নম্বর & TrxID:</span>
                <span className="text-amber-300 font-bold font-mono">{senderNumber} ({trxId})</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">আবেদনের স্ট্যাটাস:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  ⏳ পর্যবেক্ষণাধীন (Pending Admin Review)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-300 bg-white/5 p-3 rounded-xl">
              <PhoneCall className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>জরুরি প্রয়োজনে হেল্পলাইন: ১৬৮৯৯ (সকাল ৯টা - রাত ১০টা)</span>
            </div>

            <button
              onClick={() => {
                onClose();
                window.location.href = "/student/dashboard";
              }}
              className="w-full py-3.5 text-xs font-black text-black bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] rounded-xl shadow-lg hover:scale-[1.01] transition-all"
            >
              ড্যাশবোর্ডে প্রবেশ করুন
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
