"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationModal from "@/components/RegistrationModal";
import Link from "next/link";
import { motion } from "framer-motion";
import { Course } from "@/data/courses";
import { getStoredCourses, subscribeCoursesStore, syncCoursesFromSupabase } from "@/utils/courseStore";
import {
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
  PlayCircle,
  Filter,
} from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [registerInitialCourseId, setRegisterInitialCourseId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function loadData() {
      const dbCourses = await syncCoursesFromSupabase();
      setCourses(dbCourses.filter((c) => c.published !== false));
    }
    loadData();

    const unsubscribe = subscribeCoursesStore(() => {
      setCourses(getStoredCourses().filter((c) => c.published !== false));
    });
    return () => unsubscribe();
  }, []);

  const handleOpenRegisterModal = (courseId?: string) => {
    setRegisterInitialCourseId(courseId);
    setIsRegisterModalOpen(true);
  };

  const categories = [
    { id: "all", label: "সব ডিফেন্স কোর্স (All Courses)" },
    { id: "defense", label: "ডিফেন্স ও মিলিটারি (BAFA, BMA, BN, ISSB)" },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      activeCategory === "all" || course.category === activeCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#07182E] text-white font-sans selection:bg-[#F59E0B] selection:text-black flex flex-col justify-between overflow-x-hidden">
      <div>
        <Navbar onOpenRegisterModal={handleOpenRegisterModal} />

        {/* Page Banner / Header */}
        <section className="pt-28 pb-16 relative bg-gradient-to-b from-[#0B2347] via-[#07182E] to-[#07182E] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            {/* Tagline Badge (From Top) */}
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              <span>দুর্বার একাডেমি ডিফেন্স ও মিলিটারি প্রোগ্রামস</span>
            </motion.div>

            {/* Main Headline (From Left) */}
            <motion.h1
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
            >
              সকল <span className="gold-gradient-text">ডিফেন্স ও মিলিটারি কোর্স</span>
            </motion.h1>

            {/* Subtitle (From Right) */}
            <motion.p
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto"
            >
              বাংলাদেশ বিমান বাহিনী, নৌবাহিনী, সেনাবাহিনী (BAFA, BMA, BN, ISSB) এবং আইএসএসবি পরীক্ষার জন্য ডিফেন্স অফিসারদের তত্ত্বাবধানে নিবিড় মেধা ও স্বাস্থ্য পরীক্ষা প্রস্তুতি।
            </motion.p>

            {/* Search Input Bar (From Bottom Zoom) */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl mx-auto relative pt-3"
            >
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="কোর্সের নাম বা কিওয়ার্ড দিয়ে খুঁজুন (যেমন: BAFA, ISSB, BMA)..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#0E2038] border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-[#F59E0B] transition-all shadow-inner text-sm search-input-box"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Catalog Main Content */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Category Tabs (From Left) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar justify-start md:justify-center"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? "bg-[#F59E0B] text-black shadow-lg scale-105"
                    : "bg-[#0D2038] text-slate-300 hover:text-white border border-white/10 hover:bg-[#142C4B]"
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6 text-sm text-slate-400">
            <span>মোট {filteredCourses.length}টি কোর্স পাওয়া গেছে</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#F59E0B] hover:underline text-xs"
              >
                সার্চ ফিল্টার ক্লিয়ার করুন
              </button>
            )}
          </div>

          {/* Course Cards Grid with Alternating Directional Entrances */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, idx) => {
                const initialPos =
                  idx % 3 === 0
                    ? { opacity: 0, x: -60 }
                    : idx % 3 === 1
                    ? { opacity: 0, y: 60 }
                    : { opacity: 0, x: 60 };

                return (
                  <motion.div
                    key={course.id}
                    initial={initialPos}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{
                      duration: 0.6,
                      delay: (idx % 3) * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{
                      y: -10,
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300, damping: 18 },
                    }}
                    className="course-card rounded-3xl bg-gradient-to-b from-[#0E2038] to-[#08192E] border border-white/10 p-6 flex flex-col justify-between hover:border-[#F59E0B]/50 transition-all duration-300 shadow-xl group relative"
                  >
                    <div>
                      {/* Course Banner Image */}
                      <div className="relative h-48 rounded-2xl overflow-hidden mb-5 bg-slate-800">
                        <img
                          src={
                            course.imageUrl ||
                            "https://images.unsplash.com/photo-1519074069444-1ba4eff56022?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E2038] via-transparent to-black/40 card-image-overlay" />

                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#07182E]/90 backdrop-blur-md text-[#F59E0B] border border-[#F59E0B]/40 course-badge">
                            {course.categoryLabel}
                          </span>
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
                            <PlayCircle className="w-12 h-12 text-[#F59E0B] drop-shadow-lg" />
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

                      {/* Info */}
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#F59E0B] transition-colors leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                        {course.tagline}
                      </p>

                      {/* Metadata */}
                      <div className="course-meta-box grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#07182E]/60 border border-white/5 text-xs text-slate-300 mb-5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#F59E0B]" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <span>{course.startDate}</span>
                        </div>
                      </div>

                      {/* Features list */}
                      <ul className="space-y-2 mb-6 text-xs text-slate-300">
                        {course.features.slice(0, 4).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-4 border-t border-white/10 space-y-3 card-footer">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-extrabold text-[#F59E0B] course-price-text">
                            ৳{course.price.toLocaleString("bn-BD")}
                          </span>
                          {course.originalPrice > course.price && (
                            <span className="text-xs text-slate-400 line-through ml-2">
                              ৳{course.originalPrice.toLocaleString("bn-BD")}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded seat-badge">
                          অবশিষ্ট সিট: {course.seatsRemaining}টি
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href={`/courses/${course.id}`}
                          className="course-details-btn w-full text-center py-3 px-3 rounded-2xl bg-[#142C4B] hover:bg-[#1C3B63] text-[#F59E0B] text-xs font-bold transition-all border border-white/10"
                        >
                          বিস্তারিত দেখুন
                        </Link>

                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleOpenRegisterModal(course.id)}
                          className="course-enroll-btn w-full py-3 px-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black text-xs font-bold transition-all shadow-md hover:brightness-110"
                        >
                          ভর্তি হোন
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-[#0E2038]/50 rounded-3xl border border-white/10"
            >
              <Filter className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-1">কোনো কোর্স পাওয়া যায়নি</h3>
              <p className="text-sm text-slate-400 mb-4">আপনার ফিল্টার অথবা সার্চ কিওয়ার্ড পরিবর্তন করে চেষ্টা করুন।</p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#F59E0B] text-black text-xs font-bold"
              >
                সব কোর্স দেখুন
              </button>
            </motion.div>
          )}
        </section>
      </div>

      <Footer />

      {isRegisterModalOpen && (
        <RegistrationModal
          initialCourseId={registerInitialCourseId}
          onClose={() => setIsRegisterModalOpen(false)}
        />
      )}
    </main>
  );
}
