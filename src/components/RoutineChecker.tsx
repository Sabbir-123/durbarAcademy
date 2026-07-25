"use client";

import { useState } from "react";
import { ROUTINES, RoutineItem } from "@/data/routines";
import { Calendar, Clock, Download, FileText, Filter, CheckCircle } from "lucide-react";

export default function RoutineChecker() {
  const [selectedProgram, setSelectedProgram] = useState<string>("engineering");

  const programs = [
    { id: "engineering", label: "ইঞ্জিনিয়ারিং স্পেশাল" },
    { id: "medical", label: "মেডিকেল টার্গেট" },
    { id: "varsity", label: "ভার্সিটি ক-ইউনিট" },
    { id: "hsc", label: "এইচএসসি একাডেমি" },
  ];

  const filteredRoutines = ROUTINES.filter((r) => r.program === selectedProgram);

  return (
    <section id="routine" className="py-16 sm:py-24 relative bg-[#07182E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#163255] border border-white/10 text-slate-300 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>লাইভ ক্লাস ও ওএমআর এক্সাম শিডিউল</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              সাপ্তাহিক রুটিন ও <span className="gold-gradient-text">পরীক্ষার সময়সূচি</span>
            </h2>
            <p className="text-sm text-slate-300">
              তোমার ব্যাচ অনুযায়ী আজকের এবং আগামী সপ্তাহের ক্লাস ও ওএমআর পরীক্ষার রুটিন দেখে নাও।
            </p>
          </div>

          {/* Download PDF Button */}
          <button
            onClick={() => alert("রুটিন পিডিএফ ডাউনলোড লিঙ্ক প্রস্তুত করা হচ্ছে...")}
            className="px-5 py-3 text-xs font-bold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-[#F59E0B]" />
            <span>সম্পূর্ণ রুটিন PDF ডাউনলোড</span>
          </button>
        </div>

        {/* Program Filter Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {programs.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProgram(p.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                selectedProgram === p.id
                  ? "bg-[#F59E0B] text-black shadow-lg gold-glow"
                  : "bg-[#0D2038] text-slate-300 hover:text-white border border-white/10"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Routine Items Cards Grid */}
        <div className="space-y-4">
          {filteredRoutines.length === 0 ? (
            <div className="bg-[#0D2038] p-8 rounded-3xl text-center text-slate-400 text-sm">
              এই বিভাগের জন্য নতুন রুটিন শীঘ্রই আপডেট করা হবে।
            </div>
          ) : (
            filteredRoutines.map((item) => (
              <div
                key={item.id}
                className="bg-[#0D2038] hover:bg-[#122744] border border-white/10 hover:border-[#F59E0B]/30 rounded-2xl p-5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
              >
                {/* Date & Day Badge */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-12 h-12 rounded-2xl bg-[#163255] border border-white/10 flex flex-col items-center justify-center text-center shrink-0">
                    <span className="text-xs font-bold text-[#F59E0B]">{item.date.split(" ")[0]}</span>
                    <span className="text-[10px] text-slate-400">{item.day}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">{item.date}</span>
                    <span className="text-sm font-bold text-white">{item.subject}</span>
                  </div>
                </div>

                {/* Topic Description */}
                <div className="flex-1 md:border-l md:border-white/10 md:pl-6 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        item.type === "Live Class"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : item.type === "OMR Exam"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-400">• ইন্সট্রাকটর: {item.instructor}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{item.topic}</h4>
                </div>

                {/* Time & Portal Action */}
                <div className="flex items-center justify-between md:justify-end gap-4 min-w-[180px] border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Clock className="w-4 h-4 text-[#F59E0B]" />
                    <span>{item.time}</span>
                  </div>
                  <button
                    onClick={() => alert(`পোর্টালে প্রবেশ সফল: ${item.topic}`)}
                    className="px-3.5 py-2 text-xs font-bold text-black bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl transition-all"
                  >
                    পোর্টালে যোগ দিন
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
