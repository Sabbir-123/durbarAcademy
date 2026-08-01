"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import {
  Batch, Milestone, CourseModule, ClassLesson, TestItem,
  getBatches, saveBatch, deleteBatch,
  getMilestones, saveMilestone, deleteMilestone,
  getModules, saveModule, deleteModule,
  getClasses, saveClass, deleteClass,
  toYouTubeEmbedUrl, subscribeClassStore,
} from "@/utils/classStore";
import { Course } from "@/data/courses";
import { getStoredCourses, syncCoursesFromSupabase } from "@/utils/courseStore";
import { getCurrentUser, getStoredUsers, isSuperAdminEmail } from "@/utils/userStore";
import {
  Video, Plus, Edit, Trash2, X, ChevronRight,
  BookOpen, Layers, Target, PlayCircle,
  HelpCircle, ArrowLeft, Save,
  ClipboardList, ToggleLeft, CheckCircle2,
} from "lucide-react";

// ─── Shared input/textarea/select styles ─────────────────────────────────────
const inp = "w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#F59E0B] transition-colors placeholder:text-slate-500";
const label = "block text-xs font-bold text-slate-300 mb-1";

// ─── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, icon: Icon, onClose, children }: {
  title: string; icon: any; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0D2038] border border-[#F59E0B]/30 rounded-3xl p-6 w-full max-w-2xl shadow-2xl my-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Icon className="w-5 h-5 text-[#F59E0B]" />
            {title}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Small action button ───────────────────────────────────────────────────────
function ActionBtn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`p-1.5 rounded-lg ${color} transition-all`}>
      {children}
    </button>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color, count, onAdd }: {
  icon: any; title: string; color: string; count: number; onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="text-sm font-black text-white">{title}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${color} bg-white/5 font-bold`}>{count} টি</span>
      </div>
      <button onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-2 bg-[#F59E0B] text-black text-xs font-bold rounded-xl hover:brightness-110 shadow transition-all">
        <Plus className="w-3.5 h-3.5" /> নতুন যোগ করুন
      </button>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, onClick, active }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <div onClick={onClick}
      className={`bg-[#07182E] border rounded-2xl p-4 transition-all ${onClick ? "cursor-pointer hover:border-[#F59E0B]/40" : ""} ${active ? "border-[#F59E0B]/50 ring-1 ring-[#F59E0B]/30" : "border-white/10"}`}>
      {children}
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ items }: { items: { label: string; onClick: () => void }[] }) {
  return (
    <div className="flex items-center gap-1 text-xs text-slate-400 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3 text-slate-600" />}
          <button onClick={item.onClick}
            className={`font-semibold transition-colors ${i === items.length - 1 ? "text-[#FACC15]" : "hover:text-white"}`}>
            {item.label}
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Test Builder ─────────────────────────────────────────────────────────────
function TestBuilder({ tests, onChange }: { tests: TestItem[]; onChange: (t: TestItem[]) => void }) {
  const addMCQ = () => {
    const newQ: TestItem = {
      id: Date.now().toString(36),
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    };
    onChange([...tests, newQ]);
  };

  const addTrueFalse = () => {
    const newQ: TestItem = {
      id: Date.now().toString(36),
      type: "true_false",
      question: "",
      correctAnswer: "true",
    };
    onChange([...tests, newQ]);
  };

  const update = (id: string, patch: Partial<TestItem>) =>
    onChange(tests.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const remove = (id: string) => onChange(tests.filter((t) => t.id !== id));

  const updateOption = (testId: string, idx: number, val: string) => {
    const t = tests.find((t) => t.id === testId);
    if (!t || !t.options) return;
    const opts = [...t.options];
    opts[idx] = val;
    update(testId, { options: opts });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4 text-[#F59E0B]" /> পরীক্ষার প্রশ্নসমূহ ({tests.length} টি)
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={addMCQ}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-500/30">
            <HelpCircle className="w-3 h-3" /> MCQ যোগ
          </button>
          <button type="button" onClick={addTrueFalse}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30">
            <ToggleLeft className="w-3 h-3" /> True/False যোগ
          </button>
        </div>
      </div>

      {tests.length === 0 && (
        <p className="text-[11px] text-slate-500 italic text-center py-3 border border-dashed border-white/10 rounded-xl">
          কোনো প্রশ্ন নেই — উপরের বোতাম দিয়ে যোগ করুন
        </p>
      )}

      {tests.map((t, qi) => (
        <div key={t.id} className="bg-[#07182E] border border-white/10 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.type === "mcq" ? "bg-violet-500/20 text-violet-300" : "bg-emerald-500/20 text-emerald-300"}`}>
              {t.type === "mcq" ? "MCQ" : "True / False"} — প্রশ্ন {qi + 1}
            </span>
            <button type="button" onClick={() => remove(t.id)}
              className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">
              <X className="w-3 h-3" />
            </button>
          </div>

          <input type="text" placeholder="প্রশ্নটি লিখুন…" value={t.question}
            onChange={(e) => update(t.id, { question: e.target.value })}
            className={inp} />

          {t.type === "mcq" && (
            <div className="grid grid-cols-2 gap-2">
              {(t.options || ["", "", "", ""]).map((opt, oi) => (
                <div key={oi} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold w-4">{String.fromCharCode(65 + oi)}.</span>
                  <input type="text" placeholder={`অপশন ${String.fromCharCode(65 + oi)}`} value={opt}
                    onChange={(e) => updateOption(t.id, oi, e.target.value)}
                    className={`flex-1 bg-[#0D2038] border border-white/10 rounded-lg p-2 text-[11px] text-white outline-none focus:border-[#F59E0B]`} />
                </div>
              ))}
              <div className="col-span-2">
                <label className={label}>সঠিক উত্তর (অপশন অক্ষর বা টেক্সট লিখুন):</label>
                <select value={t.correctAnswer}
                  onChange={(e) => update(t.id, { correctAnswer: e.target.value })}
                  className={inp}>
                  <option value="">— সঠিক উত্তর বেছে নিন —</option>
                  {(t.options || []).map((opt, oi) => opt && (
                    <option key={oi} value={opt}>{String.fromCharCode(65 + oi)}. {opt}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {t.type === "true_false" && (
            <div>
              <label className={label}>সঠিক উত্তর:</label>
              <div className="flex gap-3">
                {["true", "false"].map((v) => (
                  <label key={v} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-xs font-bold transition-all ${t.correctAnswer === v ? "border-[#F59E0B] bg-[#F59E0B]/10 text-[#FACC15]" : "border-white/10 text-slate-400"}`}>
                    <input type="radio" name={`tf_${t.id}`} value={v} checked={t.correctAnswer === v}
                      onChange={() => update(t.id, { correctAnswer: v })} className="hidden" />
                    {v === "true" ? "✅ True (সত্য)" : "❌ False (মিথ্যা)"}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function TeacherClassesPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);

  // ── Course selection state ──────────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [selCourse, setSelCourse] = useState<Course | null>(null);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [batches, setBatches] = useState<Batch[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [classes, setClasses] = useState<ClassLesson[]>([]);

  // ── Navigation state (drill-down) ───────────────────────────────────────────
  const [selBatch, setSelBatch] = useState<Batch | null>(null);
  const [selMilestone, setSelMilestone] = useState<Milestone | null>(null);
  const [selModule, setSelModule] = useState<CourseModule | null>(null);

  // ── Modal state ─────────────────────────────────────────────────────────────
  type ModalType = "batch" | "milestone" | "module" | "class" | null;
  const [modal, setModal] = useState<ModalType>(null);

  // ── Editing state ───────────────────────────────────────────────────────────
  const [editingBatch, setEditingBatch] = useState<Partial<Batch>>({});
  const [editingMilestone, setEditingMilestone] = useState<Partial<Milestone>>({});
  const [editingModule, setEditingModule] = useState<Partial<CourseModule>>({});
  const [editingClass, setEditingClass] = useState<Partial<ClassLesson>>({ tests: [] });

  // ── Refresh ─────────────────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    if (selCourse) {
      setBatches(getBatches(selCourse.id));
    } else {
      setBatches([]);
    }
    if (selBatch) setMilestones(getMilestones(selBatch.id));
    if (selMilestone) setModules(getModules(selMilestone.id));
    if (selModule) setClasses(getClasses(selModule.id));
  }, [selCourse, selBatch, selMilestone, selModule]);

  useEffect(() => {
    refresh();
    const unsub = subscribeClassStore(refresh);
    return unsub;
  }, [refresh]);

  useEffect(() => {
    async function loadTeacherCourses() {
      const dbCourses = await syncCoursesFromSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      let prof: any = null;
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        prof = data;
        setProfile(data);
      }

      const currentUser = getCurrentUser();
      const teacherName = prof?.full_name || currentUser?.full_name || "";
      const userStoreMatch = getStoredUsers().find(
        (u) => u.id === prof?.id || u.full_name?.toLowerCase() === teacherName.toLowerCase()
      );
      const teacherEmailFromStore = userStoreMatch?.email || "";
      const userEmail = user?.email || teacherEmailFromStore || currentUser?.email || "";

      const isAdmin = isSuperAdminEmail(userEmail) || prof?.email === "ahmedsabbir2013@gmail.com";

      let assigned: Course[] = [];
      if (isAdmin) {
        assigned = dbCourses;
      } else {
        assigned = dbCourses.filter((c) => {
          if (c.teacherEmails && userEmail && c.teacherEmails.includes(userEmail)) return true;
          if (c.teacherEmails && teacherEmailFromStore && c.teacherEmails.includes(teacherEmailFromStore)) return true;
          if (c.instructors && teacherName && c.instructors.some((inst) => inst.toLowerCase() === teacherName.toLowerCase())) return true;
          return false;
        });
      }

      setCourses(assigned);
    }
    loadTeacherCourses();
  }, []);

  // ── Level: Batch handlers ────────────────────────────────────────────────────
  const openAddBatch = () => { setEditingBatch({ courseId: selCourse?.id, status: "upcoming" }); setModal("batch"); };
  const openEditBatch = (b: Batch) => { setEditingBatch({ ...b }); setModal("batch"); };
  const submitBatch = () => {
    if (!editingBatch.title?.trim()) return alert("ব্যাচের নাম প্রয়োজন।");
    saveBatch(editingBatch as any);
    setModal(null);
  };

  // ── Level: Milestone handlers ─────────────────────────────────────────────
  const openAddMilestone = () => {
    setEditingMilestone({ batchId: selBatch!.id, order: milestones.length + 1 });
    setModal("milestone");
  };
  const openEditMilestone = (m: Milestone) => { setEditingMilestone({ ...m }); setModal("milestone"); };
  const submitMilestone = () => {
    if (!editingMilestone.title?.trim()) return alert("মাইলস্টোনের নাম প্রয়োজন।");
    saveMilestone(editingMilestone as any);
    setModal(null);
  };

  // ── Level: Module handlers ────────────────────────────────────────────────
  const openAddModule = () => {
    setEditingModule({ milestoneId: selMilestone!.id, batchId: selBatch!.id, order: modules.length + 1 });
    setModal("module");
  };
  const openEditModule = (m: CourseModule) => { setEditingModule({ ...m }); setModal("module"); };
  const submitModule = () => {
    if (!editingModule.title?.trim()) return alert("মডিউলের নাম প্রয়োজন।");
    saveModule(editingModule as any);
    setModal(null);
  };

  // ── Level: Class handlers ─────────────────────────────────────────────────
  const openAddClass = () => {
    setEditingClass({ moduleId: selModule!.id, milestoneId: selMilestone!.id, batchId: selBatch!.id, tests: [], order: classes.length + 1, durationMin: 45 });
    setModal("class");
  };
  const openEditClass = (c: ClassLesson) => { setEditingClass({ ...c }); setModal("class"); };
  const submitClass = () => {
    if (!editingClass.title?.trim()) return alert("ক্লাসের শিরোনাম প্রয়োজন।");
    if (!editingClass.youtubeUrl?.trim()) return alert("YouTube লিংক প্রয়োজন।");
    saveClass(editingClass as any);
    setModal(null);
  };

  // ── View level ────────────────────────────────────────────────────────────
  const level = selModule ? "classes" : selMilestone ? "modules" : selBatch ? "milestones" : "batches";

  const breadcrumb = [
    { label: "কোর্সসমূহ", onClick: () => { setSelCourse(null); setSelBatch(null); setSelMilestone(null); setSelModule(null); } },
    ...(selCourse ? [{ label: `কোর্স: ${selCourse.title}`, onClick: () => { setSelBatch(null); setSelMilestone(null); setSelModule(null); } }] : []),
    ...(selBatch ? [{ label: selBatch.title, onClick: () => { setSelMilestone(null); setSelModule(null); } }] : []),
    ...(selMilestone ? [{ label: selMilestone.title, onClick: () => setSelModule(null) }] : []),
    ...(selModule ? [{ label: selModule.title, onClick: () => {} }] : []),
  ];

  const statusColor = (s: string) =>
    s === "active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : s === "upcoming" ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : "bg-slate-500/20 text-slate-400 border-slate-500/30";

  const statusLabel = (s: string) =>
    s === "active" ? "চলমান" : s === "upcoming" ? "আসছে" : "সমাপ্ত";

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      <DashboardSidebar role="teacher" activeTab="classes" />

      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider">ক্লাস ম্যানেজার</span>
            <h1 className="text-2xl font-extrabold text-white">কোর্স · ব্যাচ · মাইলস্টোন · মডিউল · ক্লাস</h1>
            <p className="text-xs text-slate-400">প্রথমে কোর্স নির্বাচন করুন, ব্যাচ তৈরি করুন, মাইলস্টোন ও মডিউল সাজিয়ে ইউটিউব ক্লাস ও পরীক্ষা প্রকাশ করুন।</p>
          </div>
          <DashboardHeader role="teacher" />
        </div>

        {/* Course Selector Toolbar */}
        <div className="bg-[#0D2038] border border-[#F59E0B]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">বর্তমানে নির্বাচিত কোর্স:</span>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                {selCourse ? (
                  <>
                    <span className="text-[#FACC15]">{selCourse.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#FACC15] font-bold">
                      {selCourse.categoryLabel}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 font-normal">কোনো কোর্স নির্বাচন করা হয়নি</span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selCourse?.id || ""}
              onChange={(e) => {
                const found = courses.find((c) => c.id === e.target.value);
                setSelCourse(found || null);
                setSelBatch(null);
                setSelMilestone(null);
                setSelModule(null);
              }}
              className="w-full sm:w-auto bg-[#07182E] border border-[#F59E0B]/40 text-[#FACC15] font-bold text-xs rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#F59E0B] cursor-pointer"
            >
              <option value="">— পছন্দমতো কোর্স বেছে নিন ({courses.length} টি) —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "মোট ব্যাচ", val: batches.length, color: "text-[#F59E0B]", icon: BookOpen },
            { label: "মাইলস্টোন", val: milestones.length, color: "text-violet-400", icon: Target },
            { label: "মডিউল", val: modules.length, color: "text-emerald-400", icon: Layers },
            { label: "ক্লাস / লেসন", val: classes.length, color: "text-sky-400", icon: PlayCircle },
          ].map((s) => (
            <div key={s.label} className="bg-[#0D2038] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className={`text-xl font-black block ${s.color}`}>{s.val} টি</span>
                <span className="text-[11px] text-slate-400">{s.label}</span>
              </div>
              <s.icon className={`w-7 h-7 opacity-30 ${s.color}`} />
            </div>
          ))}
        </div>

        {/* Breadcrumb */}
        {selCourse && (
          <div className="flex items-center gap-3 bg-[#0D2038] border border-white/10 rounded-2xl px-4 py-3">
            <button onClick={() => { setSelBatch(null); setSelMilestone(null); setSelModule(null); }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Breadcrumb items={breadcrumb} />
          </div>
        )}

        {/* If no course selected, show course selector cards */}
        {!selCourse && (
          <div className="space-y-4 py-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-lg font-extrabold text-white">আপনার কোর্স নির্বাচন করুন</h3>
              <p className="text-xs text-slate-400">
                ক্লাস ও ব্যাচ পরিচালনা শুরু করতে নিচে প্রদর্শিত আপনার অ্যাসাইন করা কোর্সগুলোর মধ্য থেকে একটি বেছে নিন।
              </p>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12 bg-[#0D2038] border border-dashed border-white/10 rounded-2xl">
                <p className="text-xs text-slate-400">আপনাকে এখনো কোনো কোর্সে অ্যাসাইন করা হয়নি।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelCourse(c);
                      setSelBatch(null);
                      setSelMilestone(null);
                      setSelModule(null);
                    }}
                    className="bg-[#0D2038] border border-white/10 hover:border-[#F59E0B] rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#FACC15] border border-[#F59E0B]/20">
                        {c.categoryLabel}
                      </span>
                      <span className="text-xs font-bold text-slate-400">৳{c.price}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#FACC15] transition-colors">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.tagline}</p>
                    <button className="w-full py-2.5 bg-[#F59E0B]/10 text-[#FACC15] group-hover:bg-[#F59E0B] group-hover:text-black font-bold text-xs rounded-xl transition-all">
                      ব্যাচ ও পাঠ্যসূচি সাজান →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LEVEL 1: BATCHES ─────────────────────────────────────────────────── */}
        {selCourse && level === "batches" && (
          <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6">
            <SectionHeader icon={BookOpen} title="ব্যাচসমূহ" color="text-[#F59E0B]"
              count={batches.length} onAdd={openAddBatch} />
            {batches.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-10 italic">কোনো ব্যাচ নেই — নতুন ব্যাচ তৈরি করুন</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((b) => (
                <Card key={b.id} onClick={() => { setSelBatch(b); setMilestones(getMilestones(b.id)); }}>
                  <div className="flex justify-between items-start mb-2">
                    <BookOpen className="w-5 h-5 text-[#F59E0B]" />
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${statusColor(b.status)}`}>
                      {statusLabel(b.status)}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1 line-clamp-2">{b.title}</h4>
                  {b.description && <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{b.description}</p>}
                  <p className="text-[10px] text-slate-500 mb-3">শুরু: {b.startDate || "—"}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-400">{getMilestones(b.id).length} টি মাইলস্টোন</span>
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <ActionBtn onClick={() => openEditBatch(b)} color="bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B]">
                        <Edit className="w-3.5 h-3.5" />
                      </ActionBtn>
                      <ActionBtn onClick={() => { if (confirm(`"${b.title}" ডিলিট করবেন?`)) deleteBatch(b.id); }}
                        color="bg-red-500/10 hover:bg-red-500/20 text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </ActionBtn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ── LEVEL 2: MILESTONES ───────────────────────────────────────────────── */}
        {level === "milestones" && (
          <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6">
            <SectionHeader icon={Target} title={`মাইলস্টোন — ${selBatch?.title}`} color="text-violet-400"
              count={milestones.length} onAdd={openAddMilestone} />
            {milestones.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-10 italic">কোনো মাইলস্টোন নেই</p>
            )}
            <div className="space-y-3">
              {milestones.sort((a, b) => a.order - b.order).map((m) => (
                <Card key={m.id} onClick={() => { setSelMilestone(m); setModules(getModules(m.id)); }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-300 text-[11px] font-black flex items-center justify-center shrink-0">{m.order}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{m.title}</h4>
                        {m.description && <p className="text-[11px] text-slate-400 truncate">{m.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-slate-400">{getModules(m.id).length} মডিউল</span>
                      <ActionBtn onClick={() => openEditMilestone(m)} color="bg-violet-500/10 hover:bg-violet-500/20 text-violet-400">
                        <Edit className="w-3.5 h-3.5" />
                      </ActionBtn>
                      <ActionBtn onClick={() => { if (confirm(`"${m.title}" ডিলিট করবেন?`)) deleteMilestone(m.id); }}
                        color="bg-red-500/10 hover:bg-red-500/20 text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </ActionBtn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ── LEVEL 3: MODULES ─────────────────────────────────────────────────── */}
        {level === "modules" && (
          <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6">
            <SectionHeader icon={Layers} title={`মডিউল — ${selMilestone?.title}`} color="text-emerald-400"
              count={modules.length} onAdd={openAddModule} />
            {modules.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-10 italic">কোনো মডিউল নেই</p>
            )}
            <div className="space-y-3">
              {modules.sort((a, b) => a.order - b.order).map((m) => (
                <Card key={m.id} onClick={() => { setSelModule(m); setClasses(getClasses(m.id)); }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black flex items-center justify-center shrink-0">{m.order}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{m.title}</h4>
                        {m.description && <p className="text-[11px] text-slate-400 truncate">{m.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-slate-400">{getClasses(m.id).length} ক্লাস</span>
                      <ActionBtn onClick={() => openEditModule(m)} color="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400">
                        <Edit className="w-3.5 h-3.5" />
                      </ActionBtn>
                      <ActionBtn onClick={() => { if (confirm(`"${m.title}" ডিলিট করবেন?`)) deleteModule(m.id); }}
                        color="bg-red-500/10 hover:bg-red-500/20 text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </ActionBtn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ── LEVEL 4: CLASSES ─────────────────────────────────────────────────── */}
        {level === "classes" && (
          <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6">
            <SectionHeader icon={PlayCircle} title={`ক্লাস — ${selModule?.title}`} color="text-sky-400"
              count={classes.length} onAdd={openAddClass} />
            {classes.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-10 italic">কোনো ক্লাস নেই — নতুন ক্লাস যোগ করুন</p>
            )}
            <div className="space-y-3">
              {classes.sort((a, b) => a.order - b.order).map((c) => (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">{c.order}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm">{c.title}</h4>
                        {c.description && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{c.description}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          {c.youtubeUrl && (
                            <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold">
                              <PlayCircle className="w-3 h-3" /> YouTube
                            </span>
                          )}
                          {c.durationMin > 0 && (
                            <span className="text-[10px] text-slate-400">{c.durationMin} মিনিট</span>
                          )}
                          {c.tests.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-violet-400 font-bold">
                              <ClipboardList className="w-3 h-3" /> {c.tests.length} টি প্রশ্ন
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <ActionBtn onClick={() => openEditClass(c)} color="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400">
                        <Edit className="w-3.5 h-3.5" />
                      </ActionBtn>
                      <ActionBtn onClick={() => { if (confirm(`"${c.title}" ডিলিট করবেন?`)) deleteClass(c.id); }}
                        color="bg-red-500/10 hover:bg-red-500/20 text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </ActionBtn>
                    </div>
                  </div>
                  {/* YouTube preview */}
                  {c.youtubeUrl && (
                    <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-black">
                      <iframe src={toYouTubeEmbedUrl(c.youtubeUrl)} className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen title={c.title} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ═══════════════ MODALS ════════════════════════════════════════════════ */}

      {/* BATCH MODAL */}
      {modal === "batch" && (
        <Modal title={editingBatch.id ? "ব্যাচ সম্পাদনা" : "নতুন ব্যাচ তৈরি"} icon={BookOpen} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className={label}>ব্যাচের নাম *</label>
              <input type="text" placeholder="যেমন: BAFA ব্যাচ ২০২৬" value={editingBatch.title || ""}
                onChange={(e) => setEditingBatch({ ...editingBatch, title: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={label}>বিবরণ</label>
              <textarea rows={3} placeholder="ব্যাচের সংক্ষিপ্ত বিবরণ…" value={editingBatch.description || ""}
                onChange={(e) => setEditingBatch({ ...editingBatch, description: e.target.value })} className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>শুরুর তারিখ</label>
                <input type="date" value={editingBatch.startDate || ""}
                  onChange={(e) => setEditingBatch({ ...editingBatch, startDate: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={label}>স্ট্যাটাস</label>
                <select value={editingBatch.status || "upcoming"}
                  onChange={(e) => setEditingBatch({ ...editingBatch, status: e.target.value as any })} className={inp}>
                  <option value="upcoming">আসছে (Upcoming)</option>
                  <option value="active">চলমান (Active)</option>
                  <option value="ended">সমাপ্ত (Ended)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="w-1/2 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white">বাতিল</button>
              <button onClick={submitBatch} className="w-1/2 py-3 bg-[#F59E0B] rounded-xl text-xs font-bold text-black flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> সেভ করুন
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MILESTONE MODAL */}
      {modal === "milestone" && (
        <Modal title={editingMilestone.id ? "মাইলস্টোন সম্পাদনা" : "নতুন মাইলস্টোন"} icon={Target} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className={label}>মাইলস্টোনের নাম *</label>
              <input type="text" placeholder="যেমন: ফাউন্ডেশন ফেজ" value={editingMilestone.title || ""}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={label}>বিবরণ</label>
              <textarea rows={2} placeholder="এই মাইলস্টোনের লক্ষ্য…" value={editingMilestone.description || ""}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={label}>ক্রম নম্বর (Order)</label>
              <input type="number" min={1} value={editingMilestone.order || 1}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, order: +e.target.value })} className={inp} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="w-1/2 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white">বাতিল</button>
              <button onClick={submitMilestone} className="w-1/2 py-3 bg-violet-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> সেভ করুন
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODULE MODAL */}
      {modal === "module" && (
        <Modal title={editingModule.id ? "মডিউল সম্পাদনা" : "নতুন মডিউল"} icon={Layers} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className={label}>মডিউলের নাম *</label>
              <input type="text" placeholder="যেমন: গণিত ও বিজ্ঞান মডিউল" value={editingModule.title || ""}
                onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={label}>বিবরণ</label>
              <textarea rows={2} value={editingModule.description || ""}
                onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={label}>ক্রম নম্বর</label>
              <input type="number" min={1} value={editingModule.order || 1}
                onChange={(e) => setEditingModule({ ...editingModule, order: +e.target.value })} className={inp} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="w-1/2 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white">বাতিল</button>
              <button onClick={submitModule} className="w-1/2 py-3 bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> সেভ করুন
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CLASS MODAL */}
      {modal === "class" && (
        <Modal title={editingClass.id ? "ক্লাস সম্পাদনা" : "নতুন ক্লাস যোগ করুন"} icon={Video} onClose={() => setModal(null)}>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div>
              <label className={label}>ক্লাসের শিরোনাম *</label>
              <input type="text" placeholder="যেমন: ক্লাস ০১ — ভেক্টর ও স্কেলার" value={editingClass.title || ""}
                onChange={(e) => setEditingClass({ ...editingClass, title: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={label}>বিবরণ</label>
              <textarea rows={3} placeholder="এই ক্লাসে কী শেখানো হবে…" value={editingClass.description || ""}
                onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={label + " flex items-center gap-1.5"}>
                <PlayCircle className="w-3.5 h-3.5 text-red-400" /> YouTube লিংক (Unlisted) *
              </label>
              <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={editingClass.youtubeUrl || ""}
                onChange={(e) => setEditingClass({ ...editingClass, youtubeUrl: e.target.value })} className={inp} />
              {/* Live preview */}
              {editingClass.youtubeUrl && toYouTubeEmbedUrl(editingClass.youtubeUrl) && (
                <div className="mt-2 aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe src={toYouTubeEmbedUrl(editingClass.youtubeUrl || "")} className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title="Preview" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>সময়কাল (মিনিট)</label>
                <input type="number" min={1} value={editingClass.durationMin || 45}
                  onChange={(e) => setEditingClass({ ...editingClass, durationMin: +e.target.value })} className={inp} />
              </div>
              <div>
                <label className={label}>ক্রম নম্বর</label>
                <input type="number" min={1} value={editingClass.order || 1}
                  onChange={(e) => setEditingClass({ ...editingClass, order: +e.target.value })} className={inp} />
              </div>
            </div>

            {/* Test Builder */}
            <div className="border-t border-white/10 pt-4">
              <TestBuilder
                tests={editingClass.tests || []}
                onChange={(tests) => setEditingClass({ ...editingClass, tests })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="w-1/2 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white">বাতিল</button>
              <button onClick={submitClass} className="w-1/2 py-3 bg-sky-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> ক্লাস সেভ করুন
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
