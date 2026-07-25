"use client";

import { useState } from "react";
import { Sparkles, HelpCircle, CheckCircle2, RotateCcw, ArrowRight, Award } from "lucide-react";

interface ReadinessQuizProps {
  onOpenRegisterModal: (courseId?: string) => void;
}

export default function ReadinessQuiz({ onOpenRegisterModal }: ReadinessQuizProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [target, setTarget] = useState<string>("");
  const [weakness, setWeakness] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleComplete = () => {
    setIsCompleted(true);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setTarget("");
    setWeakness("");
    setHours("");
    setIsCompleted(false);
  };

  return (
    <section id="readiness-quiz" className="py-16 sm:py-24 relative bg-gradient-to-b from-[#07182E] via-[#0A1F38] to-[#07182E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>অ্যাডমিশন প্রস্তুতি ডায়াগনস্টিক কুইজ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ৩০ সেকেন্ডে যাচাই করো তোমার <span className="gold-gradient-text">অ্যাডমিশন প্রস্তুতি</span>
          </h2>
          <p className="text-sm text-slate-300">
            ৩টি সহজ প্রশ্নের উত্তর দাও এবং জেনে নাও তোমার জন্য উপযোগী ভর্তি স্ট্র্যাটেজি ও সঠিক ব্যাচ।
          </p>
        </div>

        {/* Quiz Container */}
        <div className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {!isCompleted ? (
            <div className="space-y-8">
              
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>প্রশ্ন {currentStep} / ৩</span>
                <span className="text-[#F59E0B] font-bold">
                  {currentStep === 1 ? "৩৩%" : currentStep === 2 ? "৬৬%" : "১০০%"} সম্পন্ন
                </span>
              </div>
              <div className="w-full h-2 bg-[#07182E] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F59E0B] transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>

              {/* Step 1 Question */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">
                    ১. তোমার প্রধান ভর্তি পরীক্ষার লক্ষ্য কী?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "buet", label: "ইঞ্জিনিয়ারিং (BUET / CKRUET)" },
                      { id: "medical", label: "মেডিকেল ও ডেন্টাল (DMC Target)" },
                      { id: "du", label: "ঢাকা বিশ্ববিদ্যালয় (DU A-Unit)" },
                      { id: "hsc", label: "এইচএসসি পরীক্ষা ২০২৫/২০২৬" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setTarget(opt.label);
                          setCurrentStep(2);
                        }}
                        className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all ${
                          target === opt.label
                            ? "bg-[#142C4B] border-[#F59E0B] text-white"
                            : "bg-[#07182E] border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 Question */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">
                    ২. বর্তমানে কোন বিষয়ে তোমার সবচেয়ে বেশি ভয় বা দুর্বলতা রয়েছে?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "math", label: "উচ্চতর গণিত (Calculus & Trigonometry)" },
                      { id: "physics", label: "পদার্থবিজ্ঞান (Numerical Physics)" },
                      { id: "chemistry", label: "রসায়ন (Organic Chemistry)" },
                      { id: "biology", label: "জীববিজ্ঞান (Botany & Zoology Information)" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setWeakness(opt.label);
                          setCurrentStep(3);
                        }}
                        className="p-4 rounded-2xl bg-[#07182E] border border-white/10 hover:border-[#F59E0B] text-left text-sm font-semibold text-slate-300 hover:text-white transition-all"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 Question */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">
                    ৩. দৈনিক কত ঘণ্টা শৃঙ্খলাবদ্ধভাবে পড়াশোনা ও OMR পরীক্ষা দিতে প্রস্তুত?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: "h1", label: "৪ - ৬ ঘণ্টা" },
                      { id: "h2", label: "৬ - ৮ ঘণ্টা (আইডিয়াল)" },
                      { id: "h3", label: "৮+ ঘণ্টা (ফুল ডেডিকেশন)" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setHours(opt.label);
                          handleComplete();
                        }}
                        className="p-4 rounded-2xl bg-[#07182E] border border-white/10 hover:border-[#F59E0B] text-center text-sm font-semibold text-slate-300 hover:text-white transition-all"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Result Card */
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <Award className="w-8 h-8" />
              </div>

              <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider bg-[#F59E0B]/10 px-3 py-1 rounded-full border border-[#F59E0B]/30">
                ডায়াগনস্টিক রিপোর্ট প্রস্তুত!
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                তোমার সম্ভাব্য প্রস্তুতি স্কোর: <span className="text-emerald-400">৮৮%</span>
              </h3>

              <div className="bg-[#07182E] p-6 rounded-2xl border border-white/10 max-w-lg mx-auto text-left space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">লক্ষ্য:</span>
                  <span className="text-white font-bold">{target || "ইঞ্জিনিয়ারিং (BUET)"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">ফোকাস বিষয়:</span>
                  <span className="text-[#F59E0B] font-bold">{weakness || "উচ্চতর গণিত"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">প্রস্তাবিত ব্যাচ:</span>
                  <span className="text-emerald-400 font-bold">দুর্বার ফোকাস ফ্ল্যাগশিপ ব্যাচ ০৪</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => onOpenRegisterModal()}
                  className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold text-black bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl shadow-lg gold-glow transition-all flex items-center justify-center gap-2"
                >
                  <span>প্রস্তাবিত কোর্সে ভর্তি হোন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 border border-white/10 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>পুনরায় কুইজ দিন</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
