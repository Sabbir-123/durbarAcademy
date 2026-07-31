"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { createClient } from "@/utils/supabase/client";
import { StudentSuccess } from "@/data/testimonials";
import {
  getStoredSuccessStories,
  saveSuccessStory,
  deleteSuccessStory,
  subscribeSuccessStoriesStore,
} from "@/utils/successStoryStore";
import {
  BookOpen,
  Users,
  HelpCircle,
  Plus,
  Trophy,
  Edit,
  Trash2,
  X,
  Eye,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [successStories, setSuccessStories] = useState<StudentSuccess[]>([]);

  // New Story Form State
  const [newStory, setNewStory] = useState<Partial<StudentSuccess>>({
    name: "",
    rank: "মেধা স্থান: ০১",
    institution: "বাংলাদেশ বিমান বাহিনী (BAFA)",
    category: "bafa",
    program: "BAFA Officer Cadet Course",
    hscCollege: "নটর ডেম কলেজ, ঢাকা",
    quote: "",
    score: "মার্কস: ১৮৫/২০০",
    badgeColor: "gold",
    imageUrl: "",
  });

  // Edit Story State
  const [editingStory, setEditingStory] = useState<StudentSuccess | null>(null);

  const supabase = createClient();

  useEffect(() => {
    setSuccessStories(getStoredSuccessStories());
    const unsub = subscribeSuccessStoriesStore(() => {
      setSuccessStories(getStoredSuccessStories());
    });

    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(prof);

      setAssignedCourses([
        { id: "c1", title: "BAFA প্রিলিমিনারি ও আইকিউ স্পেশাল প্রোগ্রাম", students_count: 142, lessons_count: 24 },
        { id: "c2", title: "BMA লং কোর্স অফিসার ক্যাডেট মাস্টারক্লাস", students_count: 98, lessons_count: 18 },
      ]);

      setTickets([
        { id: "tk1", student_name: "ফাহিম রেজওয়ান", subject: "আইএসএসবি পিপিডিটি চিত্র ডাউট সলভ", status: "open", description: "পিপিডিটি সেশনে গল্পের সমাধান কীভাবে সামারি করব?" },
      ]);
    }
    loadData();

    return () => unsub();
  }, []);

  const handleAddStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.name || !newStory.institution) {
      alert("অনুগ্রহ করে শিক্ষার্থী ও প্রতিষ্ঠানের নাম প্রদান করুন।");
      return;
    }

    try {
      const saved = await saveSuccessStory(newStory);
      alert(`সাকসেস স্টোরি "${saved.name}" যোগ করা হয়েছে!`);
      setNewStory({
        name: "",
        rank: "মেধা স্থান: ০১",
        institution: "বাংলাদেশ বিমান বাহিনী (BAFA)",
        category: "bafa",
        program: "BAFA Officer Cadet Course",
        hscCollege: "নটর ডেম কলেজ, ঢাকা",
        quote: "",
        score: "মার্কস: ১৮৫/২০০",
        badgeColor: "gold",
        imageUrl: "",
      });
    } catch (err: any) {
      alert("সমস্যা: " + err.message);
    }
  };

  const handleSaveEditedStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    try {
      await saveSuccessStory(editingStory);
      alert(`সাকসেস স্টোরি "${editingStory.name}" আপডেট করা হয়েছে!`);
      setEditingStory(null);
    } catch (err: any) {
      alert("সমস্যা: " + err.message);
    }
  };

  const handleDeleteStory = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${name}"-এর স্টোরিটি ডিলিট করতে চান?`)) return;

    try {
      await deleteSuccessStory(id);
      alert("সাকসেস স্টোরিটি সফলভাবে ডিলিট করা হয়েছে।");
    } catch (err: any) {
      alert("সমস্যা: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar role="teacher" activeTab="dashboard" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Welcomer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              instructor dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              স্বাগতম, {profile?.full_name || "শিক্ষক"}!
            </h1>
            <p className="text-xs text-slate-300">
              শিক্ষার্থীদের কোর্স কারিকুলাম ও কৃতি শিক্ষার্থীদের সাফল্য স্টোরি (CRUD) পরিচালনা প্যানেল।
            </p>
          </div>
        </div>

        {/* Overview Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-[#F59E0B] block">০২ টি</span>
              <span className="text-xs text-slate-300">বরাদ্দকৃত ডিফেন্স কোর্স</span>
            </div>
            <BookOpen className="w-8 h-8 text-[#F59E0B] opacity-40" />
          </div>

          <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-emerald-400 block">২৪০ জন</span>
              <span className="text-xs text-slate-300">অধ্যয়নরত শিক্ষার্থী</span>
            </div>
            <Users className="w-8 h-8 text-emerald-400 opacity-40" />
          </div>

          <div className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-amber-400 block">{successStories.length} টি</span>
              <span className="text-xs text-slate-300">শিক্ষার্থী সাকসেস স্টোরি</span>
            </div>
            <Trophy className="w-8 h-8 text-amber-400 opacity-40" />
          </div>
        </div>

        {/* STUDENT SUCCESS STORIES MANAGEMENT (TEACHER CRUD) */}
        <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
              <span>কৃতি শিক্ষার্থীদের সাফল্য স্টোরি পরিচালনা (Student Success CRUD)</span>
            </h3>

            <a
              href="/success-stories"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#F59E0B] hover:underline font-bold"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>সাকসেস পেজ দেখুন</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* List of Success Stories */}
            <div className="lg:col-span-7 space-y-3">
              {successStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-[#07182E] p-4 rounded-2xl border border-white/10 flex flex-col justify-between gap-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{story.name}</h4>
                      <p className="text-emerald-400 text-xs font-semibold">{story.institution}</p>
                      <span className="text-slate-400 text-[11px] italic line-clamp-1">"{story.quote}"</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-bold border border-[#F59E0B]/30 shrink-0">
                      {story.rank}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                    <span className="text-slate-400">কলেজ: {story.hscCollege}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingStory(story)}
                        className="p-1 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] rounded"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStory(story.id, story.name)}
                        className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Story Form */}
            <div className="lg:col-span-5 bg-[#07182E] p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-[#F59E0B] uppercase flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <span>নতুন সাফল্য পোস্ট করুন</span>
              </h4>

              <form onSubmit={handleAddStorySubmit} className="space-y-2.5 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">শিক্ষার্থীর নাম:*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ক্যাডেট ফাহিম রেজওয়ান"
                    value={newStory.name || ""}
                    onChange={(e) => setNewStory({ ...newStory, name: e.target.value })}
                    className="w-full bg-[#0D2038] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">মেধা স্থান/র‍্যাংক:*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মেধা স্থান: ০১ (ফ্লাইট ক্যাডেট)"
                    value={newStory.rank || ""}
                    onChange={(e) => setNewStory({ ...newStory, rank: e.target.value })}
                    className="w-full bg-[#0D2038] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">প্রতিষ্ঠানের নাম:*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: বাংলাদেশ বিমান বাহিনী (BAFA 88th)"
                    value={newStory.institution || ""}
                    onChange={(e) => setNewStory({ ...newStory, institution: e.target.value })}
                    className="w-full bg-[#0D2038] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">এইচএসসি কলেজ/শিক্ষা প্রতিষ্ঠান:</label>
                  <input
                    type="text"
                    placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
                    value={newStory.hscCollege || ""}
                    onChange={(e) => setNewStory({ ...newStory, hscCollege: e.target.value })}
                    className="w-full bg-[#0D2038] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">উক্তি / সংবর্ধনা বার্তা:</label>
                  <textarea
                    rows={3}
                    placeholder="দুর্বার একাডেমির মেন্টরিং অসাধারণ ছিল..."
                    value={newStory.quote || ""}
                    onChange={(e) => setNewStory({ ...newStory, quote: e.target.value })}
                    className="w-full bg-[#0D2038] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#F59E0B] text-black font-bold rounded-xl hover:brightness-110 shadow-md"
                >
                  স্টোরি সাবমিট করুন
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Assigned Courses List */}
        <section className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#F59E0B]" />
            <span>আমার দায়িত্বপ্রাপ্ত ডিফেন্স কোর্সসমূহ</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedCourses.map((c) => (
              <div key={c.id} className="bg-[#07182E] p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-sm">{c.title}</h4>
                </div>
                <div className="flex gap-4 text-xs text-slate-400">
                  <span>শিক্ষার্থী: {c.students_count} জন</span>
                  <span>ক্লাস: {c.lessons_count} টি</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* EDIT STORY MODAL */}
      {editingStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0E2038] border border-[#F59E0B]/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#F59E0B]" />
                <span>সাকসেস স্টোরি সম্পাদনা: {editingStory.name}</span>
              </h3>
              <button
                onClick={() => setEditingStory(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedStory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  required
                  value={editingStory.name}
                  onChange={(e) => setEditingStory({ ...editingStory, name: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">মেধা স্থান/র‍্যাংক:</label>
                <input
                  type="text"
                  required
                  value={editingStory.rank}
                  onChange={(e) => setEditingStory({ ...editingStory, rank: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">প্রতিষ্ঠানের নাম:</label>
                <input
                  type="text"
                  required
                  value={editingStory.institution}
                  onChange={(e) => setEditingStory({ ...editingStory, institution: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">উক্তি (Quote):</label>
                <textarea
                  rows={3}
                  value={editingStory.quote}
                  onChange={(e) => setEditingStory({ ...editingStory, quote: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="w-1/2 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#F59E0B] text-black font-bold rounded-xl hover:brightness-110"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
