"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { createClient } from "@/utils/supabase/client";
import { Users, ShieldCheck, ListFilter, Trash2, Edit, Save, BookOpen, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [cmsSections, setCmsSections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "courses" | "cms" | "audit">("users");

  // CMS editor states
  const [cmsValue, setCmsValue] = useState("প্রচলিত প্রস্তুতির যে ভুলগুলো আপনার স্বপ্নকে পিছিয়ে দেয়");

  // Course addition states
  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(prof);

      // Seed profiles and roles fallback
      setUsersList([
        { id: "u1", full_name: "সাকিব আহমেদ", email: "sakib@durbar.com", role: "student" },
        { id: "u2", full_name: "ড. সাজ্জাদ হোসেন", email: "sajjad@durbar.com", role: "teacher" },
        { id: "u3", full_name: "রকিবুল ইসলাম", email: "rokibul@durbar.com", role: "accountant" },
        { id: "u4", full_name: "আহমেদ সাব্বির", email: "ahmedsabbir2013@gmail.com", role: "admin" },
      ]);

      // Seed audit logs fallback
      setAuditLogs([
        { id: "aud1", timestamp: "আজ, ১২:৩০", actor: "ahmedsabbir2013@gmail.com", role: "admin", action: "PROMOTE_USER", details: "Promoted sakib@durbar.com to teacher" },
        { id: "aud2", timestamp: "আজ, ১১:১৫", actor: "sajjad@durbar.com", role: "teacher", action: "CREATE_LESSON", details: "Added lecture Concept Limit" },
        { id: "aud3", timestamp: "গতকাল, ১৪:০০", actor: "rokibul@durbar.com", role: "accountant", action: "APPROVE_EXPENSE", details: "Approved requisition e1 (৳১৫০০)" },
      ]);

      // Seed courses fallback
      setCourses([
        { id: "c1", title: "বুয়েট ও সিকেআরইউইটি স্পেশাল অ্যাডমিশন ২০২৬", price: 9500 },
        { id: "c2", title: "ডিএমসি মেডিকেল ভর্তি প্রিপারেশন মাস্টারক্লাস", price: 8900 },
      ]);
    }
    loadData();
  }, []);

  const handleRoleReassignment = (userId: string, newRole: string) => {
    alert(`ইউজারের রোল পরিবর্তন করে ${newRole} করা হয়েছে।`);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    // Append to audit logs client side
    setAuditLogs((prev) => [
      {
        id: Date.now().toString(),
        timestamp: "এখন",
        actor: profile?.email || "admin",
        role: "admin",
        action: "PROMOTE_USER",
        details: `Reassigned role to ${newRole}`,
      },
      ...prev,
    ]);
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !coursePrice) return;

    setCourses((prev) => [
      ...prev,
      { id: Date.now().toString(), title: courseTitle, price: parseFloat(coursePrice) },
    ]);

    setAuditLogs((prev) => [
      {
        id: Date.now().toString(),
        timestamp: "এখন",
        actor: profile?.email || "admin",
        role: "admin",
        action: "CREATE_COURSE",
        details: `Created new course: ${courseTitle}`,
      },
      ...prev,
    ]);

    setCourseTitle("");
    setCoursePrice("");
  };

  const handleSaveCMS = () => {
    alert("পাবলিক হোমপেজ কপি সফলভাবে আপডেট করা হয়েছে।");
    setAuditLogs((prev) => [
      {
        id: Date.now().toString(),
        timestamp: "এখন",
        actor: profile?.email || "admin",
        role: "admin",
        action: "UPDATE_CMS",
        details: "Updated homepage pain points main heading copy",
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#07182E] text-white flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar role="admin" activeTab="dashboard" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8">
        
        {/* Top Welcomer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wider block">
              super admin center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              স্বাগতম, {profile?.full_name || "অ্যাডমিন"}!
            </h1>
            <p className="text-xs text-slate-300">
              ইউজার রোল প্রমোশন, কারিকুলাম অনুমোদন, সিএমএস কপি পরিবর্তন এবং অডিট ট্রেইল পর্যালোচনা।
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "users" ? "bg-[#F59E0B] text-black" : "bg-white/5 border border-white/10 text-slate-300"
              }`}
            >
              ইউজার রোল
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "courses" ? "bg-[#F59E0B] text-black" : "bg-white/5 border border-white/10 text-slate-300"
              }`}
            >
              কোর্সসমূহ
            </button>
            <button
              onClick={() => setActiveTab("cms")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "cms" ? "bg-[#F59E0B] text-black" : "bg-white/5 border border-white/10 text-slate-300"
              }`}
            >
              সিএমএস কপি
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "audit" ? "bg-[#F59E0B] text-black" : "bg-white/5 border border-white/10 text-slate-300"
              }`}
            >
              অডিট লগ
            </button>
          </div>
        </div>

        {activeTab === "users" && (
          <section id="users" className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F59E0B]" />
              <span>ইউজার রুল এবং রোল রিঅ্যাসাইনমেন্ট</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 pb-2 text-left">
                    <th className="pb-2">নাম</th>
                    <th className="pb-2">ইমেল ঠিকানা</th>
                    <th className="pb-2">বর্তমান রোল</th>
                    <th className="pb-2 text-right">রোল পরিবর্তন</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 last:border-0">
                      <td className="py-3 font-bold text-white">{u.full_name}</td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3">
                        <span className="bg-[#07182E] border border-white/10 px-2 py-0.5 rounded capitalize font-bold text-slate-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {u.role !== "admin" ? (
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => handleRoleReassignment(u.id, "teacher")}
                              className="px-2.5 py-1 bg-[#FACC15]/10 hover:bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/20 rounded font-semibold text-[10px]"
                            >
                              Teacher
                            </button>
                            <button
                              onClick={() => handleRoleReassignment(u.id, "accountant")}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded font-semibold text-[10px]"
                            >
                              Accountant
                            </button>
                            <button
                              onClick={() => handleRoleReassignment(u.id, "student")}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded font-semibold text-[10px]"
                            >
                              Student
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold italic">সুপার অ্যাডমিন (লকড)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Existing courses lists */}
            <div className="lg:col-span-7 bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FACC15]" />
                <span>অ্যাকাডেমি কোর্সসমূহ</span>
              </h3>

              <div className="space-y-3">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#07182E] p-4 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-white">{c.title}</span>
                    <span className="font-mono text-emerald-400">৳{c.price.toLocaleString("bn-BD")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Create new course */}
            <div className="lg:col-span-5 bg-[#0D2038] border border-white/10 rounded-3xl p-6 h-fit space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>নতুন কোর্স যুক্ত করুন</span>
              </h3>

              <form onSubmit={handleAddCourse} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">কোর্সের শিরোনাম:*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ইঞ্জিনিয়ারিং ফান্ডামেন্টাল ২০২৩"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">মূল্য (৳):*</label>
                  <input
                    type="number"
                    required
                    placeholder="যেমন: ৭৯০০"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-slate-950 bg-[#F59E0B] rounded-xl"
                >
                  কোর্স তৈরি করুন
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "cms" && (
          <section id="cms" className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#F59E0B]" />
              <span>পাবলিক ল্যান্ডিং পেজ কনফিগারেশন (সিএমএস)</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">স্টুডেন্ট চ্যালেঞ্জ সেকশন হেডিং কপি:</label>
                <textarea
                  rows={3}
                  value={cmsValue}
                  onChange={(e) => setCmsValue(e.target.value)}
                  className="w-full bg-[#07182E] border border-white/10 rounded-xl p-4 text-xs text-white outline-none"
                />
              </div>

              <button
                onClick={handleSaveCMS}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-[#F59E0B] rounded-xl flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>হেডিং কপি সংরক্ষণ করুন</span>
              </button>
            </div>
          </section>
        )}

        {activeTab === "audit" && (
          <section id="audit" className="bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-400" />
                <span>সিস্টেম অডিট ট্রেইল (Immutable & Append-Only)</span>
              </h3>
              <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded text-[10px] font-bold border border-red-500/20">
                READ ONLY MODE
              </span>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#07182E] p-4 rounded-xl border border-white/5 text-xs space-y-2 relative"
                >
                  <div className="flex justify-between text-slate-400">
                    <span>{log.timestamp}</span>
                    <span className="font-bold text-[#FACC15]">{log.action}</span>
                  </div>
                  <div>
                    <span className="text-slate-300">কর্তা: {log.actor} ({log.role})</span>
                    <p className="text-white mt-1 font-mono">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
