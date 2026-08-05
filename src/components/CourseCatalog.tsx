"use client";

import { useState } from "react";
import { COURSES, Course } from "@/data/courses";
import { Sparkles, Check, Clock, UserCheck } from "lucide-react";

interface CourseCatalogProps {
  onOpenSyllabusModal: (course: Course) => void;
  onOpenRegisterModal: (courseId?: string) => void;
}

export default function CourseCatalog({ onOpenSyllabusModal, onOpenRegisterModal }: CourseCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "সব কোর্সসমূহ" },
    { id: "defense", label: "ডিফেন্স ও মিলিটারি (BAFA, BMA, BN, ISSB)" },
  ];

  const filteredCourses =
    activeCategory === "all"
      ? COURSES
      : COURSES.filter((c) => c.category === activeCategory);

  return (
    <section id="courses" className="py-16 sm:py-24 relative bg-[#07182E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ডিফেন্স ও মিলিটারি কোর্সসমূহ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            তোমার স্বপ্নের জন্য সঠিক <span className="gold-gradient-text">ডিফেন্স প্রোগ্রাম বেছে নাও</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            প্রতিটি কোর্সে থাকছে ডেইলি OMR এক্সাম, বিষয়ভিত্তিক লেকচার ও সাবেক ডিফেন্স অফিসার মেন্টরদের ১-অন-১ সাপোর্ট।
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                activeCategory === cat.id
                  ? "bg-[#F59E0B] text-black shadow-lg gold-glow scale-105"
                  : "bg-[#0D2038] text-slate-300 hover:text-white border border-white/10 hover:bg-[#142C4B]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            return (
              <div
                key={course.id}
                className="course-card relative rounded-3xl bg-gradient-to-b from-[#0E2038] to-[#08192E] border border-white/10 p-6 flex flex-col justify-between hover:border-[#F59E0B]/40 transition-all duration-300 shadow-xl group hover:-translate-y-1"
              >
                {/* Top Badge Overlay */}
                <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#163255] text-[#F59E0B] border border-[#F59E0B]/30 course-badge">
                      {course.categoryLabel}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {course.courseMode === "online"
                        ? "🌐 অনলাইন"
                        : course.courseMode === "offline"
                        ? "🏫 অফলাইন"
                        : "🌐 অনলাইন ও 🏫 অফলাইন"}
                    </span>
                  </div>
                  {course.discountBadge && (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-red-500 text-white">
                      {course.discountBadge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#F59E0B] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                    {course.tagline}
                  </p>

                  <div className="course-meta-box grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#07182E] border border-white/5 text-xs text-slate-300 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#F59E0B]" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>{course.startDate}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 text-xs text-slate-300">
                    {course.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
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
                      অবশিষ্ট: {course.seatsRemaining}টি
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onOpenSyllabusModal(course)}
                      className="course-details-btn py-2.5 px-3 rounded-xl bg-[#142C4B] hover:bg-[#1C3B63] text-white text-xs font-bold transition-all border border-white/10"
                    >
                      সিলেবাস
                    </button>
                    <button
                      onClick={() => onOpenRegisterModal(course.id)}
                      className="course-enroll-btn py-2.5 px-3 rounded-xl bg-[#F59E0B] hover:bg-[#FACC15] text-black text-xs font-bold transition-all shadow-md"
                    >
                      ভর্তি হোন
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
