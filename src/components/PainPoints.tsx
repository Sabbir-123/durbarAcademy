"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Sparkles, XCircle } from "lucide-react";

export default function PainPoints() {
  const comparisons = [
    {
      problemTitle: "দিকনির্দেশনাহীন প্রস্তুতি",
      problemDesc: "প্রচুর তথ্য ও বাজারের মোটা গাইডবুকের ভিড়ে কোন টপিক বুয়েট, ডিফেন্স বা মেডিকেলের জন্য গুরুত্বপূর্ণ তা বুঝতে না পারা।",
      solutionTitle: "সুনির্দিষ্ট ও স্ট্রাকচার্ড কভারেজ",
      solutionDesc: "ডিফেন্স ও বিষয়ভিত্তিক কোয়েশ্চেন ব্যাংক এনালাইসিস করে তৈরি চ্যাপ্টার-বাই-চ্যাপ্টার ফোকাসড লেকচার ও রিভিশন নোট।",
    },
    {
      problemTitle: "পরীক্ষা না দেওয়ার প্রবণতা",
      problemDesc: "শুধু লেকচার দেখে বা অফলাইনে অগোছালো ক্লাসে গিয়ে রিয়েল-টাইম টাইমার ছাড়া প্রস্তুতি নেওয়ায় ভীতি কাটানো যায় না।",
      solutionTitle: "ডেইলি OMR ও CBT টেস্ট ড্রিল",
      solutionDesc: "প্রতিদিন ১০০ মার্কসের টাইমার চালিত অনলাইন ও অফলাইন ওএমআর পরীক্ষা সহ সাথে সাথে নেগেটিভ মার্কিং রিপোর্ট ও র‍্যাঙ্ক।",
    },
    {
      problemTitle: "ডাউট ও অজানা প্রশ্ন জমে থাকা",
      problemDesc: "কোচিং ক্লাসে ৫০০ মানুষের ভিড়ে টিচারের কাছে প্রশ্ন করতে না পারা বা ব্যক্তিগত সমস্যার সমাধান না পাওয়া।",
      solutionTitle: "১-অন-১ পার্সোনালাইজড মেন্টরশিপ",
      solutionDesc: "অবসরপ্রাপ্ত ডিফেন্স অফিসার ও বুয়েট মেন্টরদের সরাসরি ১-অন-১ লাইভ ডাউট ক্লিয়ারিং ও টেলিগ্রাম প্রিমিয়াম চ্যানেল সাপোর্ট।",
    },
  ];

  return (
    <section className="py-16 sm:py-20 relative bg-gradient-to-b from-[#07182E] via-[#0A1D36] to-[#07182E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (From Top) */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>ভর্তি যুদ্ধের সাধারণ ভুল বনাম দুর্বার সমাধান</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            কেন সাধারণ কোচিংয়ে পড়লেও <span className="text-red-400">সাফল্য আসে না?</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            অগোছালো পড়ালেখা ও সঠিক শৃঙ্খলার অভাবই ৮০% শিক্ষার্থীর ব্যর্থতার মূল কারণ। দুর্বার একাডেমি তোমার প্রতিটি দুর্বলতাকে চিহ্নিত করে সেটিকে শক্তিতে রূপান্তর করে।
          </p>
        </motion.div>

        {/* Comparison Cards Grid */}
        <div className="space-y-6">
          {comparisons.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20"
              >
                {/* Problem Side (Alternating Left/Right) */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-[#121B2A]/90 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-red-500/15 flex gap-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      সাধারণ সমস্যা #{index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white">{item.problemTitle}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.problemDesc}
                    </p>
                  </div>
                </motion.div>

                {/* Solution Side (Opposite direction) */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-gradient-to-br from-[#0E2847] to-[#0A223E] p-6 sm:p-8 flex gap-4 border-l-0 lg:border-l border-emerald-500/20"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        দুর্বার একাডেমি শৃঙ্খলাবদ্ধ সমাধান
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.solutionTitle}</h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {item.solutionDesc}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
