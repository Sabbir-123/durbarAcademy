"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationModal from "@/components/RegistrationModal";
import { motion, AnimatePresence } from "framer-motion";
import { Course } from "@/data/courses";
import { getCourseById, subscribeCoursesStore, syncCoursesFromSupabase } from "@/utils/courseStore";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  BookOpen,
  PlayCircle,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Calendar,
  Zap,
} from "lucide-react";

interface CourseDetailViewProps {
  courseId: string;
}

export default function CourseDetailView({ courseId }: CourseDetailViewProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "syllabus" | "instructors">("overview");
  const [openSyllabusIndex, setOpenSyllabusIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadCourse() {
      await syncCoursesFromSupabase();
      const found = getCourseById(courseId);
      if (found) setCourse(found);
    }
    loadCourse();

    const unsub = subscribeCoursesStore(() => {
      const updated = getCourseById(courseId);
      if (updated) setCourse(updated);
    });
    return () => unsub();
  }, [courseId]);

  if (!course) {
    return (
      <main className="min-h-screen bg-[#07182E] text-white flex flex-col justify-between">
        <Navbar onOpenRegisterModal={() => setIsRegisterModalOpen(true)} />
        <div className="text-center py-32 space-y-4">
          <h2 className="text-2xl font-bold">কোর্স পাওয়া যায়নি!</h2>
          <p className="text-slate-400 text-sm">সম্ভবত লিঙ্কটি ভুল অথবা কোর্সটি আর বিদ্যমান নেই।</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F59E0B] text-black text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল কোর্স দেখুন</span>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Extract YouTube embed URL if valid YouTube link
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
    }
    return url;
  };

  const embedUrl = getEmbedUrl(course.videoUrl);
  const layout = course.detailLayout || "standard";

  return (
    <main className="min-h-screen bg-[#07182E] text-white font-sans selection:bg-[#F59E0B] selection:text-black flex flex-col justify-between overflow-x-hidden">
      <div>
        <Navbar onOpenRegisterModal={() => setIsRegisterModalOpen(true)} />

        {/* Top Breadcrumb & Return Link */}
        <div className="pt-24 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/courses"
            className="course-detail-breadcrumb inline-flex items-center gap-2 text-xs text-slate-400 hover:text-[#F59E0B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সকল কোর্সসমূহে ফিরে যান</span>
          </Link>
        </div>

        {/* Customizable Layout Variant Header */}
        {layout === "video_hero" && embedUrl ? (
          /* Video-Focused Hero Layout */
          <section className="pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-7 space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{course.categoryLabel}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {course.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {course.tagline}
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300">
                  <span className="course-detail-inner-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E2038] border border-white/10">
                    <Clock className="w-4 h-4 text-[#F59E0B]" />
                    {course.duration}
                  </span>
                  <span className="course-detail-inner-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E2038] border border-white/10">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    {course.startDate}
                  </span>
                  <span className="course-detail-inner-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E2038] border border-white/10">
                    <Users className="w-4 h-4 text-amber-400" />
                    অবশিষ্ট সিট: {course.seatsRemaining}টি
                  </span>
                </div>
              </motion.div>

              {/* Video Player Container */}
              <motion.div
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5"
              >
                <div className="relative rounded-3xl overflow-hidden border border-[#F59E0B]/30 shadow-2xl bg-black aspect-video">
                  <iframe
                    src={embedUrl}
                    title={course.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            </div>
          </section>
        ) : (
          /* Standard Hero Header */
          <section className="pb-10 pt-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="course-detail-hero bg-gradient-to-r from-[#0B2347] via-[#0E2038] to-[#07182E] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-3xl space-y-4 relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-text text-xs font-bold px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
                    {course.categoryLabel}
                  </span>
                  {course.batchBadge && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-slate-200">
                      {course.batchBadge}
                    </span>
                  )}
                  {course.discountBadge && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white">
                      {course.discountBadge}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {course.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {course.tagline}
                </p>

                <div className="flex flex-wrap gap-4 pt-3 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#F59E0B]" />
                    <span>সময়সীমা: <strong>{course.duration}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>শুরু: <strong>{course.startDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>মোট সিট: <strong>{course.totalSeats}টি</strong> (খালি {course.seatsRemaining}টি)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* Main Details Body */}
        <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Content Area (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === "overview"
                      ? "course-detail-tab-active bg-[#F59E0B] text-black shadow-lg"
                      : "course-detail-tab-inactive bg-[#0E2038] text-slate-300 hover:text-white"
                  }`}
                >
                  কোর্স বিস্তারিত (Overview)
                </button>
                <button
                  onClick={() => setActiveTab("syllabus")}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === "syllabus"
                      ? "course-detail-tab-active bg-[#F59E0B] text-black shadow-lg"
                      : "course-detail-tab-inactive bg-[#0E2038] text-slate-300 hover:text-white"
                  }`}
                >
                  সিলেবাস ও লেকচার (Syllabus)
                </button>
                <button
                  onClick={() => setActiveTab("instructors")}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === "instructors"
                      ? "course-detail-tab-active bg-[#F59E0B] text-black shadow-lg"
                      : "course-detail-tab-inactive bg-[#0E2038] text-slate-300 hover:text-white"
                  }`}
                >
                  মেন্টর প্যানেল (Instructors)
                </button>
              </div>

              {/* TAB 1: OVERVIEW & CUSTOM SECTIONS */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Detailed Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.6 }}
                    className="course-detail-card bg-[#0E2038] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4"
                  >
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#F59E0B]" />
                      <span>কোর্স পরিচিতি ও রূপরেখা</span>
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {course.description || course.tagline}
                    </p>
                  </motion.div>

                  {/* Video Embed Section (If present and layout is not video_hero) */}
                  {layout !== "video_hero" && embedUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.6 }}
                      className="course-detail-card bg-[#0E2038] rounded-3xl p-6 border border-white/10 space-y-3"
                    >
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-[#F59E0B]" />
                        <span>কোর্স প্রিভিউ ভিডিও</span>
                      </h3>
                      <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-white/10">
                        <iframe
                          src={embedUrl}
                          title={course.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Key Features List */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.6 }}
                    className="course-detail-card bg-[#0E2038] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4"
                  >
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-400" />
                      <span>যা যা থাকছে এই কোর্সে</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {course.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="course-detail-inner-item flex items-start gap-3 p-3.5 rounded-2xl bg-[#07182E] border border-white/5 text-xs text-slate-200"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* TAB 2: SYLLABUS & CHAPTER BREAKDOWN */}
              {activeTab === "syllabus" && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className="course-detail-card bg-[#0E2038] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6"
                >
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#F59E0B]" />
                    <span>সিলেবাস ও অধ্যায়ভিত্তিক পাঠ্যসূচি</span>
                  </h3>

                  {course.syllabus && course.syllabus.length > 0 ? (
                    <div className="space-y-3">
                      {course.syllabus.map((chapter, idx) => {
                        const isOpen = openSyllabusIndex === idx;
                        return (
                          <div
                            key={idx}
                            className="course-detail-inner-item bg-[#07182E] rounded-2xl border border-white/10 overflow-hidden"
                          >
                            <button
                              onClick={() => setOpenSyllabusIndex(isOpen ? null : idx)}
                              className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-white hover:text-[#F59E0B] transition-colors"
                            >
                              <span>{chapter.title}</span>
                              {isOpen ? (
                                <ChevronUp className="w-4 h-4 text-[#F59E0B]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </button>

                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="px-4 pb-4 text-xs text-slate-300 space-y-2 border-t border-white/5 pt-3 flex items-center justify-between"
                                >
                                  <span>মোট লেকচার: {chapter.lectures} টি</span>
                                  <span>মোট এক্সাম: {chapter.exams} টি</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      এই কোর্সের সিলেবাস মেন্টরদের দ্বারা প্রতিনিয়ত আপডেট করা হচ্ছে। ভর্তির পর সম্পূর্ণ বই ও নোটস প্রদান করা হবে।
                    </p>
                  )}
                </motion.div>
              )}

              {/* TAB 3: INSTRUCTORS & MENTORS */}
              {activeTab === "instructors" && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className="course-detail-card bg-[#0E2038] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6"
                >
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#F59E0B]" />
                    <span>কোর্স মেন্টর ও ফ্যাকাল্টি প্যানেল</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {course.instructors.map((name, idx) => (
                      <div
                        key={idx}
                        className="course-detail-inner-item bg-[#07182E] p-4 rounded-2xl border border-white/10 flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#142C4B] flex items-center justify-center text-[#F59E0B] font-bold">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <strong className="text-white text-sm block">{name}</strong>
                          <span className="text-xs text-slate-400">অবসরপ্রাপ্ত ডিফেন্স অফিসার / মেন্টর</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Pricing Sidebar Card (4 Cols - From Right) */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="course-detail-sidebar bg-[#0E2038] rounded-3xl p-6 border border-white/15 space-y-6 shadow-2xl sticky top-28"
              >
                {/* Course Thumbnail Image */}
                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-800 border border-white/10">
                  <img
                    src={
                      course.imageUrl ||
                      "https://images.unsplash.com/photo-1519074069444-1ba4eff56022?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Price Display */}
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 block font-semibold">কোর্স রেজিস্ট্রেশন ফি:</span>
                  <div className="flex items-baseline gap-3">
                    <span className="price-main text-3xl font-black text-[#F59E0B]">
                      ৳{course.price.toLocaleString("bn-BD")}
                    </span>
                    {course.originalPrice > course.price && (
                      <span className="text-sm text-slate-400 line-through">
                        ৳{course.originalPrice.toLocaleString("bn-BD")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Seats Remaining Pill */}
                <div className="seats-box p-3 rounded-xl bg-[#07182E] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-300">অবশিষ্ট আসন সংখ্যা:</span>
                  <strong className="text-amber-400">{course.seatsRemaining}টি সিট খালি</strong>
                </div>

                {/* Action CTA Buttons */}
                <div className="space-y-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] text-black text-sm font-extrabold shadow-xl gold-glow hover:brightness-110 transition-all"
                  >
                    এখনই ভর্তি হোন
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      {isRegisterModalOpen && (
        <RegistrationModal
          initialCourseId={course.id}
          onClose={() => setIsRegisterModalOpen(false)}
        />
      )}
    </main>
  );
}
