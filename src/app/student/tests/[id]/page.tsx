"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, Award, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function StudentCBTPlayer() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(1800); // 30 minutes
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      id: "q1",
      questionText: "একটি সমকোণী ত্রিভুজের অতিভুজ ১০ সেমি এবং ভূমি ৮ সেমি হলে এর ক্ষেত্রফল কত বর্গ সেমি?",
      options: [
        { id: "o1a", text: "২৪" },
        { id: "o1b", text: "৩০" },
        { id: "o1c", text: "৪৮" },
        { id: "o1d", text: "৪০" },
      ],
      correctOptionId: "o1a",
      marks: 5,
    },
    {
      id: "q2",
      questionText: "কোনো বল দ্বারা সম্পন্ন কাজের পরিমাণ সর্বাধিক হয় যখন বল ও সরণের মধ্যবর্তী কোণ কত হয়?",
      options: [
        { id: "o2a", text: "০°" },
        { id: "o2b", text: "৯০°" },
        { id: "o2c", text: "১৮০°" },
        { id: "o2d", text: "৪৫°" },
      ],
      correctOptionId: "o2a",
      marks: 5,
    },
  ];

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const handleOptionSelect = (optionId: string) => {
    const qId = questions[currentQuestionIndex].id;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionId,
    }));
  };

  const handleSubmit = () => {
    let finalScore = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionId) {
        finalScore += q.marks;
      }
    });
    setScore(finalScore);
    setIsSubmitted(true);
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex flex-col">
      {/* Header Bar */}
      <header className="bg-[#0D2038] border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="p-2 rounded-xl bg-[#07182E] hover:bg-white/5 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white">পদার্থবিজ্ঞান ও উচ্চতর গণিত ফাইনাল মক টেস্ট</h1>
            <span className="text-[10px] text-[#FACC15] font-extrabold uppercase tracking-wider block">
              Computer Based Test (CBT)
            </span>
          </div>
        </div>

        {!isSubmitted && (
          <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 px-4 py-2 rounded-xl text-red-400 font-mono text-sm font-bold">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>অবশিষ্ট সময়: {formatTime(secondsLeft)}</span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        
        {!isSubmitted ? (
          <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            
            {/* Question Header Info */}
            <div className="flex justify-between text-xs text-slate-400">
              <span>প্রশ্ন {currentQuestionIndex + 1} / {questions.length}</span>
              <span>পূর্ণমান: {questions[currentQuestionIndex].marks}</span>
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {questions[currentQuestionIndex].questionText}
            </h2>

            {/* Options list */}
            <div className="space-y-3 pt-2">
              {questions[currentQuestionIndex].options.map((opt) => {
                const qId = questions[currentQuestionIndex].id;
                const isSelected = selectedAnswers[qId] === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                      isSelected
                        ? "bg-[#163255] border-[#F59E0B] text-[#F59E0B] shadow-lg"
                        : "bg-[#07182E] border-white/10 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 border border-white/10 rounded-xl disabled:opacity-30"
              >
                পূর্ববর্তী
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl flex items-center gap-1"
                >
                  <span>পরবর্তী</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 text-xs font-bold text-black bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl"
                >
                  পরীক্ষা জমা দিন
                </button>
              )}
            </div>

          </div>
        ) : (
          /* Result Summary */
          <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">পরীক্ষা সফলভাবে সম্পন্ন হয়েছে!</h3>
              <p className="text-xs text-slate-300">
                আপনার স্কোর বিশ্লেষণ পর্যালোচনা করা হচ্ছে।
              </p>
            </div>

            <div className="bg-[#07182E] p-6 rounded-2xl border border-white/10 max-w-sm mx-auto text-left space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">মোট প্রশ্ন:</span>
                <span className="text-white font-bold">{questions.length} টি</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">অর্জিত নম্বর:</span>
                <span className="text-emerald-400 font-bold">{score} / ১০</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ফলাফল:</span>
                <span className="text-[#FACC15] font-bold">উত্তীর্ণ</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/student/dashboard"
                className="w-full py-3.5 text-xs font-bold text-slate-950 bg-[#F59E0B] rounded-xl hover:bg-[#FACC15] block text-center"
              >
                ড্যাশবোর্ডে ফিরে যান
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
