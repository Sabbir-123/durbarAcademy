"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  FileText,
  CheckCircle2,
  ChevronRight,
  Lock,
  Sparkles,
  BookOpen,
  Video,
  Layers,
  HelpCircle,
  Check,
  X,
  Award,
} from "lucide-react";
import { Course } from "@/data/courses";
import { getStoredCourses, syncCoursesFromSupabase } from "@/utils/courseStore";
import {
  Batch,
  Milestone,
  CourseModule,
  ClassLesson,
  TestItem,
  getBatches,
  getMilestones,
  getModules,
  getClasses,
  toYouTubeEmbedUrl,
  subscribeClassStore,
} from "@/utils/classStore";

interface DynamicLesson {
  id: string;
  title: string;
  description?: string;
  video: string;
  duration: string;
  locked: boolean;
  tests?: TestItem[];
}

interface DynamicModule {
  id: string;
  title: string;
  lessons: DynamicLesson[];
}

interface DynamicMilestone {
  id: string;
  milestone: string;
  modules: DynamicModule[];
}

export default function StudentCoursePlayer({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseIdFromRoute = resolvedParams?.id || "";

  const [course, setCourse] = useState<Course | null>(null);
  const [syllabus, setSyllabus] = useState<DynamicMilestone[]>([]);
  const [activeVideo, setActiveVideo] = useState<string>("");
  const [activeLessonTitle, setActiveLessonTitle] = useState<string>("");
  const [activeLessonDescription, setActiveLessonDescription] = useState<string>("");
  const [activeLessonTests, setActiveLessonTests] = useState<TestItem[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const loadData = async () => {
    // 1. Find matched course
    const allCourses = await syncCoursesFromSupabase();
    const localCourses = getStoredCourses();
    const pool = [...allCourses, ...localCourses];

    const matched =
      pool.find((c) => c.id === courseIdFromRoute || (c as any).slug === courseIdFromRoute) ||
      pool[0] ||
      null;

    setCourse(matched);

    const targetCourseId = matched?.id || courseIdFromRoute;

    // 2. Load classes uploaded from Teacher Panel via classStore
    let teacherBatches = getBatches(targetCourseId);
    if (teacherBatches.length === 0) {
      teacherBatches = getBatches(); // fallback to all batches if not course-specific
    }

    const structuredSyllabus: DynamicMilestone[] = [];

    if (teacherBatches.length > 0) {
      teacherBatches.forEach((batch) => {
        const batchMilestones = getMilestones(batch.id);
        batchMilestones.forEach((m) => {
          const mModules = getModules(m.id);
          const dynamicMods: DynamicModule[] = [];

          mModules.forEach((mod) => {
            const modClasses = getClasses(mod.id);
            const dynamicLessons: DynamicLesson[] = modClasses.map((c) => ({
              id: c.id,
              title: c.title,
              description: c.description,
              video: toYouTubeEmbedUrl(c.youtubeUrl),
              duration: `${c.durationMin || 30} মিনিট`,
              locked: false,
              tests: c.tests || [],
            }));

            if (dynamicLessons.length > 0) {
              dynamicMods.push({
                id: mod.id,
                title: mod.title,
                lessons: dynamicLessons,
              });
            }
          });

          if (dynamicMods.length > 0) {
            structuredSyllabus.push({
              id: m.id,
              milestone: `${m.title} (${batch.title})`,
              modules: dynamicMods,
            });
          }
        });
      });
    }

    // 3. Fallback default orientation syllabus if teacher hasn't added custom classes yet
    if (structuredSyllabus.length === 0) {
      const courseTitle = matched?.title || "ডিফেন্স অফিসারি ক্যাডেট স্পেশাল কোর্স";
      structuredSyllabus.push({
        id: "default-m1",
        milestone: `মাইলস্টোন ০১: ${courseTitle} ওরিয়েন্টেশন ও প্রাথমিক প্রিপারেশন`,
        modules: [
          {
            id: "default-mod1",
            title: "মডিউল ০১: কোর্স গাইডলাইন ও ভাইভা প্রেপারেশন",
            lessons: [
              {
                id: "def-l1",
                title: `${courseTitle} — ইন্ট্রোডাকশন ও ওরিয়েন্টেশন ক্লাস`,
                description: "দুর্বার একাডেমির মেন্টরদের পরিচালিত ওরিয়েন্টেশন ক্লাস। কোর্স প্ল্যান ও সিলেবাসের সম্পূর্ণ গাইডলাইন।",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                duration: "২৫ মিনিট",
                locked: false,
                tests: [
                  {
                    id: "t1",
                    type: "true_false",
                    question: "ডিফেন্স আইএসএসবি পরীক্ষায় মেডিকেল টেস্ট কি বাধ্যতামূলক?",
                    correctAnswer: "true",
                  },
                ],
              },
              {
                id: "def-l2",
                title: "ডিফেন্স ভাইভা ও আইকিউ টেস্ট স্ট্র্যাটেজি",
                description: "অফিসার ক্যাডেট ভাইভা ও আইকিউ টেস্টে সর্বোচ্চ সফলতার জন্য স্পেশাল টিপস ও ট্রিকস।",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                duration: "৩৫ মিনিট",
                locked: false,
              },
            ],
          },
        ],
      });
    }

    setSyllabus(structuredSyllabus);

    // Pick initial active video
    if (structuredSyllabus.length > 0) {
      const firstLesson = structuredSyllabus[0]?.modules[0]?.lessons[0];
      if (firstLesson) {
        setActiveVideo(firstLesson.video);
        setActiveLessonTitle(firstLesson.title);
        setActiveLessonDescription(firstLesson.description || "");
        setActiveLessonTests(firstLesson.tests || []);
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeClassStore(loadData);
    return unsub;
  }, [courseIdFromRoute]);

  const handleLessonClick = (lesson: DynamicLesson) => {
    if (lesson.locked) return;
    setActiveVideo(lesson.video);
    setActiveLessonTitle(lesson.title);
    setActiveLessonDescription(lesson.description || "");
    setActiveLessonTests(lesson.tests || []);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const toggleComplete = (id: string) => {
    setCompletedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Count total lectures
  let totalLecturesCount = 0;
  syllabus.forEach((m) =>
    m.modules.forEach((mod) => {
      totalLecturesCount += mod.lessons.length;
    })
  );

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-[#0D2038] border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/student/courses"
            className="p-2 rounded-xl bg-[#07182E] hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F59E0B]" />
              <span>{course?.title || "ডিফেন্স ও মিলিটারি কোর্স"}</span>
            </h1>
            <span className="text-[10px] text-[#FACC15] font-extrabold uppercase tracking-wider block">
              দুর্বার লার্নিং পোর্টাল • টিচার ক্লাস রুম
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#FACC15] font-bold px-3 py-1 bg-[#FACC15]/10 rounded-full border border-[#FACC15]/30">
            {completedLessons.length} / {totalLecturesCount} টি লেকচার সম্পন্ন
          </span>
        </div>
      </header>

      {/* Grid Player Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Video Player Column & Lesson Info */}
        <div className="lg:col-span-8 p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-73px)]">
          {/* Main Video Frame */}
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl">
            {activeVideo ? (
              <iframe
                src={activeVideo}
                title={activeLessonTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Video className="w-12 h-12 text-[#F59E0B] animate-pulse" />
                <p className="text-sm text-slate-300 font-bold">ভিডিও লোড হচ্ছে বা কোনো ক্লাস সিলেক্ট করা হয়নি</p>
              </div>
            )}
          </div>

          {/* Active Lesson Description & Sheet Download */}
          <div className="bg-[#0D2038] p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider block">
                  বর্তমান পাঠদান:
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                  {activeLessonTitle || "লেকচার নির্বাচন করুন"}
                </h2>
              </div>

              <button
                onClick={() => alert("লেকচার শিট ডাউনলোড প্রস্তুত হচ্ছে...")}
                className="px-4 py-2 bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl text-xs font-black text-black flex items-center gap-2 transition-all shadow-md shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>লেকচার শিট PDF</span>
              </button>
            </div>

            {activeLessonDescription && (
              <p className="text-xs text-slate-300 leading-relaxed bg-[#07182E] p-4 rounded-2xl border border-white/5">
                {activeLessonDescription}
              </p>
            )}

            {/* Interactive MCQ / True-False Practice Quiz Section (If uploaded by Teacher) */}
            {activeLessonTests && activeLessonTests.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#FACC15]">
                  <HelpCircle className="w-5 h-5 text-[#F59E0B]" />
                  <span>ইন্টারেক্টিভ ক্লাস কুইজ ও আত্মযাঁচাই ({activeLessonTests.length}টি প্রশ্ন)</span>
                </div>

                <div className="space-y-4">
                  {activeLessonTests.map((t, qIdx) => (
                    <div
                      key={t.id || qIdx}
                      className="bg-[#07182E] border border-white/10 rounded-2xl p-4 space-y-3"
                    >
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#FACC15] uppercase border border-[#F59E0B]/30">
                        প্রশ্ন {qIdx + 1}: {t.type === "mcq" ? "MCQ" : "True / False"}
                      </span>

                      <p className="text-xs font-bold text-white leading-relaxed">{t.question}</p>

                      {t.type === "mcq" && t.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {t.options.map((opt, oIdx) => {
                            const isSelected = quizAnswers[t.id] === opt;
                            const isCorrect = quizSubmitted && t.correctAnswer === opt;
                            const isWrong = quizSubmitted && isSelected && t.correctAnswer !== opt;

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() =>
                                  setQuizAnswers((prev) => ({ ...prev, [t.id]: opt }))
                                }
                                className={`p-3 rounded-xl text-xs text-left font-bold border transition-all flex items-center justify-between ${
                                  isCorrect
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                    : isWrong
                                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                                    : isSelected
                                    ? "bg-[#F59E0B]/20 border-[#F59E0B] text-[#FACC15]"
                                    : "bg-[#0D2038] border-white/10 text-slate-300 hover:border-white/20"
                                }`}
                              >
                                <span>
                                  {String.fromCharCode(65 + oIdx)}. {opt}
                                </span>
                                {isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                                {isWrong && <X className="w-4 h-4 text-red-400" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {t.type === "true_false" && (
                        <div className="flex gap-3">
                          {["true", "false"].map((val) => {
                            const isSelected = quizAnswers[t.id] === val;
                            const isCorrect = quizSubmitted && t.correctAnswer === val;
                            const isWrong = quizSubmitted && isSelected && t.correctAnswer !== val;

                            return (
                              <button
                                key={val}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() =>
                                  setQuizAnswers((prev) => ({ ...prev, [t.id]: val }))
                                }
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                                  isCorrect
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                    : isWrong
                                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                                    : isSelected
                                    ? "bg-[#F59E0B]/20 border-[#F59E0B] text-[#FACC15]"
                                    : "bg-[#0D2038] border-white/10 text-slate-300 hover:border-white/20"
                                }`}
                              >
                                {val === "true" ? "✅ True (সত্য)" : "❌ False (মিথ্যা)"}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted ? (
                    <button
                      type="button"
                      onClick={() => setQuizSubmitted(true)}
                      className="px-5 py-2.5 bg-[#F59E0B] text-black text-xs font-black rounded-xl hover:bg-[#FACC15] shadow-lg transition-all"
                    >
                      উত্তর যাঁচাই করুন
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl text-xs text-emerald-300 font-bold">
                      <span>কুইজ ফলাফল মূল্যায়িত হয়েছে! সঠিক উত্তর সবুজ রঙে চিহ্নিত।</span>
                      <button
                        type="button"
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="text-[11px] underline text-[#FACC15]"
                      >
                        পুনরায় দিন
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Modules & Lessons Syllabus Navigation */}
        <div className="lg:col-span-4 border-l border-white/10 bg-[#0A1A2E] overflow-y-auto p-4 sm:p-5 space-y-6 max-h-[calc(100vh-73px)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F59E0B]" />
              <span>ইনস্ট্রাক্টর কারিকুলাম ও ক্লাসভুমি</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {syllabus.length} টি মাইলস্টোন
            </span>
          </div>

          <div className="space-y-6">
            {syllabus.map((milestone, mIdx) => (
              <div key={milestone.id || mIdx} className="space-y-3">
                <span className="text-xs font-black text-[#FACC15] block bg-white/5 p-2.5 rounded-xl border border-white/5">
                  {milestone.milestone}
                </span>

                {milestone.modules.map((mod, modIdx) => (
                  <div
                    key={mod.id || modIdx}
                    className="bg-[#0D2038] border border-white/5 rounded-2xl p-4 space-y-3 shadow-md"
                  >
                    <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
                        {mod.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </h4>

                    <div className="space-y-2">
                      {mod.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isActive = activeLessonTitle === lesson.title;

                        return (
                          <div
                            key={lesson.id}
                            className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs border transition-all ${
                              isActive
                                ? "bg-[#F59E0B]/15 border-[#F59E0B] ring-1 ring-[#F59E0B]/30"
                                : lesson.locked
                                ? "bg-black/20 border-white/5 opacity-55 cursor-not-allowed"
                                : "bg-[#07182E] border-white/10 hover:border-[#F59E0B]/40 cursor-pointer"
                            }`}
                          >
                            <div
                              onClick={() => handleLessonClick(lesson)}
                              className="flex items-center gap-2.5 flex-1 min-w-0"
                            >
                              {lesson.locked ? (
                                <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                              ) : isActive ? (
                                <Play className="w-4 h-4 text-[#FACC15] shrink-0 animate-bounce-subtle" />
                              ) : (
                                <Play className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              <div className="text-left truncate">
                                <span
                                  className={`font-extrabold block truncate ${
                                    isActive ? "text-[#FACC15]" : "text-white"
                                  }`}
                                >
                                  {lesson.title}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {lesson.duration}
                                </span>
                              </div>
                            </div>

                            {!lesson.locked && (
                              <button
                                type="button"
                                onClick={() => toggleComplete(lesson.id)}
                                title="সম্পন্ন চিহ্নিত করুন"
                                className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                                  isCompleted
                                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                    : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
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
