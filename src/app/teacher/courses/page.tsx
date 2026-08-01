"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import { Course } from "@/data/courses";
import {
  getStoredCourses,
  saveCourse,
  deleteCourseStore,
  subscribeCoursesStore,
} from "@/utils/courseStore";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  Check,
  Layers,
  Users,
  Clock,
  Video,
  FileText,
  Save,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/utils/userStore";

export default function TeacherCoursesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [newSyllabusTitle, setNewSyllabusTitle] = useState("");
  const [newSyllabusLectures, setNewSyllabusLectures] = useState(10);
  const [newSyllabusExams, setNewSyllabusExams] = useState(5);

  const [userEmail, setUserEmail] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");

        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(prof);
      }
    }
    loadUser();

    setCourses(getStoredCourses());
    const unsub = subscribeCoursesStore(() => {
      setCourses(getStoredCourses());
    });

    return () => unsub();
  }, []);

  const currentUser = getCurrentUser();
  const currentTeacherEmail = (profile?.email || userEmail || currentUser?.email || "").trim().toLowerCase();

  // Filter courses assigned to this teacher (or open if no assignment)
  const displayCourses = courses.filter((c) => {
    if (c.teacherEmails && c.teacherEmails.length > 0) {
      if (!currentTeacherEmail) return false;
      return c.teacherEmails.some((e) => e.trim().toLowerCase() === currentTeacherEmail);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingCourse({
      title: "",
      category: "defense",
      categoryLabel: "ডিফেন্স ও মিলিটারি",
      tagline: "প্রিমিয়াম ডিফেন্স কোর্স কারিকুলাম",
      price: 4500,
      originalPrice: 6000,
      duration: "৪ মাস",
      startDate: "১৫ আগস্ট, ২০২৬",
      description: "",
      syllabus: [
        { title: "মডিউল ০১: বিষয়ভিত্তিক মৌলিক ধারণা", lectures: 12, exams: 4 },
        { title: "মডিউল ০২: এডভান্সড প্র্যাকটিস ও ওএমআর টেস্ট", lectures: 15, exams: 6 },
      ],
      features: [
        "দৈনিক ওএমআর ও সিবিটি এক্সাম",
        "১-অন-১ মেন্টরশিপ ও ডাউট ক্লিয়ারিং",
        "পিডিএফ নোটস ও প্র্যাকটিস শিট",
      ],
      published: true,
    });
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse?.title || !editingCourse.price) {
      alert("অনুগ্রহ করে কোর্সের শিরোনাম ও ফি প্রদান করুন।");
      return;
    }

    try {
      await saveCourse(editingCourse as any);
      alert(`কোর্স কারিকুলাম "${editingCourse.title}" সফলভাবে সংরক্ষণ করা হয়েছে!`);
      setEditingCourse(null);
    } catch (err: any) {
      alert("ত্রুটি: " + err.message);
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${title}" কোর্সটি ডিলিট করতে চান?`)) return;

    try {
      await deleteCourseStore(id);
      alert("কোর্সটি সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err: any) {
      alert("ত্রুটি: " + err.message);
    }
  };

  const addSyllabusItem = () => {
    if (!newSyllabusTitle.trim()) return;
    if (!editingCourse) return;

    const currentSyllabus = editingCourse.syllabus || [];
    setEditingCourse({
      ...editingCourse,
      syllabus: [
        ...currentSyllabus,
        {
          title: newSyllabusTitle.trim(),
          lectures: Number(newSyllabusLectures) || 5,
          exams: Number(newSyllabusExams) || 2,
        },
      ],
    });
    setNewSyllabusTitle("");
  };

  const removeSyllabusItem = (index: number) => {
    if (!editingCourse || !editingCourse.syllabus) return;
    const updated = [...editingCourse.syllabus];
    updated.splice(index, 1);
    setEditingCourse({ ...editingCourse, syllabus: updated });
  };

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar role="teacher" activeTab="courses" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              course curriculum management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              কোর্স কারিকুলাম ও বিষয়ভিত্তিক সিলেবাস
            </h1>
            <p className="text-xs text-slate-300">
              দুর্বার একাডেমির ডিফেন্স কোর্সসমূহের সিলেবাস, লেকচার প্ল্যান ও কারিকুলাম পরিচালনা করুন।
            </p>
          </div>
          <DashboardHeader role="teacher" />
        </div>

        {/* Action Header & Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0D2038] p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">দায়িত্বপ্রাপ্ত কোর্স: {displayCourses.length} টি</h2>
              <p className="text-xs text-slate-400">কারিকুলাম হালনাগাদ ও কন্টেন্ট সংযোজন করুন</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/teacher/classes"
              className="flex items-center gap-2 px-4 py-3 bg-[#07182E] border border-white/10 hover:border-[#F59E0B]/40 text-xs font-bold rounded-xl text-white transition-all"
            >
              <Video className="w-4 h-4 text-sky-400" />
              <span>ক্লাস ও টেস্ট ম্যানেজার</span>
            </Link>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-3 bg-[#F59E0B] text-black hover:brightness-110 text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন কোর্স যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayCourses.map((course) => (
            <div
              key={course.id}
              className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-5 hover:border-[#F59E0B]/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 inline-block mb-2">
                      {course.categoryLabel || "ডিফেন্স ও মিলিটারি"}
                    </span>
                    <h3 className="text-lg font-bold text-white">{course.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="p-2 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] rounded-xl transition-colors"
                      title="সম্পাদনা করুন"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {course.description || course.tagline}
                </p>

                {/* Course Metadata Badges */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>মেয়াদ: {course.duration || "৪ মাস"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ফি: ৳{course.price.toLocaleString("bn-BD")}</span>
                  </div>
                </div>

                {/* Syllabus Modules Accordion Preview */}
                <div className="space-y-2 pt-3">
                  <span className="text-xs font-bold text-slate-400 block">কারিকুলাম মডিউলসমূহ:</span>
                  <div className="space-y-1.5">
                    {(course.syllabus || []).map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-[#07182E] p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-white truncate max-w-[220px]">
                          {s.title}
                        </span>
                        <div className="flex gap-2 text-[10px] text-slate-400 shrink-0">
                          <span className="text-amber-400 font-bold">{s.lectures} ক্লাসেস</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">{s.exams} এক্সাম</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href={`/courses/${course.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F59E0B] hover:underline"
                >
                  <Eye className="w-4 h-4" />
                  <span>কোর্স পেজ দেখুন</span>
                </Link>
                <Link
                  href="/teacher/classes"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:underline"
                >
                  <Video className="w-4 h-4" />
                  <span>ক্লাস কন্টেন্ট সাজান →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* EDIT / CREATE COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0E2038] border border-[#F59E0B]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#F59E0B]" />
                <span>{editingCourse.id ? "কোর্স কারিকুলাম সম্পাদনা" : "নতুন ডিফেন্স কোর্স তৈরি"}</span>
              </h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">কোর্সের শিরোনাম:*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: BAFA প্রিলিমিনারি ও আইকিউ স্পেশাল"
                    value={editingCourse.title || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">কোর্স ফি (টাকা):*</label>
                  <input
                    type="number"
                    required
                    placeholder="4500"
                    value={editingCourse.price || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">কোর্স ক্যাটাগরি লেবেল:</label>
                  <input
                    type="text"
                    value={editingCourse.categoryLabel || "ডিফেন্স ও মিলিটারি"}
                    onChange={(e) => setEditingCourse({ ...editingCourse, categoryLabel: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">কোর্সের মেয়াদ:</label>
                  <input
                    type="text"
                    placeholder="যেমন: ৪ মাস"
                    value={editingCourse.duration || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">কোর্সের বিবরণ / অবজেক্টিভ:</label>
                <textarea
                  rows={3}
                  placeholder="কোর্সের মূল আকর্ষণ ও লক্ষ্যসমূহ লিখুন..."
                  value={editingCourse.description || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              {/* Dynamic Syllabus Builder */}
              <div className="border border-white/10 bg-[#07182E] p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-[#F59E0B] flex items-center gap-1.5 text-xs">
                  <Layers className="w-4 h-4" />
                  <span>কারিকুলাম মডিউল ও সিলেবাস পরিচালনা ({editingCourse.syllabus?.length || 0} টি)</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(editingCourse.syllabus || []).map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0D2038] p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <strong className="block text-white font-bold">{s.title}</strong>
                        <span className="text-[10px] text-slate-400">
                          {s.lectures} টি লেকচার • {s.exams} টি ওএমআর/সিবিটি এক্সাম
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSyllabusItem(idx)}
                        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Syllabus Row */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <label className="font-semibold text-slate-300 block">নতুন মডিউল/অধ্যায় যোগ করুন:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      placeholder="মডিউলের নাম (যেমন: আইকিউ পার্ট-০১)"
                      value={newSyllabusTitle}
                      onChange={(e) => setNewSyllabusTitle(e.target.value)}
                      className="sm:col-span-6 bg-[#0D2038] border border-white/10 rounded-xl p-2.5 text-white outline-none"
                    />
                    <input
                      type="number"
                      placeholder="ক্লাস সংখ্যা"
                      value={newSyllabusLectures}
                      onChange={(e) => setNewSyllabusLectures(Number(e.target.value))}
                      className="sm:col-span-3 bg-[#0D2038] border border-white/10 rounded-xl p-2.5 text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={addSyllabusItem}
                      className="sm:col-span-3 bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] font-bold rounded-xl py-2.5 hover:bg-[#F59E0B]/30 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> যোগ করুন
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="w-1/2 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#F59E0B] text-black font-bold rounded-xl hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>কোর্স সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
