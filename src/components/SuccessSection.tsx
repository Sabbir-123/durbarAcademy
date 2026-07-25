"use client";

import Image from "next/image";
import { TESTIMONIALS } from "@/data/testimonials";
import { Trophy, Star, Quote, CheckCircle } from "lucide-react";

export default function SuccessSection() {
  return (
    <section id="success" className="py-16 sm:py-24 relative bg-gradient-to-b from-[#07182E] via-[#0A1D36] to-[#07182E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            <span>সাফল্যের ইতিহাস ও মেধা তালিকা</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            যাঁরা দুর্বারের হাত ধরে <span className="gold-gradient-text">শীর্ষ স্থান দখল করেছে</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            বুয়েট, মেডিকেল ও ঢাকা বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষায় আমাদের কৃতি শিক্ষার্থীদের সেরা অর্জন।
          </p>
        </div>

        {/* Feature Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Image Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 p-2 bg-[#0D2038] shadow-2xl">
              <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden">
                <Image
                  src="/images/buet_medical_rankers.png"
                  alt="দুর্বার একাডেমির সেরা র‍্যাঙ্কার শিক্ষার্থীগণ"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07182E] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#07182E]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">মেধা তালিকা সংবর্ধনা ২০২৪-২৫</span>
                    <span className="text-[11px] text-slate-300">বুয়েট ও ডিএমসিতে ২০০+ চূড়ান্ত সিলেকশন</span>
                  </div>
                  <span className="bg-[#F59E0B] text-black font-extrabold text-xs px-3 py-1 rounded-full">
                    ১০০% মেধা
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Highlight Cards */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-[#F59E0B]">১ম</span>
                <span className="text-xs text-slate-300 block font-medium">বুয়েট সিএসই মেধা স্থান</span>
              </div>
              <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-emerald-400">২য়</span>
                <span className="text-xs text-slate-300 block font-medium">ঢাকা মেডিকেল কলেজ</span>
              </div>
              <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-white">৫ম</span>
                <span className="text-xs text-slate-300 block font-medium">ঢাবি 'ক' ইউনিট</span>
              </div>
              <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-[#F59E0B]">১৫,০০০+</span>
                <span className="text-xs text-slate-300 block font-medium">মোট চূড়ান্ত শিক্ষার্থী</span>
              </div>
            </div>

            <div className="bg-[#122744] p-5 rounded-2xl border border-white/10 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <p className="text-xs text-slate-200 leading-relaxed">
                দুর্বার একাডেমির প্রতিটি ফলাফল নিরপেক্ষ ও যাচাইকৃত। আমরা আমাদের শিক্ষার্থীদের সাফল্যের প্রকৃত গল্প শেয়ার করি।
              </p>
            </div>
          </div>

        </div>

        {/* Student Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-4 hover:border-[#F59E0B]/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      item.badgeColor === "gold"
                        ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {item.rank}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{item.score}</span>
                </div>

                <Quote className="w-8 h-8 text-[#F59E0B]/40" />

                <p className="text-sm text-slate-200 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">{item.name}</h4>
                  <span className="text-xs text-emerald-400 font-semibold block">{item.institution}</span>
                  <span className="text-[10px] text-slate-400 block">{item.hscCollege}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
