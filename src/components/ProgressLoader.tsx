"use client";

import { useState, useEffect } from "react";
import { Loader2, Database, ShieldCheck } from "lucide-react";

interface ProgressLoaderProps {
  label?: string;
  onComplete?: () => void;
}

export default function ProgressLoader({ label = "ডাটাবেজ থেকে তথ্য লোড হচ্ছে...", onComplete }: ProgressLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += Math.floor(Math.random() * 15) + 8;
      if (start >= 100) {
        start = 100;
        setProgress(100);
        clearInterval(interval);
        if (onComplete) onComplete();
      } else {
        setProgress(start);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl max-w-md mx-auto my-8 animate-fade-in">
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[#F59E0B]/20 animate-ping" />
        <div className="w-20 h-20 rounded-full bg-[#07182E] border-2 border-[#F59E0B] flex items-center justify-center shadow-xl">
          <Database className="w-8 h-8 text-[#F59E0B] animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-extrabold text-white leading-snug">{label}</h3>
        <p className="text-xs text-slate-300">
          লাইভ ডাটাবেজ থেকে রিয়েল-টাইম তথ্য সিঙ্ক করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...
        </p>
      </div>

      {/* Progress Bar & Percentage Counter (0% -> 100%) */}
      <div className="space-y-2 max-w-xs mx-auto">
        <div className="flex justify-between items-center text-xs font-black">
          <span className="text-slate-400">লাইভ ডাটা লোডিং:</span>
          <span className="text-[#FACC15] font-mono text-sm">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-[#07182E] rounded-full p-0.5 border border-white/10 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] rounded-full transition-all duration-200 shadow-md"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>দুর্বার একাডেমী অফিসিয়াল ডাটাবেজ কনেকশন</span>
      </div>
    </div>
  );
}
