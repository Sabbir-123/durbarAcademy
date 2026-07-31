"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { StudentSuccess } from "@/data/testimonials";
import {
  getStoredSuccessStories,
  subscribeSuccessStoriesStore,
} from "@/utils/successStoryStore";
import { Trophy, Quote, CheckCircle, ArrowRight } from "lucide-react";

export default function SuccessSection() {
  const [testimonials, setTestimonials] = useState<StudentSuccess[]>([]);

  useEffect(() => {
    setTestimonials(getStoredSuccessStories().filter((s) => s.published !== false));
    const unsubscribe = subscribeSuccessStoriesStore(() => {
      setTestimonials(getStoredSuccessStories().filter((s) => s.published !== false));
    });
    return () => unsubscribe();
  }, []);

  return (
    <section id="success" className="py-16 sm:py-24 relative bg-gradient-to-b from-[#07182E] via-[#0A1D36] to-[#07182E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (From Top) */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            <span>সাফল্যের ইতিহাস ও মেধা তালিকা</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            যাঁরা দুর্বারের হাত ধরে <span className="gold-gradient-text">শীর্ষ স্থান দখল করেছে</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            বাংলাদেশ বিমান বাহিনী, নৌবাহিনী, সেনাবাহিনী (BAFA, BMA, BN, ISSB) এবং ডিফেন্স অফিসার ক্যাডেট ভর্তি পরীক্ষায় আমাদের কৃতি শিক্ষার্থীদের অর্জন।
          </p>

          <div className="pt-2">
            <Link
              href="/success-stories"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F59E0B] text-black text-xs font-bold shadow-md hover:brightness-110 transition"
            >
              <span>সকল সাকসেস স্টোরি দেখুন</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </motion.div>

        {/* Feature Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Image Showcase (From Left) */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative"
          >
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
                    <span className="text-xs font-bold text-white block">ডিফেন্স মেধা তালিকা সংবর্ধনা</span>
                    <span className="text-[11px] text-slate-300">BAFA, BMA, BN ও ISSB ২০০+ সিলেকশন</span>
                  </div>
                  <span className="bg-[#F59E0B] text-black font-extrabold text-xs px-3 py-1 rounded-full">
                    ১০০% মেধা
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stat Highlight Cards (From Right) */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-[#F59E0B]">১ম</span>
                <span className="text-xs text-slate-300 block font-medium">BAFA ফাইলট ক্যাডেট</span>
              </div>
              <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-emerald-400">২য়</span>
                <span className="text-xs text-slate-300 block font-medium">BMA লং কোর্স</span>
              </div>
              <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-white">৫ম</span>
                <span className="text-xs text-slate-300 block font-medium">BN ক্যাডেট অফিসার</span>
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
          </motion.div>

        </div>

        {/* Student Testimonials Grid (Alternating Left/Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.slice(0, 4).map((item, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.01 }}
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
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
