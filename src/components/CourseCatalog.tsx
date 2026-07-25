"use client";

import { useState } from "react";
import { COURSES, Course } from "@/data/courses";
import { BookOpen, Check, Clock, Sparkles, UserCheck, Flame, ChevronRight } from "lucide-react";

interface CourseCatalogProps {
  onOpenSyllabusModal: (course: Course) => void;
  onOpenRegisterModal: (courseId?: string) => void;
}

export default function CourseCatalog({ onOpenSyllabusModal, onOpenRegisterModal }: CourseCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "সব কোর্সসমূহ" },
    { id: "engineering", label: "ইঞ্জিনিয়ারিং (BUET/CKRUET)" },
    { id: "medical", label: "মেডিকেল ও ডেন্টাল (DMC Target)" },
    { id: "varsity", label: "ভার্সিটি ক-ইউনিট (DU Science)" },
    { id: "hsc", label: "এইচএসসি সাইন্স (HSC 25/26)" },
    { id: "bcs", label: "বিসিএস ও জব প্রিপারেশন" },
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
            <span>অ্যাডমিশন ও একাডেমি কোর্সসমূহ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            তোমার স্বপ্নের জন্য সঠিক <span className="gold-gradient-text">ফ্ল্যাগশিপ প্রোগ্রাম বেছে নাও</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            প্রতিটি কোর্সে থাকছে ডেইলি OMR এক্সাম, প্রিন্টেড কোয়েশ্চেন ব্যাংক ও বুয়েট/মেডিকেল গ্র্যাজুয়েট মেন্টরদের ১-অন-১ সাপোর্ট।
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
            const seatPercentage = Math.round(
              ((course.totalSeats - course.seatsRemaining) / course.totalSeats) * 100
            );

            return (
              <div
                key={course.id}
                className="relative rounded-3xl bg-gradient-to-b from-[#0E2038] to-[#08192E] border border-white/10 p-6 flex flex-col justify-between hover:border-[#F59E0B]/40 transition-all duration-300 shadow-xl group hover:-translate-y-1"
              >
                {/* Top Badge Overlay */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#163255] text-[#F59E0B] border border-[#F59E0B]/30">
                    {course.batchBadge}
                  </span>
                  {course.discountBadge && (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-emerald-400" />
                      {course.discountBadge}
                    </span>
                  )}
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {course.categoryLabel}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#F59E0B] transition-colors mt-1 leading-snug">
                      {course.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {course.tagline}
                  </p>

                  {/* Seat Availability Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">সিট বুুকিং সম্পন্ন</span>
                      <span className="text-[#F59E0B] font-bold">
                        মাত্র {course.seatsRemaining}টি সিট বাকি!
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#07182E] rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#F59E0B] to-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: `${seatPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Features List */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {course.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Duration & Instructors */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{course.instructors[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & Action Buttons */}
                <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 line-through mr-2">
                        ৳{course.originalPrice.toLocaleString("bn-BD")}
                      </span>
                      <span className="text-2xl font-extrabold text-white">
                        ৳{course.price.toLocaleString("bn-BD")}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenSyllabusModal(course)}
                      className="text-xs font-semibold text-[#F59E0B] hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>সিলেবাস দেখুন</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenRegisterModal(course.id)}
                    className="w-full py-3 text-xs font-bold text-black bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] rounded-xl shadow-lg gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>সিট বুক করুন ও ভর্তি হোন</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
