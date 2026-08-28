"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Users, LayoutGrid, HelpCircle, AlertTriangle } from "lucide-react";

export default function StudentChallenge() {
  const challenges = [
    {
      id: "c1",
      image: "/images/crowded_coaching_hall.png",
      icon: Users,
      title: "শত শত শিক্ষার্থীর ভিড়ে আপনি কি হারিয়ে যাচ্ছেন?",
      description:
        "বড় ব্যাচে ব্যক্তিগত দুর্বলতা, অগ্রগতি এবং শেখার ঘাটতি অনেক সময় নজরের বাইরে থেকে যায়।",
      badgeText: "সমস্যা ০১",
      direction: "left" as const,
    },
    {
      id: "c2",
      image: "/images/generic_one_size_teaching.png",
      icon: LayoutGrid,
      title: "সবার জন্য একই প্রস্তুতি কি আপনার জন্য যথেষ্ট?",
      description:
        "প্রত্যেক শিক্ষার্থীর শক্তি ও দুর্বলতা আলাদা। তাই প্রস্তুতির কৌশলও হওয়া উচিত ব্যক্তিকেন্দ্রিক।",
      badgeText: "সমস্যা ০২",
      direction: "bottom" as const,
    },
    {
      id: "c3",
      image: "/images/stressed_student_struggling.png",
      icon: HelpCircle,
      title: "পরিশ্রম করছেন, কিন্তু সঠিক দিকনির্দেশনা পাচ্ছেন না?",
      description:
        "পরিকল্পনাহীন প্রস্তুতি সময় নষ্ট করে। সঠিক মেন্টরশিপ আপনার প্রস্তুতিকে আরও কার্যকর করে।",
      badgeText: "সমস্যা ০৩",
      direction: "right" as const,
    },
  ];

  return (
    <section id="challenge" className="py-20 lg:py-28 relative bg-[#07182E] overflow-hidden">
      {/* Background Subtle Red Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-500/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Centered Section Header (From Top) */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-16"
        >
          {/* Eyebrow with decorative small red square badges */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-[2px]" />
            <span>THE STUDENT CHALLENGE</span>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-[2px]" />
          </div>

          {/* Main Bengali Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25]">
            প্রচলিত প্রস্তুতির যে ভুলগুলো{" "}
            <span className="text-red-400 block mt-1">আপনার স্বপ্নকে পিছিয়ে দেয়</span>
          </h2>
        </motion.div>

        {/* 3 Equal Cards Grid with Directional Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {challenges.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="bg-[#0D2038] hover:bg-[#122744] border border-white/10 hover:border-red-500/40 rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-xl group flex flex-col justify-between transform-gpu"
              >
                <div className="space-y-5">
                  {/* Large 16:10 Image Container */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#07182E]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      loading="lazy"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Dark gradient bottom overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07182E] via-transparent to-transparent opacity-60" />

                    {/* Small Red Icon Badge Overlay */}
                    <div className="absolute top-3 left-3 bg-red-500/90 text-white p-2 rounded-xl border border-red-400/40 shadow-lg backdrop-blur-sm flex items-center gap-1.5 text-[11px] font-bold">
                      <Icon className="w-4 h-4 text-white" />
                      <span>{item.badgeText}</span>
                    </div>
                  </div>

                  {/* Bengali Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Supporting Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Red Accent Indicator */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-red-400/80 font-medium">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>প্রচলিত ধারার সীমাবদ্ধতা</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
