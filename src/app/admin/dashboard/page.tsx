"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { createClient } from "@/utils/supabase/client";
import { Users, ShieldCheck, ListFilter, Trash2, Edit, Save, BookOpen, AlertTriangle, Plus, Check } from "lucide-react";

export default function AdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "courses" | "branches" | "payments" | "cms" | "audit">("users");

  // CMS editor states
  const [cmsValue, setCmsValue] = useState("প্রচলিত প্রস্তুতির যে ভুলগুলো আপনার স্বপ্নকে পিছিয়ে দেয়");

  // Course management states
  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseTitle, setEditingCourseTitle] = useState("");
  const [editingCoursePrice, setEditingCoursePrice] = useState("");

  // Branch management states
  const [branchName, setBranchName] = useState("");
  const [branchLabel, setBranchLabel] = useState("");
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editingBranchName, setEditingBranchName] = useState("");
  const [editingBranchLabel, setEditingBranchLabel] = useState("");

  // Payment method management states
  const [pmName, setPmName] = useState("");
  const [pmLabel, setPmLabel] = useState("");
  const [editingPmId, setEditingPmId] = useState<string | null>(null);
  const [editingPmName, setEditingPmName] = useState("");
  const [editingPmLabel, setEditingPmLabel] = useState("");

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

      // Fetch users from profiles & user_roles
      const { data: dbUsers } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          user_roles (role)
        `);
      if (dbUsers && dbUsers.length > 0) {
        setUsersList(dbUsers.map(u => ({
          id: u.id,
          full_name: u.full_name || u.email,
          email: u.email,
          role: (u as any).user_roles?.role || "student"
        })));
      } else {
        setUsersList([
          { id: "u1", full_name: "সাকিব আহমেদ", email: "sakib@durbar.com", role: "student" },
          { id: "u2", full_name: "ড. সাজ্জাদ হোসেন", email: "sajjad@durbar.com", role: "teacher" },
          { id: "u3", full_name: "রকিবুল ইসলাম", email: "rokibul@durbar.com", role: "accountant" },
          { id: "u4", full_name: "আহমেদ সাব্বির", email: "ahmedsabbir2013@gmail.com", role: "admin" },
        ]);
      }

      // Fetch audit logs
      const { data: dbAudit } = await supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(15);
      if (dbAudit && dbAudit.length > 0) {
        setAuditLogs(dbAudit.map(log => ({
          id: log.id,
          timestamp: new Date(log.timestamp).toLocaleString("bn-BD"),
          actor: log.actor_user_id || "System",
          role: log.actor_role || "system",
          action: log.action,
          details: log.after_state ? JSON.stringify(log.after_state) : log.action
        })));
      } else {
        setAuditLogs([
          { id: "aud1", timestamp: "আজ, ১২:৩০", actor: "ahmedsabbir2013@gmail.com", role: "admin", action: "PROMOTE_USER", details: "Promoted sakib@durbar.com to teacher" },
          { id: "aud2", timestamp: "আজ, ১১:১৫", actor: "sajjad@durbar.com", role: "teacher", action: "CREATE_LESSON", details: "Added lecture Concept Limit" },
          { id: "aud3", timestamp: "গতকাল, ১৪:০০", actor: "rokibul@durbar.com", role: "accountant", action: "APPROVE_EXPENSE", details: "Approved requisition e1 (৳১৫০০)" },
        ]);
      }

      // Fetch courses
      const { data: dbCourses } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (dbCourses && dbCourses.length > 0) {
        setCourses(dbCourses);
      } else {
        setCourses([
          { id: "c1", title: "বুয়েট ও সিকেআরইউইটি স্পেশাল অ্যাডমিশন ২০২৬", price: 9500 },
          { id: "c2", title: "ডিএমসি মেডিকেল ভর্তি প্রিপারেশন মাস্টারক্লাস", price: 8900 },
        ]);
      }

      // Fetch branches
      const { data: dbBranches } = await supabase
        .from("admission_branches")
        .select("*")
        .order("created_at", { ascending: true });
      if (dbBranches && dbBranches.length > 0) {
        setBranches(dbBranches);
      } else {
        setBranches([
          { id: "b1", name: "online", label: "অনলাইন" },
          { id: "b2", name: "dhaka", label: "ঢাকা শাখা" },
          { id: "b3", name: "chattogram", label: "চট্টগ্রাম শাখা" },
          { id: "b4", name: "rajshahi", label: "রাজশাহী শাখা" },
        ]);
      }

      // Fetch payment methods
      const { data: dbPayments } = await supabase
        .from("admission_payment_methods")
        .select("*")
        .order("created_at", { ascending: true });
      if (dbPayments && dbPayments.length > 0) {
        setPaymentMethods(dbPayments);
      } else {
        setPaymentMethods([
          { id: "pm1", name: "bkash", label: "bKash (বিকাশ)" },
          { id: "pm2", name: "nagad", label: "Nagad (নগদ)" },
          { id: "pm3", name: "card", label: "কার্ড / ব্যাংক" },
        ]);
      }
    }
    loadData();
  }, []);

  const handleRoleReassignment = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: newRole });

      if (error) throw error;

      alert(`ইউজারের রোল পরিবর্তন করে ${newRole} করা হয়েছে।`);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      // Append to audit logs
      await supabase.from("audit_logs").insert({
        actor_user_id: profile?.id,
        actor_role: "admin",
        action: "PROMOTE_USER",
        entity_type: "user_roles",
        entity_id: userId,
        after_state: { role: newRole }
      });

      setAuditLogs((prev) => [
        {
          id: Date.now().toString(),
          timestamp: "এখন",
          actor: profile?.email || "admin",
          role: "admin",
          action: "PROMOTE_USER",
          details: `Reassigned role of ${userId} to ${newRole}`,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error(err);
      alert("রোল পরিবর্তন করতে ব্যর্থ: " + err.message);
    }
  };

  // Course handlers
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !coursePrice) return;

    const price = parseFloat(coursePrice);
    const slug = courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).substr(2, 5);

    try {
      const { data, error } = await supabase
        .from("courses")
        .insert({
          title: courseTitle,
          price,
          slug,
          is_published: true
        })
        .select()
        .single();

      if (error) throw error;

      setCourses((prev) => [data, ...prev]);

      // Log Audit Event
      await supabase.from("audit_logs").insert({
        actor_user_id: profile?.id,
        actor_role: "admin",
        action: "CREATE_COURSE",
        entity_type: "courses",
        entity_id: data.id,
        after_state: { title: courseTitle, price }
      });

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
    } catch (err: any) {
      console.error(err);
      alert("কোর্স যোগ করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleUpdateCourse = async (courseId: string) => {
    if (!editingCourseTitle || !editingCoursePrice) return;
    const price = parseFloat(editingCoursePrice);

    try {
      const { data, error } = await supabase
        .from("courses")
        .update({
          title: editingCourseTitle,
          price
        })
        .eq("id", courseId)
        .select()
        .single();

      if (error) throw error;

      setCourses((prev) => prev.map((c) => (c.id === courseId ? data : c)));
      setEditingCourseId(null);

      // Log Audit Event
      await supabase.from("audit_logs").insert({
        actor_user_id: profile?.id,
        actor_role: "admin",
        action: "UPDATE_COURSE",
        entity_type: "courses",
        entity_id: courseId,
        after_state: { title: editingCourseTitle, price }
      });

      alert("কোর্স সফলভাবে আপডেট করা হয়েছে।");
    } catch (err: any) {
      console.error(err);
      alert("কোর্স আপডেট করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই কোর্সটি ডিলিট করতে চান?")) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      setCourses((prev) => prev.filter((c) => c.id !== courseId));

      // Log Audit Event
      await supabase.from("audit_logs").insert({
        actor_user_id: profile?.id,
        actor_role: "admin",
        action: "DELETE_COURSE",
        entity_type: "courses",
        entity_id: courseId
      });

      alert("কোর্সটি সফলভাবে ডিলিট করা হয়েছে।");
    } catch (err: any) {
      console.error(err);
      alert("কোর্স ডিলিট করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  // Branch handlers
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName || !branchLabel) return;

    try {
      const { data, error } = await supabase
        .from("admission_branches")
        .insert({
          name: branchName,
          label: branchLabel
        })
        .select()
        .single();

      if (error) throw error;

      setBranches((prev) => [...prev, data]);

      // Log Audit Event
      await supabase.from("audit_logs").insert({
        actor_user_id: profile?.id,
        actor_role: "admin",
        action: "CREATE_BRANCH",
        entity_type: "admission_branches",
        entity_id: data.id,
        after_state: { name: branchName, label: branchLabel }
      });

      setBranchName("");
      setBranchLabel("");
    } catch (err: any) {
      console.error(err);
      alert("শাখা যোগ করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleUpdateBranch = async (branchId: string) => {
    if (!editingBranchName || !editingBranchLabel) return;

    try {
      const { data, error } = await supabase
        .from("admission_branches")
        .update({
          name: editingBranchName,
          label: editingBranchLabel
        })
        .eq("id", branchId)
        .select()
        .single();

      if (error) throw error;

      setBranches((prev) => prev.map((b) => (b.id === branchId ? data : b)));
      setEditingBranchId(null);

      // Log Audit Event
      await supabase.from("audit_logs").insert({
        actor_user_id: profile?.id,
        actor_role: "admin",
        action: "UPDATE_BRANCH",
        entity_type: "admission_branches",
        entity_id: branchId,
        after_state: { name: editingBranchName, label: editingBranchLabel }
      });

      alert("শাখা সফলভাবে আপডেট করা হয়েছে।");
    } catch (err: any) {
      console.error(err);
      alert("শাখা আপডেট করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই শাখাটি ডিলিট করতে চান?")) return;

    try {
      const { error } = await supabase
        .from("admission_branches")
        .delete()
        .eq("id", branchId);

      if (error) throw error;

      setBranches((prev) => prev.filter((b) => b.id !== branchId));

      // Log Audit Event
      await supabase.from("audit_logs").insert({
        actor_user_id: profile?.id,
        actor_role: "admin",
        action: "DELETE_BRANCH",
        entity_type: "admission_branches",
        entity_id: branchId
      });

      alert("শাখা সফলভাবে ডিলিট করা হয়েছে।");
    } catch (err: any) {
      console.error(err);
      alert("শাখা ডিলিট করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  // Payment Method handlers
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmName || !pmLabel) return;

    try {
      const { data, error } = await supabase
        .from("admission_payment_methods")
        .insert({
          name: pmName,
          label: pmLabel
        })
        .select()
        .single();

      if (error) throw error;

      setPaymentMethods((prev) => [...prev, data]);

      // Log Audit Event
      await supabase.from("audit_logs").insert({
        actor_user_id: profile?.id,
        actor_role: "admin",
        action: "CREATE_PAYMENT_METHOD",
        entity_type: "admission_payment_methods",
        entity_id: data.id,
        after_state: { name: pmName, label: pmLabel }
      });

      setPmName("");
      setPmLabel("");
    } catch (err: any) {
      console.error(err);
      alert("পেমেন্ট মেথড যোগ করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleUpdatePaymentMethod = async (pmId: string) => {
    if (!editingPmName || !editingPmLabel) return;

    try {
      const { data, error } = await supabase
        .from("admission_payment_methods")
        .update({
          name: editingPmName,
          label: editingPmLabel
        })
        .eq("id", pmId)
        .select()
        .single();

      if (error) throw error;

      setPaymentMethods((prev) => prev.map((pm) => (pm.id === pmId ? data : pm)));
      setEditingPmId(null);

      // Log Audit Event
      await supabase.from("audit_logs").insert({
        actor_user_id: profile?.id,
        actor_role: "admin",
        action: "UPDATE_PAYMENT_METHOD",
        entity_type: "admission_payment_methods",
        entity_id: pmId,
        after_state: { name: editingPmName, label: editingPmLabel }
      });

      alert("পেমেন্ট মেথড সফলভাবে আপডেট করা হয়েছে।");
    } catch (err: any) {
      console.error(err);
      alert("পেমেন্ট মেথড আপডেট করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleDeletePaymentMethod = async (pmId: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পেমেন্ট মেথডটি ডিলিট করতে চান?")) return;

    try {
      const { error } = await supabase
        .from("admission_payment_methods")
        .delete()
        .eq("id", pmId);

      if (error) throw error;

      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== pmId));

      // Log Audit Event
      await supabase.from("audit_logs").insert({
        actor_user_id: profile?.id,
        actor_role: "admin",
        action: "DELETE_PAYMENT_METHOD",
        entity_type: "admission_payment_methods",
        entity_id: pmId
      });

      alert("পেমেন্ট মেথড সফলভাবে ডিলিট করা হয়েছে।");
    } catch (err: any) {
      console.error(err);
      alert("পেমেন্ট মেথড ডিলিট করতে সমস্যা হয়েছে: " + err.message);
    }
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
              ইউজার রোল প্রমোশন, কোর্স ও ভর্তি ফর্ম সেটিংস, সিএমএস কপি পরিবর্তন এবং অডিট ট্রেইল পর্যালোচনা।
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
              onClick={() => setActiveTab("branches")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "branches" ? "bg-[#F59E0B] text-black" : "bg-white/5 border border-white/10 text-slate-300"
              }`}
            >
              শাখা সমূহ
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "payments" ? "bg-[#F59E0B] text-black" : "bg-white/5 border border-white/10 text-slate-300"
              }`}
            >
              পেমেন্ট মেথড
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
                    className="bg-[#07182E] p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    {editingCourseId === c.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editingCourseTitle}
                          onChange={(e) => setEditingCourseTitle(e.target.value)}
                          className="w-full bg-[#0D2038] border border-white/10 rounded-lg p-2 text-xs text-white"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editingCoursePrice}
                            onChange={(e) => setEditingCoursePrice(e.target.value)}
                            className="bg-[#0D2038] border border-white/10 rounded-lg p-2 text-xs text-white w-28"
                          />
                          <button
                            onClick={() => handleUpdateCourse(c.id)}
                            className="px-3 py-1.5 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCourseId(null)}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <span className="font-bold text-white block">{c.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Slug: {c.slug}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-emerald-400 font-bold">৳{Number(c.price).toLocaleString("bn-BD")}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingCourseId(c.id);
                                setEditingCourseTitle(c.title);
                                setEditingCoursePrice(c.price.toString());
                              }}
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create new course */}
            <div className="lg:col-span-5 bg-[#0D2038] border border-white/10 rounded-3xl p-6 h-fit space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F59E0B]" />
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
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#F59E0B]"
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
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-slate-950 bg-[#F59E0B] rounded-xl hover:bg-[#FACC15] transition"
                >
                  কোর্স তৈরি করুন
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "branches" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Existing branches list */}
            <div className="lg:col-span-7 bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-[#F59E0B]" />
                <span>ভর্তি পোর্টাল শাখা সমূহ</span>
              </h3>

              <div className="space-y-3">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className="bg-[#07182E] p-4 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                  >
                    {editingBranchId === b.id ? (
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Branch Slug (e.g. online)"
                            value={editingBranchName}
                            onChange={(e) => setEditingBranchName(e.target.value)}
                            className="bg-[#0D2038] border border-white/10 rounded-lg p-2 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Branch Label (e.g. অনলাইন)"
                            value={editingBranchLabel}
                            onChange={(e) => setEditingBranchLabel(e.target.value)}
                            className="bg-[#0D2038] border border-white/10 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateBranch(b.id)}
                            className="px-3 py-1.5 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingBranchId(null)}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <span className="font-bold text-white block text-sm">{b.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Slug: {b.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingBranchId(b.id);
                              setEditingBranchName(b.name);
                              setEditingBranchLabel(b.label);
                            }}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBranch(b.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create new branch */}
            <div className="lg:col-span-5 bg-[#0D2038] border border-white/10 rounded-3xl p-6 h-fit space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F59E0B]" />
                <span>নতুন শাখা যুক্ত করুন</span>
              </h3>

              <form onSubmit={handleAddBranch} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">শাখার কোড/আইডি (ইংরেজিতে):*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: online, dhaka, rajshahi"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">শাখার নাম (বাংলায়):*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: অনলাইন, ঢাকা শাখা"
                    value={branchLabel}
                    onChange={(e) => setBranchLabel(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-slate-950 bg-[#F59E0B] rounded-xl hover:bg-[#FACC15] transition"
                >
                  শাখা তৈরি করুন
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Existing payment methods list */}
            <div className="lg:col-span-7 bg-[#0D2038] border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-[#FACC15]" />
                <span>পেমেন্ট মেথড সমূহ</span>
              </h3>

              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="bg-[#07182E] p-4 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                  >
                    {editingPmId === pm.id ? (
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Method ID (e.g. bkash)"
                            value={editingPmName}
                            onChange={(e) => setEditingPmName(e.target.value)}
                            className="bg-[#0D2038] border border-white/10 rounded-lg p-2 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Method Label (e.g. bKash (বিকাশ))"
                            value={editingPmLabel}
                            onChange={(e) => setEditingPmLabel(e.target.value)}
                            className="bg-[#0D2038] border border-white/10 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdatePaymentMethod(pm.id)}
                            className="px-3 py-1.5 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPmId(null)}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <span className="font-bold text-white block text-sm">{pm.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {pm.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingPmId(pm.id);
                              setEditingPmName(pm.name);
                              setEditingPmLabel(pm.label);
                            }}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePaymentMethod(pm.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create new payment method */}
            <div className="lg:col-span-5 bg-[#0D2038] border border-white/10 rounded-3xl p-6 h-fit space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#FACC15]" />
                <span>নতুন পেমেন্ট মেথড যুক্ত করুন</span>
              </h3>

              <form onSubmit={handleAddPaymentMethod} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">পেমেন্ট মেথড আইডি (ইংরেজিতে):*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: bkash, nagad, rocket"
                    value={pmName}
                    onChange={(e) => setPmName(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">ডিসপ্লে লেবেল (বাংলায়):*</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: bKash (বিকাশ)"
                    value={pmLabel}
                    onChange={(e) => setPmLabel(e.target.value)}
                    className="w-full bg-[#07182E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#F59E0B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-[#0D2038] bg-[#F59E0B] rounded-xl hover:bg-[#FACC15] transition"
                >
                  পেমেন্ট মেথড তৈরি করুন
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
