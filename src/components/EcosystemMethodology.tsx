"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, Zap, Laptop, FileSpreadsheet, Headphones, ArrowRight, Award } from "lucide-react";

export default function EcosystemMethodology() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 0,
      number: "০১",
      title: "কনসেপ্ট বিল্ডিং ও স্মার্ট লাইভ ক্লাস",
      subtitle: "মুখস্থ নয়, ফিজিক্স ও ম্যাথের বাস্তবধর্মী অ্যানালিটিক্যাল শিখন",
      icon: Laptop,
      details: [
        "বুয়েট ও ডিএমসির অভিজ্ঞ টপ র‍্যাঙ্কারদের রিয়েল-টাইম ইন্টারেক্টিভ ক্লাস",
        "এইচডি ডিজিটাল হোয়াইটবোর্ডে প্রতিটি সূত্রের ডেরিভেশন ও ভিজ্যুয়াল সলভিং",
        "লাইভ ক্লাসেই যেকোনো না বোঝা লাইনের তাৎক্ষণিক উত্তর ও ক্লারিফিকেশন",
        "ক্লাস শেষ হতেই অটো-জেনারেটেড এইচডি পিডিএফ লেকচার নোট ফাইল ডাউনলোড",
      ],
      tag: "ধাপ ১: কনসেপ্ট ক্লিয়ারিং",
    },
    {
      id: 1,
      number: "০২",
      title: "ডেইলি OMR ও সিবিটি অনলাইন ড্রিল",
      subtitle: "টাইমার চালিত রিয়েল-টাইম পরীক্ষা ও নেগেটিভ মার্কিং রিপোর্ট",
      icon: FileSpreadsheet,
      details: [
        "প্রতিটি ক্লাসের পরদিনই ৫০-১০০ মার্কসের স্পেশাল ওএমআর মোড টেস্ট",
        "ভুল উত্তরের জন্য নিখুঁত নেগেটিভ মার্কিং পয়েন্ট সিস্টেম ও ব্যাখ্যার শিট",
        "অল-বাংলাদেশ রিয়েল-টাইম মেরিট লিস্ট এবং বিষয়ভিত্তিক পারফরম্যান্স সামারি",
        "অফলাইন শাখায় সশরীরে ওএমআর শিট সাবমিশন ও কম্পিউটার স্ক্যানিং",
      ],
      tag: "ধাপ ২: প্র্যাকটিস ও অ্যাসেসমেন্ট",
    },
    {
      id: 2,
      number: "০৩",
      title: "১-অন-১ লাইভ ডাউট সলভ ও মেন্টরিং",
      subtitle: "একটি প্রশ্নও যেন না জমে থাকে, ২৪/৭ পার্সোনাল মেন্টর সাপোর্ট",
      icon: Headphones,
      details: [
        "প্রশ্নের ছবি বা নোট পাঠালেই ২ মিনিটের মধ্যে বুয়েটিয়ানদের সমাধান",
        "পরীক্ষায় কম নম্বর পাওয়ার কারণ চিহ্নিত করে পার্সোনালাইজড দিকনির্দেশনা",
        "মানসিক চাপ জয় করা ও ভর্তি পরীক্ষার সঠিক স্ট্র্যাটেজি গাইডেন্স",
        "অফলাইন মেন্টরিং আওয়ারে সশরীরে টিচারদের সাথে আলোচনার সুযোগ",
      ],
      tag: "ধাপ ৩: পার্সোনালাইজড সাপোর্ট",
    },
  ];

  return (
    <section id="ecosystem" className="py-16 sm:py-24 relative bg-gradient-to-b from-[#07182E] via-[#0B213B] to-[#07182E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>দুর্বার লার্নিং মেথডোলজি</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            যে ৩-ধাপে আমরা নিশ্চিত করি <span className="gold-gradient-text">তোমার ভর্তি সাফল্য</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            শুধু পড়ালেই হয় না, নিয়মিত মূল্যায়ন এবং সার্বক্ষণিক তত্ত্বাবধানই এনে দেয় স্বপ্নের ভার্সিটির মেধা তালিকার প্রথম সারি।
          </p>
        </div>

        {/* Step Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`p-6 rounded-3xl text-left transition-all duration-300 relative border overflow-hidden ${
                  isActive
                    ? "bg-[#142C4B] border-[#F59E0B] shadow-2xl gold-glow active-step-card"
                    : "bg-[#0D2038] border-white/10 hover:border-white/20 hover:bg-[#102744]"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-2xl font-extrabold ${isActive ? "text-[#F59E0B] active-step-text-white" : "text-slate-500"}`}>
                    {step.number}
                  </span>
                  <div className={`p-3 rounded-2xl ${isActive ? "bg-[#F59E0B] text-black" : "bg-white/5 text-slate-300"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className={`text-lg font-bold mb-1 ${isActive ? "text-white active-step-text-white" : "text-white"}`}>{step.title}</h3>
                <p className={`text-xs ${isActive ? "text-slate-200 active-step-text-white" : "text-slate-400"}`}>{step.subtitle}</p>

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F59E0B] to-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed View Box */}
        <div className="rounded-3xl bg-[#0D2038] border border-white/10 p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Content Details */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-full border border-[#F59E0B]/30">
                {steps[activeStep].tag}
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {steps[activeStep].title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {steps[activeStep].subtitle}
              </p>

              <div className="space-y-3 pt-2">
                {steps[activeStep].details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <a
                  href="#courses"
                  className="px-6 py-3 text-xs font-bold text-black bg-[#F59E0B] rounded-xl hover:bg-[#FACC15] transition-all flex items-center gap-2"
                >
                  <span>কোর্সে যুক্ত হোন</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Visual Graphic Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 p-2 bg-[#163255] shadow-xl">
                <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
                  <Image
                    src="/images/instructor_teaching.png"
                    alt="দুর্বার একাডেমি ইন্সট্রাক্টর"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07182E] via-transparent to-transparent opacity-70" />
                  
                  <div className="absolute bottom-4 left-4 right-4 bg-[#07182E]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-3">
                    <Award className="w-8 h-8 text-[#F59E0B] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">সরাসরি বুয়েট ও মেডিকেল টিচার্স</span>
                      <span className="text-[10px] text-slate-300">প্রতিটি কনসেপ্টের ডিপ অ্যানালাইসিস</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
