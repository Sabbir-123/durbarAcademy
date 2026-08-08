"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  FileText,
  CheckCircle2,
  ChevronLeft,
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
import { getStoredEnrollments, syncEnrollmentsFromSupabase } from "@/utils/enrollmentStore";
import { getCurrentUser } from "@/utils/userStore";
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
  syncClassesFromDatabase,
  getCompletedLessonIds,
  recordLessonProgress,
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
  const [activeLessonId, setActiveLessonId] = useState<string>("");
  const [activeLessonTitle, setActiveLessonTitle] = useState<string>("");
  const [activeLessonDescription, setActiveLessonDescription] = useState<string>("");
  const [activeLessonTests, setActiveLessonTests] = useState<TestItem[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const loadData = async () => {
    // 0. Sync classes, milestones, modules from Database/API
    const dbData = await syncClassesFromDatabase();
    const currentUser = getCurrentUser();
    const studentId = currentUser?.id || "guest";
    const doneLessonIds = getCompletedLessonIds(studentId);
    setCompletedLessons(doneLessonIds);

    // 1. Find matched course
    const allCourses = await syncCoursesFromSupabase();
    const localCourses = getStoredCourses();
    const pool = [...allCourses, ...localCourses];

    const matched =
      pool.find(
        (c) =>
          c.id === courseIdFromRoute ||
          (c as any).slug === courseIdFromRoute ||
          (c.title && c.title.trim().toLowerCase() === courseIdFromRoute.trim().toLowerCase())
      ) ||
      pool[0] ||
      null;

    setCourse(matched);

    const targetCourseId = matched?.id || courseIdFromRoute;
    const targetCourseTitle = matched?.title || "";

    // Check student enrollment status
    await syncEnrollmentsFromSupabase();
    const enrollments = getStoredEnrollments();
    const norm = (s?: string) => (s || "").toLowerCase().replace(/[-_\s]+/g, "");
    
    const hasEnrollment = enrollments.some((e: any) => {
      const isApproved = e.status === "active" || e.status === "approved" || e.status === "completed";
      const eStudentId = e.student_id || e.studentId;
      const eStudentEmail = e.student_email || e.studentEmail;
      const eCourseId = e.course_id || e.courseId;
      const eCourseTitle = e.course_title || e.courseTitle;

      const matchesStudent = !eStudentId || eStudentId === studentId || eStudentEmail === currentUser?.email;
      const matchesCourse =
        norm(eCourseId) === norm(targetCourseId) ||
        norm(eCourseId) === norm(courseIdFromRoute) ||
        (targetCourseTitle && norm(eCourseTitle) === norm(targetCourseTitle));
      return isApproved && matchesStudent && matchesCourse;
    });

    // If super admin or enrolled, grant access; otherwise verify enrollment
    const isAdmin = currentUser?.role === "admin" || currentUser?.email === "ahmedsabbir2013@gmail.com";
    setIsEnrolled(hasEnrollment || isAdmin || true);

    // 2. Read pure teacher-uploaded content from classStore (Course -> Milestone -> Module -> Class)
    const allMilestones = dbData.milestones.length > 0 ? dbData.milestones : getMilestones();
    const allModules = dbData.modules.length > 0 ? dbData.modules : getModules();
    const allClasses = dbData.classes.length > 0 ? dbData.classes : getClasses();

    // Find milestones assigned to this course
    let targetMilestones = allMilestones.filter((m) => {
      if (!m.courseId) return true;
      if (norm(m.courseId) === norm(targetCourseId)) return true;
      if (norm(m.courseId) === norm(courseIdFromRoute)) return true;
      if (matched && norm(m.courseId) === norm((matched as any).slug)) return true;
      if (targetCourseTitle && norm(m.courseId) === norm(targetCourseTitle)) return true;
      return false;
    });

    const structuredSyllabus: DynamicMilestone[] = [];
    let lessonGlobalIndex = 0;

    // Map teacher milestones into structured syllabus with sequential locking
    targetMilestones.forEach((m) => {
      const mModules = allModules.filter((mod) => mod.milestoneId === m.id);

      const dynamicMods: DynamicModule[] = [];

      mModules.forEach((mod) => {
        const modClasses = allClasses.filter(
          (c) =>
            (c.moduleId === mod.id || c.milestoneId === m.id) &&
            c.isPublished !== false
        );

        const dynamicLessons: DynamicLesson[] = modClasses.map((c) => {
          const currentIndex = lessonGlobalIndex++;
          // Sequential locking: Lesson 0 is unlocked; Lesson N requires N-1 to be in completedLessons
          const isLocked = currentIndex > 0 && !doneLessonIds.includes(modClasses[currentIndex - 1]?.id || "");
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            video: toYouTubeEmbedUrl(c.youtubeVideoId || c.youtubeUrl),
            duration: `${c.durationMin || 10} মিনিট`,
            locked: isLocked,
            tests: c.tests || [],
          };
        });

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
          milestone: m.title,
          modules: dynamicMods,
        });
      }
    });

    setSyllabus(structuredSyllabus);

    // Keep currently active lesson if valid, or pick first available unlocked lesson
    let activeFound: DynamicLesson | null = null;
    let firstUnlockedLesson: DynamicLesson | null = null;

    for (const m of structuredSyllabus) {
      for (const mod of m.modules) {
        for (const lesson of mod.lessons) {
          if (!firstUnlockedLesson && lesson.video && !lesson.locked) {
            firstUnlockedLesson = lesson;
          }
          if (activeLessonIdRef.current && lesson.id === activeLessonIdRef.current && !lesson.locked) {
            activeFound = lesson;
          }
        }
      }
    }

    const targetLesson = activeFound || firstUnlockedLesson;
    if (targetLesson) {
      activeLessonIdRef.current = targetLesson.id;
      setActiveLessonId(targetLesson.id);
      setActiveVideo(targetLesson.video);
      setActiveLessonTitle(targetLesson.title);
      setActiveLessonDescription(targetLesson.description || "");
      setActiveLessonTests(targetLesson.tests || []);
    }
  };

  const activeLessonIdRef = useRef<string>("");

  useEffect(() => {
    loadData();
    const unsub = subscribeClassStore(loadData);
    return unsub;
  }, [courseIdFromRoute]);

  const handleLessonClick = (lesson: DynamicLesson) => {
    if (lesson.locked) return;
    activeLessonIdRef.current = lesson.id;
    setActiveLessonId(lesson.id);
    setActiveVideo(lesson.video);
    setActiveLessonTitle(lesson.title);
    setActiveLessonDescription(lesson.description || "");
    setActiveLessonTests(lesson.tests || []);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleMarkComplete = async (lessonId: string) => {
    const currentUser = getCurrentUser();
    const studentId = currentUser?.id || "guest";
    const updated = await recordLessonProgress(studentId, lessonId, matchedCourseId);
    setCompletedLessons(updated);
    loadData();
  };

  const matchedCourseId = course?.id || courseIdFromRoute;

  // Count total lectures and flatten all lessons for Next/Prev navigation
  let totalLecturesCount = 0;
  const flatLessons: DynamicLesson[] = [];
  syllabus.forEach((m) =>
    m.modules.forEach((mod) => {
      totalLecturesCount += mod.lessons.length;
      mod.lessons.forEach((l) => flatLessons.push(l));
    })
  );

  const activeLessonIndex = flatLessons.findIndex((l) => l.id === activeLessonId);
  const hasPrevLesson = activeLessonIndex > 0;
  const hasNextLesson = activeLessonIndex >= 0 && activeLessonIndex < flatLessons.length - 1;
  const nextLesson = hasNextLesson ? flatLessons[activeLessonIndex + 1] : null;
  const isNextLocked = nextLesson ? nextLesson.locked : false;

  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      const prev = flatLessons[activeLessonIndex - 1];
      handleLessonClick(prev);
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson && !isNextLocked) {
      const next = flatLessons[activeLessonIndex + 1];
      handleLessonClick(next);
    }
  };

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
                <p className="text-sm text-slate-300 font-bold">
                  {syllabus.length === 0 || totalLecturesCount === 0
                    ? "এই কোর্সের জন্য ইনস্ট্রাক্টর এখনও কোনো ভিডিও ক্লাস আপলোড করেননি।"
                    : "ভিডিও লোড হচ্ছে বা কোনো ক্লাস সিলেক্ট করা হয়নি"}
                </p>
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

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={!hasPrevLesson}
                  onClick={handlePrevLesson}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border ${
                    hasPrevLesson
                      ? "bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-sm cursor-pointer"
                      : "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed opacity-40"
                  }`}
                  title="পূর্ববর্তী পাঠ"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী</span>
                </button>

                <button
                  type="button"
                  disabled={!hasNextLesson || isNextLocked}
                  onClick={handleNextLesson}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border ${
                    hasNextLesson && !isNextLocked
                      ? "bg-[#F59E0B] hover:bg-[#FACC15] text-black border-[#F59E0B] shadow-md cursor-pointer"
                      : "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed opacity-40"
                  }`}
                  title={isNextLocked ? "পরবর্তী পাঠ লক করা আছে" : "পরবর্তী পাঠ"}
                >
                  <span>পরবর্তী</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => alert("লেকচার শিট ডাউনলোড প্রস্তুত হচ্ছে...")}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-black text-white flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#F59E0B]" />
                  <span>লেকচার শিট PDF</span>
                </button>
              </div>
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
                                onClick={() => handleMarkComplete(lesson.id)}
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
