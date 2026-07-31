"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export default function FAQSection() {
  const faqData = [
    {
      id: "faq-01",
      question: "দুর্বার একাডেমির ডিফেন্স ও মিলিটারি কোর্সগুলো কীভাবে পরিচালিত হয়?",
      answer:
        "সাবেক ডিফেন্স অফিসারদের গাইডলাইনে লিখিত, আইকিউ টেস্ট, পিপিডিটি, আইএসএসবি সাইকোমেট্রিক ড্রিল এবং স্বাস্থ্য পরামর্শ সেশনের মাধ্যমে পরিচালিত হয়।",
    },
    {
      id: "faq-02",
      question: "কাদের জন্য দুর্বার একাডেমির কোর্সগুলো?",
      answer:
        "যেসব শিক্ষার্থী বাংলাদেশ বিমান বাহিনী, নৌবাহিনী, সেনাবাহিনী (BAFA, BMA, BN, ISSB) অফিসার ক্যাডেট হিসাবে নির্বাচিত হতে চান তাদের জন্য বিশেষায়িত।",
    },
    {
      id: "faq-03",
      question: "কোর্সে কি নিয়মিত OMR পরীক্ষা ও সাইকোমেট্রিক টেস্ট থাকবে?",
      answer:
        "হ্যাঁ। প্রতিদিন ওএমআর ভিত্তিক ও অনলাইন সিবিটি পরীক্ষা, আইকিউ ড্রিল এবং আইএসএসবি স্পেশাল মক টেস্ট থাকবে।",
    },
    {
      id: "faq-04",
      question: "ফ্রি ওরিয়েন্টেশন ক্লাস বা ট্রায়াল সেশন আছে কি?",
      answer:
        "হ্যাঁ! প্রতি নতুন ব্যাচ শুরুর পূর্বে ফ্রি ওরিয়েন্টেশন এবং স্কিল অ্যাসেসমেন্ট টেস্ট ড্রিল সুবিধা রয়েছে।",
    },
    {
      id: "faq-05",
      question: "ক্লাসগুলো অনলাইন নাকি অফলাইন?",
      answer:
        "দুর্বার একাডেমির হাইব্রিড মডেলে অনলাইন লাইভ ক্লাস ও আমাদের ঢাকা/চট্টগ্রাম/রাজশাহী শাখায় অফলাইন টেস্ট ও আইএসএসবি মক গাইডেন্স দুটিই রয়েছে।",
    },
  ];

  const [openFaq, setOpenFaq] = useState<string | null>("faq-01");

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-20 lg:py-28 relative bg-[#07182E] overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[#F59E0B]/5 blur-[140px] pointer-events-none rounded-full" />

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
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-black tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-[2px]" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
            <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-[2px]" />
          </div>

          {/* Main Bengali Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25]">
            সচরাচর <span className="gold-gradient-text">জিজ্ঞাসা</span>
          </h2>
        </motion.div>

        {/* Centered Accordion Container */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((faq, idx) => {
            const isOpen = openFaq === faq.id;
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`bg-[#0D2038] border rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 shadow-xl faq-card ${
                  isOpen ? "border-[#F59E0B]/40 bg-[#0E2440] faq-card-open" : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Accessible Button Header */}
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 font-bold text-white hover:text-[#F59E0B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 rounded-2xl sm:rounded-3xl"
                >
                  <span className="text-base sm:text-lg font-bold leading-snug">
                    {faq.question}
                  </span>

                  {/* Controls (+ / -) */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      isOpen
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 rotate-180"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                    }`}
                  >
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>

                {/* Collapsible Answer Body */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      role="region"
                      className="px-6 sm:px-7 pb-6 pt-3 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-white/5 bg-[#091A2E]/80 faq-answer-box"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
