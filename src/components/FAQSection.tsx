"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle, Sparkles } from "lucide-react";

export default function FAQSection() {
  const faqData = [
    {
      id: "faq-01",
      question: "দুর্বার একাডেমির ক্লাস কীভাবে পরিচালিত হয়?",
      answer:
        "আমাদের কোর্স অনুযায়ী অভিজ্ঞ মেন্টরদের মাধ্যমে পরিকল্পিত ক্লাস, নিয়মিত অনুশীলন, মূল্যায়ন এবং ব্যক্তিগত ফিডব্যাক প্রদান করা হয়।",
    },
    {
      id: "faq-02",
      question: "কাদের জন্য দুর্বার একাডেমির কোর্সগুলো?",
      answer:
        "যেসব শিক্ষার্থী পরিকল্পিত প্রস্তুতি, নিয়মিত মেন্টরশিপ এবং নিজের দুর্বলতা অনুযায়ী উন্নতি করতে চান, তাদের জন্য আমাদের কোর্সগুলো তৈরি করা হয়েছে।",
    },
    {
      id: "faq-03",
      question: "কোর্সে কি নিয়মিত পরীক্ষা থাকবে?",
      answer:
        "হ্যাঁ। কোর্সভেদে কুইজ, প্র্যাকটিস টেস্ট, মডেল টেস্ট এবং পূর্ণাঙ্গ মক পরীক্ষা থাকবে।",
    },
    {
      id: "faq-04",
      question: "ফ্রি ক্লাস বা ডেমো সেশন আছে কি?",
      answer:
        "নির্বাচিত কোর্সে ফ্রি ওরিয়েন্টেশন, ডেমো ক্লাস বা প্রস্তুতি সেশন রাখা হবে।",
    },
    {
      id: "faq-05",
      question: "ক্লাসগুলো অনলাইন নাকি অফলাইন?",
      answer:
        "কোর্স অনুযায়ী অনলাইন, অফলাইন অথবা হাইব্রিড ব্যবস্থা থাকতে পারে। প্রতিটি কোর্সের বিস্তারিত পেজে ক্লাসের ধরন উল্লেখ থাকবে।",
    },
  ];

  // FAQ 01 expanded by default
  const [openFaq, setOpenFaq] = useState<string | null>("faq-01");

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-20 lg:py-28 relative bg-[#07182E] overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[#F59E0B]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          
          {/* Eyebrow with Golden Yellow Accent & Square Badges */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-black tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-[2px]" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
            <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-[2px]" />
          </div>

          {/* Main Bengali Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25]">
            সচরাচর <span className="gold-gradient-text">জিজ্ঞাসা</span>
          </h2>
        </div>

        {/* Centered Accordion Container (Max-Width ~800px) */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((faq) => {
            const isOpen = openFaq === faq.id;

            return (
              <div
                key={faq.id}
                className={`bg-[#0D2038] border rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 shadow-xl ${
                  isOpen ? "border-[#F59E0B]/40 bg-[#0E2440]" : "border-white/10 hover:border-white/20"
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

                  {/* Green Accent Controls (+ / -) */}
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
                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    className="px-6 sm:px-7 pb-6 pt-1 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-white/5 bg-[#091A2E]/80 animate-fade-in"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
