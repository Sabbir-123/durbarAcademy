"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationModal from "@/components/RegistrationModal";
import { motion } from "framer-motion";
import { StudentSuccess } from "@/data/testimonials";
import {
  getStoredSuccessStories,
  subscribeSuccessStoriesStore,
} from "@/utils/successStoryStore";
import {
  Trophy,
  Quote,
  Search,
  CheckCircle2,
  Filter,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<StudentSuccess[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setStories(getStoredSuccessStories().filter((s) => s.published !== false));
    const unsubscribe = subscribeSuccessStoriesStore(() => {
      setStories(getStoredSuccessStories().filter((s) => s.published !== false));
    });
    return () => unsubscribe();
  }, []);

  const categories = [
    { id: "all", label: "সকল সাফল্য (All Stories)" },
    { id: "bafa", label: "BAFA (বিমান বাহিনী)" },
    { id: "bma", label: "BMA (সেনাবাহিনী)" },
    { id: "bn", label: "BN (নৌবাহিনী)" },
    { id: "issb", label: "ISSB (গ্রিন কার্ড)" },
  ];

  const filteredStories = stories.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hscCollege.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#07182E] text-white font-sans selection:bg-[#F59E0B] selection:text-black flex flex-col justify-between overflow-x-hidden">
      <div>
        <Navbar onOpenRegisterModal={() => setIsRegisterModalOpen(true)} />

        {/* Hero Section Banner */}
        <section className="pt-28 pb-16 relative bg-gradient-to-b from-[#0B2347] via-[#07182E] to-[#07182E] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold"
            >
              <Trophy className="w-4 h-4" />
              <span>দুর্বার একাডেমি মেধা তালিকা ও সাকসেস গ্যালারি</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
            >
              আমাদের কৃতি শিক্ষার্থীদের <span className="gold-gradient-text">সাকসেস স্টোরি</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto"
            >
              বাংলাদেশ বিমান বাহিনী (BAFA), নৌবাহিনী (BN), সেনাবাহিনী (BMA) এবং আইএসএসবি গ্রিন কার্ড অর্জনকারী আমাদের হাজারো সফল ক্যাডেটের গল্প।
            </motion.p>

            {/* Search Input Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-xl mx-auto relative pt-3"
            >
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="শিক্ষার্থীর নাম, কলেজ বা ক্যাডেট ব্যাচ দিয়ে খুঁজুন..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#0E2038] border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-[#F59E0B] transition-all shadow-inner text-sm search-input-box"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar justify-start md:justify-center">
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
          </div>

          {/* Grid Count Bar */}
          <div className="flex items-center justify-between mb-6 text-sm text-slate-400">
            <span>মোট {filteredStories.length}টি সাকসেস স্টোরি পাওয়া গেছে</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#F59E0B] hover:underline text-xs"
              >
                সার্চ ফিল্টার ক্লিয়ার করুন
              </button>
            )}
          </div>

          {/* Success Story Cards Grid */}
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredStories.map((story, idx) => {
                const isEven = idx % 2 === 0;

                return (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, x: isEven ? -50 : 50, y: 30 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{
                      duration: 0.6,
                      delay: (idx % 2) * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="bg-[#0D2038] border border-white/10 hover:border-[#F59E0B]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6 group relative overflow-hidden"
                  >
                    <div className="space-y-5">
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                            story.badgeColor === "gold"
                              ? "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30"
                              : story.badgeColor === "emerald"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {story.rank}
                        </span>

                        <span className="text-xs font-bold text-slate-300 bg-[#07182E] px-3 py-1 rounded-full border border-white/5">
                          {story.score}
                        </span>
                      </div>

                      {/* Image & Main Info Layout */}
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#163255] border border-white/10 shrink-0 shadow-md">
                          {story.imageUrl ? (
                            <img
                              src={story.imageUrl}
                              alt={story.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#F59E0B]">
                              <GraduationCap className="w-10 h-10" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-white group-hover:text-[#F59E0B] transition-colors leading-snug">
                            {story.name}
                          </h3>
                          <span className="text-xs font-semibold text-emerald-400 block">
                            {story.institution}
                          </span>
                          <span className="text-xs text-slate-400 block">
                            কোর্স: {story.program}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            কলেজ: {story.hscCollege}
                          </span>
                        </div>
                      </div>

                      {/* Quote Box with Light Theme Compatibility */}
                      <div className="relative bg-[#07182E]/80 quote-box p-4 rounded-2xl border border-white/5 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium italic">
                        <Quote className="w-6 h-6 text-[#F59E0B]/30 absolute -top-2 -left-2" />
                        <p className="pl-3">{story.quote}</p>
                      </div>
                    </div>

                    {/* Footer Verification Badge */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>যাচাইকৃত শিক্ষার্থী ফলাফল</span>
                      </span>

                      <button
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="inline-flex items-center gap-1 text-xs text-[#F59E0B] hover:underline font-bold"
                      >
                        <span>ডিফেন্স ব্যাচে এনরোল করুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#0E2038]/50 rounded-3xl border border-white/10">
              <Filter className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-1">কোনো স্টোরি পাওয়া যায়নি</h3>
              <p className="text-sm text-slate-400 mb-4">অন্য কিওয়ার্ড দিয়ে খুঁজুন।</p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#F59E0B] text-black text-xs font-bold"
              >
                সব সাকসেস স্টোরি দেখুন
              </button>
            </div>
          )}
        </section>
      </div>

      <Footer />

      {isRegisterModalOpen && (
        <RegistrationModal onClose={() => setIsRegisterModalOpen(false)} />
      )}
    </main>
  );
}
