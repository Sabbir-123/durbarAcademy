"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressLoader from "@/components/ProgressLoader";
import { COURSES, Course } from "@/data/courses";
import { getStoredCourses } from "@/utils/courseStore";
import { createClient } from "@/utils/supabase/client";
import {
  getStoredPaymentDetails,
  subscribePaymentDetailsStore,
  fetchPaymentDetailsFromDatabase,
  PaymentDetail,
} from "@/utils/paymentDetailStore";
import { submitEnrollmentRequest } from "@/utils/enrollmentStore";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Clock,
  Award,
} from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseIdParam = searchParams.get("courseId") || searchParams.get("id") || "";

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
  const [email, setEmail] = useState("");
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  const editEnrollmentId = searchParams.get("editEnrollmentId") || "";
  const [adminNote, setAdminNote] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);

      // Check current user profile to prefill name, email & phone
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsLoggedIn(true);
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        setName(prof?.full_name || user.email?.split("@")[0] || "");
        setEmail(user.email || prof?.email || "");
        setPhone(prof?.phone || "");
        setCollege(prof?.college || "");
      }

      // Check if we are in Modification / Re-submission mode
      if (editEnrollmentId) {
        try {
          const { data: existingRec } = await supabase
            .from("enrollments")
            .select("*")
            .eq("id", editEnrollmentId)
            .maybeSingle();

          if (existingRec) {
            setIsEditMode(true);
            if (existingRec.student_name) setName(existingRec.student_name);
            if (existingRec.student_phone) setPhone(existingRec.student_phone);
            if (existingRec.college) setCollege(existingRec.college);
            if (existingRec.branch) setBranch(existingRec.branch);
            if (existingRec.payment_method) setPaymentMethod(existingRec.payment_method);
            if (existingRec.sender_number) setSenderNumber(existingRec.sender_number);
            if (existingRec.trx_id) setTrxId(existingRec.trx_id);
            if (existingRec.admin_note) setAdminNote(existingRec.admin_note);
            if (existingRec.course_id) setSelectedCourseId(existingRec.course_id);
          }
        } catch (err) {
          console.warn("Error loading editEnrollmentId:", err);
        }
      }

      // Fetch dynamic courses directly from DB
      try {
        const localCourses = getStoredCourses();
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

        // Fetch payment details directly from DB
        const items = await fetchPaymentDetailsFromDatabase();
        if (items) setPaymentDetailsList(items);
      } catch (err) {
        console.error("Error loading checkout settings:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();

    const unsubStore = subscribePaymentDetailsStore(() => {
      fetchPaymentDetailsFromDatabase().then((items) => {
        if (items) setPaymentDetailsList(items);
      });
    });

    return () => unsubStore();
  }, []);

  // Update selectedCourseId when courses load or url param changes
  useEffect(() => {
    if (courses.length > 0) {
      const match = courses.find((c) => c.id === courseIdParam || c.slug === courseIdParam);
      if (match) {
        setSelectedCourseId(match.id);
      } else if (!selectedCourseId) {
        setSelectedCourseId(courses[0].id);
      }
    }
  }, [courses, courseIdParam]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0] || COURSES[0];
  const courseMode = selectedCourse?.courseMode || "both";

  const visibleBranches = branches.filter((b) => {
    if (courseMode === "online") return b.id === "online";
    if (courseMode === "offline") return b.id !== "online";
    return true;
  });

  useEffect(() => {
    if (visibleBranches.length > 0 && !visibleBranches.some((b) => b.id === branch)) {
      setBranch(visibleBranches[0].id);
    }
  }, [visibleBranches, branch]);

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
      student_email: email || user?.email || "",
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#07182E] text-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <ProgressLoader label="দুর্বার একাডেমি এডমিশন চেকেআউট লোড হচ্ছে..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!isSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Course Summary & Guarantee Card */}
            <div className="lg:col-span-5 space-y-6">
              {isEditMode && adminNote && (
                <div className="bg-amber-500/15 border border-amber-500/40 rounded-3xl p-5 sm:p-6 space-y-2 text-amber-200 shadow-xl animate-bounce-subtle">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                    <Sparkles className="w-5 h-5" />
                    <span>⚠️ অ্যাডমিন নির্দেশনা অনুযায়ী সংশোধন</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-amber-950/60 p-3 rounded-2xl border border-amber-500/30">
                    <strong>নির্দেশনা:</strong> {adminNote}
                  </p>
                </div>
              )}

              <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl sticky top-24">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#FACC15] text-xs font-extrabold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>দুর্বার একাডেমি এডমিশন চেকেআউট</span>
                </div>

                <div className="space-y-2 border-b border-white/10 pb-5">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                    নির্বাচিত কোর্স:
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {selectedCourse.title}
                  </h1>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mt-1">
                    {courseMode === "online"
                      ? "🌐 অনলাইন ব্যাচ"
                      : courseMode === "offline"
                      ? "🏫 অফলাইন শাখা"
                      : "🌐 অনলাইন ও 🏫 অফলাইন শাখা"}
                  </span>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-b border-white/10 pb-5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>মূল কোর্স ফি:</span>
                    <span className="line-through text-slate-500">৳১২,০০০</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>বিশেষ অফার ডিসকাউন্ট:</span>
                    <span className="text-emerald-400 font-bold">-৳৩,৫০০</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-white/5">
                    <span className="text-white">সর্বমোট প্রদেয় টাকা:</span>
                    <span className="text-2xl font-extrabold text-[#F59E0B]">
                      ৳{selectedCourse.price?.toLocaleString("bn-BD") || "৮,৫০০"}
                    </span>
                  </div>
                </div>

                {/* Guarantee Features */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>সরাসরি সাবেক ডিফেন্স অফিসারদের গাইডলাইন</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>আইএসএসবি ও মেডিকেলের শতভাগ প্রি-কনফার্মেশন</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>২৪ ঘণ্টার মধ্যে ম্যানুয়াল পেমেন্ট যাঁচাই ও সক্রিয়করণ</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#07182E] border border-white/10 text-xs space-y-1">
                  <span className="text-amber-400 font-bold block">📞 হেল্পলাইন প্রয়োজন?</span>
                  <p className="text-slate-400">কল করুন: <strong>১৬৮৯৯</strong> (সকাল ৯টা - রাত ১০টা)</p>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Form */}
            <div className="lg:col-span-7 bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="space-y-1 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-extrabold text-white">ভর্তি আবেদন ও ফি প্রদান</h2>
                <p className="text-xs text-slate-300">
                  নিচে সঠিক তথ্য ও ট্রানজেকশন নম্বর প্রদান করে আপনার ভর্তি আবেদন চূড়ান্ত করুন।
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Select Course dropdown if changing */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">কোর্স পরিবর্তন করতে চান?</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#F59E0B] outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} — (৳{c.price?.toLocaleString("bn-BD")})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">শিক্ষার্থীর নাম:*</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: তানভীর আহমেদ"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:border-[#F59E0B] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">ইমেইল এড্রেস:*</label>
                    <input
                      type="email"
                      required
                      readOnly={isLoggedIn}
                      disabled={isLoggedIn}
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => !isLoggedIn && setEmail(e.target.value)}
                      className={`w-full border rounded-xl p-3.5 text-xs font-mono outline-none ${
                        isLoggedIn
                          ? "bg-[#07182E]/60 text-amber-400 border-white/10 cursor-not-allowed opacity-90"
                          : "bg-[#07182E] text-amber-400 border-white/10 focus:border-[#F59E0B]"
                      }`}
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
                      className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:border-[#F59E0B] outline-none"
                    />
                  </div>
                </div>

                {/* College / Institution */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">এইচএসসি কলেজ / প্রতিষ্ঠান:</label>
                  <input
                    type="text"
                    placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:border-[#F59E0B] outline-none"
                  />
                </div>

                {/* Branch Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">পছন্দের শাখা / প্ল্যাটফর্ম:*</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {visibleBranches.map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => setBranch(b.id)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                          branch === b.id
                            ? "bg-[#F59E0B] text-black border-[#F59E0B] shadow-md"
                            : "bg-[#07182E] border-white/10 text-slate-300 hover:text-white"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">পেমেন্ট মেথড নির্বাচন করুন:*</label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((pm) => (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`py-3 px-3 rounded-xl border text-xs font-extrabold text-center transition-all ${
                          paymentMethod === pm.id
                            ? "bg-[#163255] border-[#F59E0B] text-[#F59E0B] shadow-md"
                            : "bg-[#07182E] border-white/10 text-slate-400"
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Account Display Box */}
                {activeAccountsForSelectedMethod.length > 0 ? (
                  <div className="space-y-2 bg-[#07182E] p-4 rounded-2xl border border-[#F59E0B]/30 shadow-inner">
                    <span className="text-[10px] font-bold text-[#FACC15] uppercase tracking-wider block">
                      অফিসিয়াল পেমেন্ট অ্যাকাউন্ট তথ্য (Send Fee Here):
                    </span>
                    <div className="space-y-2.5">
                      {activeAccountsForSelectedMethod.map((acc) => (
                        <div key={acc.id} className="p-3.5 bg-[#0D2038] rounded-xl border border-white/10 space-y-1.5 text-xs">
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
                                    ? "মার্চেন্ট"
                                    : "ব্যাংক"}
                                </span>
                              )}
                            </div>

                            {(acc.mobile_number || acc.account_number) && (
                              <button
                                type="button"
                                onClick={() => handleCopyText(acc.id, acc.mobile_number || acc.account_number || "")}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all shrink-0"
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
                              <div>শাখা: <span className="text-slate-300">{acc.branch_name}</span></div>
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
                  <div className="bg-[#07182E] p-3.5 rounded-xl border border-white/10 text-center text-xs text-slate-400">
                    পেমেন্ট সংক্রান্ত সহায়তার জন্য ১৬৮৯৯ কল করুন।
                  </div>
                )}

                {/* Sender Number & TrxID */}
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
                      className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:border-[#F59E0B] outline-none"
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
                      className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3.5 text-xs text-white font-mono focus:border-[#F59E0B] outline-none"
                    />
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>পেমেন্ট রসিদ / স্ক্রিনশট (অপশনাল):</span>
                    <span className="text-[10px] text-slate-400">সর্বোচ্চ ৫MB</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 bg-[#07182E] border border-dashed border-white/20 hover:border-[#F59E0B] rounded-xl p-3.5 text-xs text-slate-300 cursor-pointer flex items-center justify-center gap-2 transition-all">
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
                      <div className="w-12 h-12 rounded-xl border border-white/20 overflow-hidden relative shrink-0">
                        <img src={paymentScreenshot} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-4 text-xs sm:text-sm font-black text-black bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] rounded-xl shadow-xl gold-glow hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  ভর্তি নিশ্চিত করুন ও আবেদন জমা দিন
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Success Screen on Page */
          <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto shadow-2xl my-8 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-2xl animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">ভর্তি আবেদনের জন্য ধন্যবাদ!</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                আমাদের অ্যাডমিন প্যানেল থেকে আপনার পেমেন্ট ট্রানজেকশন যাঁচাই করে <strong className="text-[#FACC15]">আগামী ২৪ ঘণ্টার মধ্যে</strong> ভর্তি নিশ্চিত করা হবে এবং আপনাকে নোটিফিকেশনের মাধ্যমে জানানো হবে।
              </p>
            </div>

            <div className="bg-[#07182E] p-5 rounded-2xl border border-white/10 text-xs space-y-3 text-left max-w-md mx-auto">
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">আবেদন ট্র্যাকিং নম্বর:</span>
                <span className="text-[#F59E0B] font-black font-mono">{trackingId}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">মনোনীত কোর্স:</span>
                <span className="text-white font-bold">{selectedCourse.title}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">প্রেরক নম্বর & TrxID:</span>
                <span className="text-amber-300 font-bold font-mono">{senderNumber} ({trxId})</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">আবেদনের স্ট্যাটাস:</span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  ⏳ পর্যবেক্ষণাধীন (Pending Admin Review)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-300 bg-white/5 p-3.5 rounded-2xl max-w-md mx-auto">
              <PhoneCall className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>জরুরি প্রয়োজনে হেল্পলাইন: ১৬৮৯৯ (সকাল ৯টা - রাত ১০টা)</span>
            </div>

            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 text-xs font-black text-black bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              <span>আমার ড্যাশবোর্ডে যান</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07182E] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold">চেকেআউট পেজ লোড হচ্ছে...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
