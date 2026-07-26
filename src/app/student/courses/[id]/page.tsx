"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, FileText, CheckCircle2, ChevronRight, Lock, Sparkles } from "lucide-react";

export default function StudentCoursePlayer() {
  const [activeVideo, setActiveVideo] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [activeLessonTitle, setActiveLessonTitle] = useState("ক্যালকুলাস বেসিক কনসেপ্ট ও সীমা");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const syllabus = [
    {
      milestone: "মাইলস্টোন ০১: ক্যালকুলাস ও ফাংশন মাস্টারি",
      modules: [
        {
          title: "মডিউল ০১: লিমিট ও অন্তরীকরণ",
          lessons: [
            { id: "l1", title: "ক্যালকুলাস বেসিক কনসেপ্ট ও সীমা", video: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "২৫ মি.", locked: false },
            { id: "l2", title: "ফাংশনের ধারাবাহিকতা ও অবিচ্ছিন্নতা", video: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "৩০ মি.", locked: false },
            { id: "l3", title: "অन्तरীকরণের মূল সূত্র ও প্রয়োগ", video: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "৪০ মি.", locked: false },
          ],
        },
      ],
    },
    {
      milestone: "মাইলস্টোন ০২: ইন্টিগ্রেশন ও ম্যাট্রিক্স",
      modules: [
        {
          title: "মডিউল ০২: যৌগীকরণ ও ক্ষেত্রফল",
          lessons: [
            { id: "l4", title: "যৌগীকরণের মেথড অফ সাবস্টিটিউশন", video: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "৩৫ মি.", locked: true },
          ],
        },
      ],
    },
  ];

  const handleLessonClick = (lesson: any) => {
    if (lesson.locked) return;
    setActiveVideo(lesson.video);
    setActiveLessonTitle(lesson.title);
  };

  const toggleComplete = (id: string) => {
    setCompletedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
            <h1 className="text-sm sm:text-base font-bold text-white">বুয়েট ও সিকেআরইউইটি স্পেশাল ভর্তি প্রস্তুতি</h1>
            <span className="text-[10px] text-[#FACC15] font-extrabold uppercase tracking-wider block">
              Durbar Learning Portal
            </span>
          </div>
        </div>
        <div className="text-xs text-[#FACC15] font-bold">
          {completedLessons.length} / ৪ টি লেকচার সম্পন্ন
        </div>
      </header>

      {/* Grid Player Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Video Player Column */}
        <div className="lg:col-span-8 p-4 sm:p-6 space-y-4">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl">
            <iframe
              src={activeVideo}
              title={activeLessonTitle}
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              <span>{activeLessonTitle}</span>
            </h2>
            <p className="text-xs text-slate-400">
              মেন্টরের সাথে প্রতিটি কনসেপ্ট বুঝুন এবং লেকচার শিট ডাউনলোড করে নোট সম্পন্ন করুন।
            </p>
            <div className="pt-3 border-t border-white/5 flex gap-3">
              <button
                onClick={() => alert("লেকচার শিট ডাউনলোড প্রস্তুত হচ্ছে...")}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-[#F59E0B]" />
                <span>লেকচার শিট PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Modules & Lessons Navigation */}
        <div className="lg:col-span-4 border-l border-white/10 bg-[#0A1A2E] overflow-y-auto p-4 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">সিলেবাস কভারেজ</h3>

          <div className="space-y-4">
            {syllabus.map((milestone, mIdx) => (
              <div key={mIdx} className="space-y-2">
                <span className="text-xs font-extrabold text-[#FACC15] block">
                  {milestone.milestone}
                </span>

                {milestone.modules.map((mod, modIdx) => (
                  <div key={modIdx} className="bg-[#0D2038] border border-white/5 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>{mod.title}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </h4>

                    <div className="space-y-2">
                      {mod.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs border ${
                              lesson.locked
                                ? "bg-black/10 border-white/5 opacity-55 cursor-not-allowed"
                                : "bg-[#07182E] border-white/10 hover:border-[#F59E0B]/30 cursor-pointer"
                            }`}
                          >
                            <div
                              onClick={() => handleLessonClick(lesson)}
                              className="flex items-center gap-2.5 flex-1"
                            >
                              {lesson.locked ? (
                                <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                              ) : (
                                <Play className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              <div className="text-left">
                                <span className="font-bold text-white block">{lesson.title}</span>
                                <span className="text-[10px] text-slate-400 block">{lesson.duration}</span>
                              </div>
                            </div>

                            {!lesson.locked && (
                              <button
                                onClick={() => toggleComplete(lesson.id)}
                                className={`p-1.5 rounded-lg border ${
                                  isCompleted
                                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                    : "bg-white/5 border-white/10 text-slate-500"
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
