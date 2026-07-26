"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Play, Sparkles, BookOpen, Check } from "lucide-react";

export default function TeacherCourseEditor() {
  const [syllabus, setSyllabus] = useState<any[]>([
    {
      id: "m1",
      milestone: "মাইলস্টোন ০১: ক্যালকুলাস ও ফাংশন মাস্টারি",
      modules: [
        {
          id: "mod1",
          title: "মডিউল ০১: লিমিট ও অন্তরীকরণ",
          lessons: [
            { id: "l1", title: "ক্যালকুলাস বেসিক কনসেপ্ট ও সীমা", video: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "২৫ মি." },
          ],
        },
      ],
    },
  ]);

  const [activeTab, setActiveTab] = useState<"syllabus" | "quizzes">("syllabus");

  // New Lesson form states
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonVideo, setNewLessonVideo] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState("");

  // Quiz maker states
  const [quizzes, setQuizzes] = useState<any[]>([
    { id: "q1", title: "পদার্থবিজ্ঞান ১ম পত্র মক টেস্ট", questions_count: 5 },
  ]);
  const [newQuizTitle, setNewQuizTitle] = useState("");

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle || !newLessonVideo) return;

    setSyllabus((prev) => {
      const updated = [...prev];
      updated[0].modules[0].lessons.push({
        id: Date.now().toString(),
        title: newLessonTitle,
        video: newLessonVideo,
        duration: newLessonDuration || "৩০ মি.",
      });
      return updated;
    });

    setNewLessonTitle("");
    setNewLessonVideo("");
    setNewLessonDuration("");
  };

  const handleAddQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle) return;

    setQuizzes((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newQuizTitle, questions_count: 0 },
    ]);
    setNewQuizTitle("");
  };

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex flex-col">
      {/* Header Bar */}
      <header className="bg-[#0D2038] border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/dashboard"
            className="p-2 rounded-xl bg-[#07182E] hover:bg-white/5 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white">কোর্স কারিকুলাম ও কন্টেন্ট ম্যানেজার</h1>
            <span className="text-[10px] text-[#FACC15] font-extrabold uppercase tracking-wider block">
              Curriculum Builder & CBT Quiz Engine
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("syllabus")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "syllabus" ? "bg-[#F59E0B] text-black" : "bg-white/5 border border-white/10 text-slate-300"
            }`}
          >
            সিলেবাস কন্টেন্ট
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "quizzes" ? "bg-[#F59E0B] text-black" : "bg-white/5 border border-white/10 text-slate-300"
            }`}
          >
            কুইজ ও এক্সাম
          </button>
        </div>
      </header>

      {/* Main Form/Grid Arena */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {activeTab === "syllabus" ? (
          <>
            {/* Left Column: Syllabus Structure Viewer */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FACC15]" />
                <span>সিলেবাস আউটলাইন</span>
              </h2>

              <div className="space-y-4">
                {syllabus.map((milestone: any) => (
                  <div key={milestone.id} className="space-y-3">
                    <span className="text-xs font-extrabold text-[#FACC15] block">
                      {milestone.milestone}
                    </span>

                    {milestone.modules.map((mod: any) => (
                      <div key={mod.id} className="bg-[#0D2038] border border-white/10 rounded-2xl p-5 space-y-4">
                        <h4 className="text-sm font-bold text-white">{mod.title}</h4>

                        <div className="space-y-2">
                          {mod.lessons.map((lesson: any) => (
                            <div
                              key={lesson.id}
                              className="bg-[#07182E] p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <Play className="w-4 h-4 text-emerald-400" />
                                <div>
                                  <span className="font-bold text-white block">{lesson.title}</span>
                                  <span className="text-[10px] text-slate-400 block">{lesson.duration} | {lesson.video}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setSyllabus((prev) => {
                                    const updated = [...prev];
                                    updated[0].modules[0].lessons = updated[0].modules[0].lessons.filter((l: any) => l.id !== lesson.id);
                                    return updated;
                                  });
                                }}
                                className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: New Lesson Append Form */}
            <div className="lg:col-span-5 bg-[#0D2038] border border-white/10 rounded-3xl p-6 h-fit space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F59E0B]" />
                <span>নতুন লেকচার/ভিডিও যুক্ত করুন</span>
              </h3>

              <form onSubmit={handleAddLesson} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">লেকচারের শিরোনাম:*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: অন্তরীকরণের গাণিতিক সমস্যা"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">ইউটিউব ভিডিও লিঙ্ক (Embed URL):*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: https://www.youtube.com/embed/..."
                    value={newLessonVideo}
                    onChange={(e) => setNewLessonVideo(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">সময়কাল (মিনিট):</label>
                  <input
                    type="text"
                    placeholder="যেমন: ৩০ মি."
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-slate-950 bg-[#F59E0B] rounded-xl hover:bg-[#FACC15]"
                >
                  সিলেবাসে যুক্ত করুন
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            {/* CBT Exam Drafts viewer */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FACC15]" />
                <span>কুইজ খসড়া ও টেস্ট তালিকা</span>
              </h2>

              <div className="space-y-3">
                {quizzes.map((quiz: any) => (
                  <div
                    key={quiz.id}
                    className="bg-[#0D2038] p-4 rounded-xl border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block mb-0.5">{quiz.title}</span>
                      <span className="text-slate-400 block">• প্রশ্ন সংখ্যা: {quiz.questions_count} টি</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert("কুইজ এডিটর লোড হচ্ছে...")}
                        className="px-3 py-1.5 bg-[#07182E] hover:bg-white/5 border border-white/10 rounded font-semibold text-slate-300"
                      >
                        প্রশ্ন এডিট
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create New CBT Quiz Form */}
            <div className="lg:col-span-5 bg-[#0D2038] border border-white/10 rounded-3xl p-6 h-fit space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F59E0B]" />
                <span>নতুন মক টেস্ট তৈরি করুন</span>
              </h3>

              <form onSubmit={handleAddQuiz} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">টেস্টের শিরোনাম:*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: রসায়ন সংকরায়ণ স্পেশাল কুইজ"
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-slate-950 bg-[#F59E0B] rounded-xl hover:bg-[#FACC15]"
                >
                  টেস্ট তৈরি করুন
                </button>
              </form>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
