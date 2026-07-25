"use client";

import Image from "next/image";
import { ArrowRight, ShieldCheck, Award, Sparkles, ChevronRight, BookOpen } from "lucide-react";

interface HeroProps {
  onOpenRegisterModal: (courseId?: string) => void;
}

export default function Hero({ onOpenRegisterModal }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-[85vh] lg:min-h-[92vh] flex items-end pb-16 lg:pb-24 -mt-[76px] sm:-mt-[96px] pt-[92px] sm:pt-[112px] lg:pt-[125px] overflow-hidden bg-[#07182E]"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/durbar_hero_cinematic.png"
          alt="দুর্বার একাডেমি শিক্ষার্থী প্রশিক্ষণ"
          fill
          priority
          className="object-cover object-center scale-105 animate-pulse-subtle"
        />

        {/* Strong Dark Gradient Overlays for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07182E] via-[#07182E]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07182E] via-[#07182E]/85 to-transparent" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Hero Content - Positioned Bottom Left on Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-3xl space-y-6 sm:space-y-8 animate-fade-in-up">
          
          {/* Subtle Academy Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D2038]/95 border border-[#F59E0B]/30 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
            <span className="text-xs font-bold text-[#F59E0B] tracking-wide uppercase">
              দুর্বার একাডেমি • ফ্ল্যাগশিপ এডুকেশন
            </span>
          </div>

          {/* Main Visually Dominant Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.2] sm:leading-[1.12]">
            আজকের প্রস্তুতি।
            <span className="block text-[#FACC15] drop-shadow-[0_2px_10px_rgba(250,204,21,0.25)] mt-2 sm:mt-3 pb-2 overflow-visible">
              আগামীর নেতৃত্ব।
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-slate-200 font-normal leading-relaxed max-w-2xl">
            শুধু পরীক্ষার প্রস্তুতি নয়, আত্মবিশ্বাস, শৃঙ্খলা ও সঠিক দিকনির্দেশনায় নিজেকে গড়ে তুলুন{" "}
            <span className="text-[#FACC15] font-semibold">দুর্বার একাডেমির</span> সাথে।
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button
              onClick={() => onOpenRegisterModal()}
              className="px-8 py-4 text-base font-extrabold text-slate-950 bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] hover:from-[#FACC15] hover:to-[#F59E0B] rounded-2xl shadow-2xl gold-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <span>এখনই ভর্তি হোন</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#courses"
              className="px-8 py-4 text-base font-bold text-white bg-[#0D2038]/80 hover:bg-[#142C4B] border border-white/15 backdrop-blur-md rounded-2xl transition-all flex items-center justify-center gap-2 hover:border-[#F59E0B]/40"
            >
              <BookOpen className="w-5 h-5 text-[#F59E0B]" />
              <span>কোর্স দেখুন</span>
            </a>
          </div>

          {/* Subtle Key Highlights Bar */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>আইএসএসবি লিডারশিপ ট্রেনিং</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>অবসরপ্রাপ্ত ডিফেন্স অফিসার মেন্টর</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ডেইলি সাইকোমেট্রিক ও স্ক্রিনিং টেস্ট</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
