"use client";

import { motion } from "framer-motion";
import { INSTRUCTORS } from "@/data/instructors";
import { Star, Award, GraduationCap, Users } from "lucide-react";

export default function InstructorsSection() {
  return (
    <section id="mentors" className="py-16 sm:py-24 relative bg-[#07182E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (From Top) */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#163255] border border-white/10 text-slate-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>সেরা ইন্সট্রাকটর ও মেন্টর প্যানেল</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            যাঁরা নিজে শীর্ষে পৌঁছেছেন, <span className="gold-gradient-text">তাঁদের থেকেই শেখো</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            সাবেক ডিফেন্স অফিসার ও বুয়েটের অভিজ্ঞ টপ র‍্যাঙ্কার শিক্ষকদের প্রত্যক্ষ দিকনির্দেশনায় তৈরি হবে তোমার ভবিষ্যৎ।
          </p>
        </motion.div>

        {/* Mentor Cards Grid with Directional Entrances */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INSTRUCTORS.map((mentor, idx) => {
            const initialPos =
              idx === 0
                ? { opacity: 0, x: -50 }
                : idx === INSTRUCTORS.length - 1
                ? { opacity: 0, x: 50 }
                : { opacity: 0, y: 50 };

            return (
              <motion.div
                key={mentor.id}
                initial={initialPos}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-[#0D2038] hover:bg-[#122744] border border-white/10 hover:border-[#F59E0B]/30 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xl group"
              >
                <div className="space-y-4">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                      {mentor.badge}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{mentor.rating}</span>
                    </div>
                  </div>

                  {/* Avatar Placeholder / Graphic Emblem */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#163255] to-[#0A1F38] border border-white/10 flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-10 h-10 text-[#F59E0B]" />
                  </div>

                  {/* Info */}
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#F59E0B] transition-colors">
                      {mentor.name}
                    </h3>
                    <span className="text-xs font-semibold text-emerald-400 block">
                      {mentor.institution}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {mentor.department}
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="text-xs text-slate-300 italic text-center bg-[#07182E] p-3 rounded-xl border border-white/5 leading-relaxed">
                    "{mentor.quote}"
                  </p>
                </div>

                {/* Footer Specs */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>অভিজ্ঞতা: {mentor.experience}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{mentor.studentsTaught} ছাত্র</span>
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
