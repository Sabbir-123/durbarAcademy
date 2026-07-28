"use client";

import Image from "next/image";
import { UserCheck, Users, BookOpen, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

export default function DurbarSolution() {
  const features = [
    {
      id: "f1",
      icon: UserCheck,
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      title: "ব্যক্তিগত মেন্টরশিপ ও প্রগ্রেস ট্র্যাকিং",
      description:
        "প্রতিটি শিক্ষার্থীর শক্তি, দুর্বলতা ও অগ্রগতি বিশ্লেষণ করে প্রয়োজন অনুযায়ী ব্যক্তিগত গাইডলাইন প্রদান।",
    },
    {
      id: "f2",
      icon: Users,
      iconColor: "text-[#F59E0B]",
      borderColor: "border-[#F59E0B]/30",
      title: "ছোট ব্যাচ, বেশি মনোযোগ",
      description:
        "সীমিত শিক্ষার্থীর ব্যাচে প্রতিটি শিক্ষার্থীর শেখা, প্রশ্ন এবং দুর্বলতার দিকে আলাদাভাবে নজর দেওয়া হয়।",
    },
    {
      id: "f3",
      icon: BookOpen,
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      title: "আধুনিক ও ফলাফলকেন্দ্রিক কারিকুলাম",
      description:
        "বর্তমান পরীক্ষার ধরন ও প্রয়োজন অনুযায়ী নিয়মিত আপডেটেড কনটেন্ট, অনুশীলন এবং মূল্যায়ন।",
    },
  ];

  return (
    <section id="solution" className="py-16 sm:py-24 relative bg-[#07182E] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Large Rounded Rectangular Visual Container */}
        <div className="relative rounded-3xl lg:rounded-[36px] overflow-hidden border border-white/15 bg-[#0D2038] shadow-2xl durbar-solution-card">
          
          {/* Background Cinematic Image - Fills the large container */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/durbar_mentor_guidance.png"
              alt="দুর্বার একাডেমি পার্সোনাল মেন্টরশিপ"
              fill
              className="object-cover object-right lg:object-center opacity-85"
            />
            {/* Subtle Gradient Overlays for High Legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#07182E] via-[#07182E]/90 to-transparent hidden lg:block durbar-solution-overlay-r" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07182E] via-[#07182E]/80 to-transparent lg:hidden durbar-solution-overlay-t" />
          </div>

          {/* Content Wrapper */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14">
            
            {/* Dark Navy Content Panel Over LEFT Side on Desktop */}
            <div className="w-full lg:max-w-2xl bg-[#081B33]/95 backdrop-blur-md rounded-2xl lg:rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl space-y-8 durbar-solution-panel">
              
              {/* Top Eyebrow */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-[2px]" />
                  <span>THE DURBAR SOLUTION</span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-[2px]" />
                </div>

                {/* Main Bengali Heading */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25]">
                  ব্যক্তিকেন্দ্রিক প্রস্তুতি,{" "}
                  <span className="gold-gradient-text block mt-1">শৃঙ্খলাবদ্ধ সাফল্য</span>
                </h2>
              </div>

              {/* Three Feature Rows */}
              <div className="space-y-6 pt-2">
                {features.map((feat, idx) => {
                  const Icon = feat.icon;
                  const isLast = idx === features.length - 1;

                  return (
                    <div
                      key={feat.id}
                      className={`flex items-start gap-4 sm:gap-5 ${
                        !isLast ? "border-b border-white/10 pb-6" : ""
                      }`}
                    >
                      {/* Soft Blue Icon Container */}
                      <div className={`w-12 h-12 rounded-2xl bg-[#163255] border ${feat.borderColor} flex items-center justify-center shrink-0 shadow-md`}>
                        <Icon className={`w-6 h-6 ${feat.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                            {feat.title}
                          </h3>
                          {idx === 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] inline-block animate-ping" />
                          )}
                        </div>

                        {/* Detail line indicator */}
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-2 border-l-2 border-[#F59E0B]/60">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Action */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>শতভাগ শৃঙ্খলানির্ভর একাডেমি সাপোর্ট</span>
                </div>
                <a
                  href="#courses"
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-black bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>সমাধানের অংশ হোন</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
