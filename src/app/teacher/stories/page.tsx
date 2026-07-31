"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import { StudentSuccess } from "@/data/testimonials";
import {
  getStoredSuccessStories,
  saveSuccessStory,
  deleteSuccessStory,
  subscribeSuccessStoriesStore,
} from "@/utils/successStoryStore";
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  Check,
  Award,
  Sparkles,
  Save,
  GraduationCap,
} from "lucide-react";

export default function TeacherStoriesPage() {
  const [profile, setProfile] = useState<any>(null);
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

    async function loadUser() {
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
    }
    loadUser();

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
      alert(`সাকসেস স্টোরি "${saved.name}" সফলভাবে পোস্ট করা হয়েছে!`);
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
      alert(`সাকসেস স্টোরি "${editingStory.name}" সফলভাবে আপডেট করা হয়েছে!`);
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
      <DashboardSidebar role="teacher" activeTab="stories" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              student success stories management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              কৃতি শিক্ষার্থীদের সাফল্য স্টোরি (Success Stories CRUD)
            </h1>
            <p className="text-xs text-slate-300">
              ডিফেন্স ও মিলিটারি একাডেমিতে সুপারিশপ্রাপ্ত ও সফল শিক্ষার্থীদের অর্জন ওয়েবসাইটে প্রদর্শন করুন।
            </p>
          </div>
          <DashboardHeader role="teacher" />
        </div>

        {/* Action Header & Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0D2038] p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">সর্বমোট সাফল্য স্টোরি: {successStories.length} টি</h2>
              <p className="text-xs text-slate-400">ওয়েবসাইটের সাকসেস গ্যালারিতে সাথে সাথে প্রকাশিত হবে</p>
            </div>
          </div>

          <a
            href="/success-stories"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-xs font-bold rounded-xl text-[#FACC15] transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>সাকসেস পেজ লাইভ দেখুন ↗</span>
          </a>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List of Success Stories */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F59E0B]" />
              <span>প্রকাশিত সাকসেস পোস্টসমূহ ({successStories.length})</span>
            </h3>

            <div className="space-y-3">
              {successStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-[#0D2038] p-5 rounded-2xl border border-white/10 flex flex-col justify-between gap-3 text-xs hover:border-[#F59E0B]/40 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#F59E0B]" />
                        <h4 className="font-bold text-white text-base">{story.name}</h4>
                      </div>
                      <p className="text-emerald-400 text-xs font-bold">{story.institution}</p>
                      <span className="text-slate-400 text-xs italic block pt-1">
                        "{story.quote}"
                      </span>
                    </div>

                    <span className="text-[11px] px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#FACC15] font-extrabold border border-[#F59E0B]/30 shrink-0 shadow-sm">
                      {story.rank}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
                    <span>কলেজ: {story.hscCollege || "নটর ডেম কলেজ"}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingStory(story)}
                        className="px-3 py-1.5 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>এডিট</span>
                      </button>
                      <button
                        onClick={() => handleDeleteStory(story.id, story.name)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ডিলিট</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Story Form */}
          <div className="lg:col-span-5 bg-[#0D2038] p-6 rounded-3xl border border-white/10 space-y-4 h-fit">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-[#F59E0B] uppercase flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>নতুন সাফল্য পোস্ট করুন</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                শিক্ষার্থীর অর্জন, র‍্যাংক ও উক্তি প্রদান করুন।
              </p>
            </div>

            <form onSubmit={handleAddStorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">শিক্ষার্থীর নাম:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ক্যাডেট ফাহিম রেজওয়ান"
                  value={newStory.name || ""}
                  onChange={(e) => setNewStory({ ...newStory, name: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">মেধা স্থান / র‍্যাংক:*</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মেধা স্থান: ০১ (ফ্লাইট ক্যাডেট)"
                  value={newStory.rank || ""}
                  onChange={(e) => setNewStory({ ...newStory, rank: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
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
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">এইচএসসি কলেজ / শিক্ষা প্রতিষ্ঠান:</label>
                <input
                  type="text"
                  placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
                  value={newStory.hscCollege || ""}
                  onChange={(e) => setNewStory({ ...newStory, hscCollege: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">সংবর্ধনা বার্তা / উক্তি:</label>
                <textarea
                  rows={3}
                  placeholder="দুর্বার একাডেমির মেন্টরিং অসাধারণ ছিল..."
                  value={newStory.quote || ""}
                  onChange={(e) => setNewStory({ ...newStory, quote: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#F59E0B] text-black font-bold text-xs rounded-xl hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>স্টোরি প্রকাশ করুন</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* EDIT STORY MODAL */}
      {editingStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0E2038] border border-[#F59E0B]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#F59E0B]" />
                <span>সাকসেস স্টোরি সম্পাদনা: {editingStory.name}</span>
              </h3>
              <button
                onClick={() => setEditingStory(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
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
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">মেধা স্থান/র‍্যাংক:</label>
                <input
                  type="text"
                  required
                  value={editingStory.rank}
                  onChange={(e) => setEditingStory({ ...editingStory, rank: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">প্রতিষ্ঠানের নাম:</label>
                <input
                  type="text"
                  required
                  value={editingStory.institution}
                  onChange={(e) => setEditingStory({ ...editingStory, institution: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">উক্তি (Quote):</label>
                <textarea
                  rows={3}
                  value={editingStory.quote}
                  onChange={(e) => setEditingStory({ ...editingStory, quote: e.target.value })}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="w-1/2 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#F59E0B] text-black font-bold rounded-xl hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
