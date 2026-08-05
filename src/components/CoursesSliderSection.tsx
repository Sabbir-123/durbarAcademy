"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Course } from "@/data/courses";
import { getStoredCourses, subscribeCoursesStore, syncCoursesFromSupabase } from "@/utils/courseStore";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Clock,
  UserCheck,
  CheckCircle2,
  PlayCircle,
  Loader2,
} from "lucide-react";

interface CoursesSliderSectionProps {
  onOpenRegisterModal: (courseId?: string) => void;
}

export default function CoursesSliderSection({
  onOpenRegisterModal,
}: CoursesSliderSectionProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Synchronously read local cache if available
    const cached = getStoredCourses().filter((c) => c.published !== false);
    if (cached.length > 0) {
      setCourses(cached);
      setIsLoading(false);
    }

    // 2. Sync from Supabase in background
    async function loadData() {
      try {
        const dbCourses = await syncCoursesFromSupabase();
        setCourses(dbCourses.filter((c) => c.published !== false));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // 3. Store change listener
    const unsubscribe = subscribeCoursesStore(() => {
      setCourses(getStoredCourses().filter((c) => c.published !== false));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = [
    { id: "all", label: "সব কোর্সসমূহ" },
    { id: "defense", label: "ডিফেন্স ও মিলিটারি (BAFA, BMA, BN, ISSB)" },
  ];

  const filteredCourses =
    activeCategory === "all"
      ? courses
      : courses.filter((c) => c.category === activeCategory);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  // Kinetic Motion Variants with explicitly typed spring transitions
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <section className="py-16 sm:py-20 relative bg-[#07182E] overflow-hidden border-t border-b border-white/5">
      {/* Background Kinetic Glowing Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-0 w-96 h-96 bg-[#F59E0B]/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
          y: [0, -40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-0 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-3xl pointer-events-none translate-x-1/2"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
          <div className="space-y-3 max-w-2xl">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ফ্ল্যাগশিপ ডিফেন্স ও মিলিটারি প্রোগ্রাম</span>
            </motion.div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              তোমার স্বপ্নের জন্য সঠিক{" "}
              <span className="gold-gradient-text">ডিফেন্স কোর্স বেছে নাও</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300">
              বাংলাদেশ বিমান বাহিনী, মিলিটারী একাডেমি, নৌবাহিনী ও আইএসএসবি (BAFA, BMA, BN, ISSB) প্রস্তুতির সেরা স্পেশাল প্রোগ্রামসমূহ।
            </p>
          </div>

          {/* Action Buttons & See All */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Slide Navigation Buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollLeft}
                aria-label="Scroll left"
                className="p-2.5 rounded-full bg-[#0E2038] hover:bg-[#F59E0B] hover:text-black border border-white/10 text-white transition-all shadow-md group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollRight}
                aria-label="Scroll right"
                className="p-2.5 rounded-full bg-[#0E2038] hover:bg-[#F59E0B] hover:text-black border border-white/10 text-white transition-all shadow-md group"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </div>

            {/* See All Courses Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black text-xs sm:text-sm font-bold shadow-lg hover:brightness-110 transition-all"
              >
                <span className="text-black font-extrabold">সকল কোর্স দেখুন</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeCategory === cat.id
                  ? "bg-[#F59E0B] text-black shadow-md font-bold"
                  : "bg-[#0D2038] text-slate-300 hover:text-white border border-white/10 hover:bg-[#142C4B]"
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Horizontal Slider Track with Framer Motion Timeline */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-stretch gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="course-card w-[320px] sm:w-[360px] shrink-0 rounded-3xl bg-gradient-to-b from-[#0E2038] to-[#08192E] border border-white/10 p-5 flex flex-col justify-between shadow-xl relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Skeleton Image Header */}
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-800/80 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                      <div className="flex flex-col items-center gap-2 text-amber-500/40">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                        <span className="text-[10px] font-semibold tracking-wider uppercase">কোর্স ডেটা লোড হচ্ছে...</span>
                      </div>
                    </div>

                    {/* Skeleton Title & Tagline */}
                    <div className="space-y-2.5">
                      <div className="h-5 w-3/4 bg-slate-700/60 rounded-md animate-pulse" />
                      <div className="h-3.5 w-full bg-slate-700/35 rounded-md animate-pulse" />
                      <div className="h-3.5 w-4/5 bg-slate-700/35 rounded-md animate-pulse" />
                    </div>

                    {/* Skeleton Duration Box */}
                    <div className="h-10 w-full bg-slate-800/70 rounded-xl border border-white/5 flex items-center justify-between px-3 animate-pulse">
                      <div className="h-3 w-20 bg-slate-700/50 rounded" />
                      <div className="h-3 w-24 bg-slate-700/50 rounded" />
                    </div>

                    {/* Skeleton Bullet List */}
                    <div className="space-y-2 pt-1">
                      <div className="h-3 w-11/12 bg-slate-700/35 rounded animate-pulse" />
                      <div className="h-3 w-9/12 bg-slate-700/35 rounded animate-pulse" />
                      <div className="h-3 w-10/12 bg-slate-700/35 rounded animate-pulse" />
                    </div>
                  </div>

                  {/* Skeleton Footer */}
                  <div className="pt-4 border-t border-white/10 space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-24 bg-amber-500/30 rounded-md animate-pulse" />
                      <div className="h-4 w-20 bg-slate-700/40 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-9 rounded-xl bg-slate-700/50 animate-pulse" />
                      <div className="h-9 rounded-xl bg-amber-500/40 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="courses-track"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              ref={scrollContainerRef}
              className="flex items-stretch gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-[#F59E0B]/30 scrollbar-track-transparent snap-x snap-mandatory"
              style={{ scrollBehavior: "smooth" }}
            >
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={cardVariants}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300, damping: 18 },
                  }}
                  className="course-card w-[320px] sm:w-[360px] shrink-0 snap-start rounded-3xl bg-gradient-to-b from-[#0E2038] to-[#08192E] border border-white/10 p-5 flex flex-col justify-between hover:border-[#F59E0B]/50 transition-all duration-300 shadow-xl group relative"
                >
                  <div>
                    {/* Course Header Banner / Image */}
                    <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-slate-800">
                      <img
                        src={
                          course.imageUrl ||
                          "https://images.unsplash.com/photo-1519074069444-1ba4eff56022?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E2038] via-transparent to-black/40 card-image-overlay" />

                      {/* Category & Badge Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#07182E]/90 backdrop-blur-md text-[#F59E0B] border border-[#F59E0B]/40 course-badge">
                            {course.categoryLabel}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white backdrop-blur-md">
                            {course.courseMode === "online"
                              ? "🌐 অনলাইন"
                              : course.courseMode === "offline"
                              ? "🏫 অফলাইন"
                              : "🌐 অনলাইন ও 🏫 অফলাইন"}
                          </span>
                        </div>
                        {course.discountBadge && (
                          <motion.span
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-red-500 text-white shadow-md"
                          >
                            {course.discountBadge}
                          </motion.span>
                        )}
                      </div>

                      {course.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                            <PlayCircle className="w-12 h-12 text-[#F59E0B] drop-shadow-lg" />
                          </motion.div>
                        </div>
                      )}

                      {course.batchBadge && (
                        <div className="absolute bottom-2 left-3">
                          <span className="text-[10px] font-semibold text-slate-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm card-batch-badge">
                            {course.batchBadge}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-[#F59E0B] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-300 mb-3 line-clamp-2 leading-relaxed">
                      {course.tagline}
                    </p>

                    {/* Duration & Start Date info */}
                    <div className="course-meta-box grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#07182E]/60 border border-white/5 text-[11px] text-slate-300 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{course.startDate}</span>
                      </div>
                    </div>

                    {/* Key Features Bullet List */}
                    <ul className="space-y-1.5 mb-5 text-xs text-slate-300">
                      {course.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-4 border-t border-white/10 space-y-3 card-footer">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xl font-extrabold text-[#F59E0B] course-price-text">
                          ৳{course.price.toLocaleString("bn-BD")}
                        </span>
                        {course.originalPrice > course.price && (
                          <span className="text-xs text-slate-400 line-through ml-2">
                            ৳{course.originalPrice.toLocaleString("bn-BD")}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded seat-badge">
                        অবশিষ্ট সিট: {course.seatsRemaining}টি
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/courses/${course.id}`}
                        className="course-details-btn w-full text-center py-2.5 px-3 rounded-xl bg-[#142C4B] hover:bg-[#1C3B63] text-[#F59E0B] text-xs font-bold transition-all border border-white/10"
                      >
                        বিস্তারিত দেখুন
                      </Link>

                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onOpenRegisterModal(course.id)}
                        className="course-enroll-btn w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black text-xs font-bold transition-all shadow-md hover:brightness-110"
                      >
                        এনরোল করুন
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
