"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Flag, Target, TrendingUp } from "lucide-react";

export default function LearningProcess() {
  const steps = [
    {
      number: "০১",
      title: "ভিত্তি তৈরি",
      description:
        "অভিজ্ঞ মেন্টরের গাইডলাইনে মৌলিক ধারণা, দুর্বলতা ও প্রস্তুতির বর্তমান অবস্থান নির্ধারণ।",
      icon: Target,
      tag: "ধাপ ১",
      color: "text-[#F59E0B]",
      bgColor: "bg-[#F59E0B]/10 border-[#F59E0B]/30",
      direction: "left" as const,
    },
    {
      number: "০২",
      title: "অনুশীলন ও মূল্যায়ন",
      description:
        "নিয়মিত ক্লাস, প্র্যাকটিস টেস্ট, মক পরীক্ষা এবং ব্যক্তিগত ফিডব্যাকের মাধ্যমে ধারাবাহিক উন্নতি।",
      icon: TrendingUp,
      tag: "ধাপ ২",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/30",
      direction: "bottom" as const,
    },
    {
      number: "০৩",
      title: "চূড়ান্ত প্রস্তুতি",
      description:
        "বাস্তব পরীক্ষার পরিবেশে পূর্ণাঙ্গ মক টেস্ট, ভুল বিশ্লেষণ এবং শেষ মুহূর্তের কৌশলগত প্রস্তুতি।",
      icon: Flag,
      tag: "ধাপ ৩",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/30",
      direction: "right" as const,
    },
  ];

  return (
    <section id="process" className="py-16 sm:py-24 relative bg-[#07182E] overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header (From Top) */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-14"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-[2px]" />
            <span>LEARNING PROCESS</span>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-[2px]" />
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25]">
            আপনার সাফল্যের যাত্রা{" "}
            <span className="gold-gradient-text block mt-1">ধাপে ধাপে</span>
          </h2>
        </motion.div>

        {/* Large Rounded Blue/Navy Container */}
        <div className="bg-[#0D2038] border border-white/10 rounded-3xl lg:rounded-[36px] p-6 sm:p-10 lg:p-12 shadow-2xl">
          
          {/* 3 Equal Columns Grid with Staggered Directional Reveals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-0">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === steps.length - 1;

              const initialPos =
                step.direction === "left"
                  ? { opacity: 0, x: -60 }
                  : step.direction === "right"
                  ? { opacity: 0, x: 60 }
                  : { opacity: 0, y: 60 };

              return (
                <motion.div
                  key={step.number}
                  initial={initialPos}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{
                    duration: 0.7,
                    delay: idx * 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`flex flex-col justify-between space-y-6 ${
                    !isLast
                      ? "border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-10"
                      : "lg:pl-10"
                  } ${idx === 1 ? "lg:px-10" : ""}`}
                >
                  <div className="space-y-5">
                    
                    {/* Top Row: Large Numeral & Step Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`text-4xl sm:text-5xl font-black ${step.color} tracking-tight`}>
                        {step.number}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${step.bgColor} ${step.color}`}>
                          {step.tag}
                        </span>
                        {!isLast && (
                          <ArrowRight className="hidden lg:block w-4 h-4 text-slate-500 ml-2" />
                        )}
                      </div>
                    </div>

                    {/* Step Icon Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-[#163255] border border-white/10 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${step.color}`} />
                    </div>

                    {/* Strong Bengali Title */}
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {step.title}
                    </h3>

                    {/* Muted Blue-Grey Description */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {step.description}
                    </p>

                  </div>

                  {/* Bottom Progression Indicator */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>দুর্বার ট্র্যাকিং সিস্টেম</span>
                    </span>
                    <span className="font-mono text-slate-500 text-[10px]">STAGE 0{idx + 1}</span>
                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
