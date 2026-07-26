"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ThemeToggler from "./ThemeToggler";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Calendar,
  LogOut,
  UserCheck,
  TrendingUp,
  FileText,
  HelpCircle,
  ShieldAlert,
  Coins
} from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

interface SidebarProps {
  role: "student" | "teacher" | "accountant" | "admin";
  activeTab: string;
}

export default function DashboardSidebar({ role, activeTab }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const menuItems = {
    student: [
      { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard, href: "/student/dashboard" },
      { id: "courses", label: "আমার কোর্সসমূহ", icon: BookOpen, href: "#courses" },
      { id: "tickets", label: "সহায়তা টিকিট", icon: HelpCircle, href: "#tickets" },
    ],
    teacher: [
      { id: "dashboard", label: "মেন্টর ড্যাশবোর্ড", icon: LayoutDashboard, href: "/teacher/dashboard" },
      { id: "content", label: "কারিকুলাম বিল্ডার", icon: BookOpen, href: "#content" },
      { id: "tickets", label: "শিক্ষার্থী টিকিট", icon: HelpCircle, href: "#tickets" },
    ],
    accountant: [
      { id: "dashboard", label: "ফিন্যান্সিয়াল ড্যাশবোর্ড", icon: LayoutDashboard, href: "/accountant/dashboard" },
      { id: "reports", label: "আয়-ব্যয় রিপোর্ট", icon: Coins, href: "#reports" },
      { id: "budget", label: "বাজেট প্ল্যানার", icon: TrendingUp, href: "#budget" },
    ],
    admin: [
      { id: "dashboard", label: "অ্যাডমিন প্যানেল", icon: LayoutDashboard, href: "/admin/dashboard" },
      { id: "users", label: "ইউজার রুল ম্যানেজমেন্ট", icon: UserCheck, href: "#users" },
      { id: "audit", label: "অডিট ট্রেইল", icon: ShieldAlert, href: "#audit" },
    ],
  };

  const activeRoleItems = menuItems[role] || menuItems.student;

  return (
    <aside className="w-64 bg-[#0D2038] border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      
      {/* Brand & Profile Header */}
      <div className="p-6 border-b border-white/5 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#07182E] border border-[#F59E0B]/30 flex items-center justify-center shadow-inner">
            <GraduationCap className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <span className="text-sm font-black text-white block">
              {SITE_CONFIG.name}
            </span>
            <span className="text-[9px] font-extrabold text-[#FACC15] uppercase tracking-widest block">
              {role} portal
            </span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        {activeRoleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? "bg-[#F59E0B] text-black shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout & Theme Switcher Footer */}
      <div className="p-4 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between gap-3 bg-[#07182E] p-2 rounded-2xl border border-white/5">
          <span className="text-[11px] font-bold text-slate-400 pl-2">থিম পরিবর্তন:</span>
          <ThemeToggler />
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>লগআউট করুন</span>
        </button>
      </div>

    </aside>
  );
}
