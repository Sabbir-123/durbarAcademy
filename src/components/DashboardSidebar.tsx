"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ThemeToggler from "./ThemeToggler";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  UserCheck,
  TrendingUp,
  HelpCircle,
  ShieldAlert,
  Coins,
  Trophy,
  Video,
  CreditCard,
  Compass,
} from "lucide-react";

interface SidebarProps {
  role: "student" | "teacher" | "accountant" | "admin";
  activeTab: string;
  onTabChange?: (tab: string) => void;
  userName?: string;
}

export default function DashboardSidebar({ role, activeTab, onTabChange, userName }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const menuItems = {
    student: [
      { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard, href: "/student/dashboard" },
      { id: "courses", label: "আমার কোর্সসমূহ", icon: BookOpen, href: "/student/courses" },
      { id: "all-courses", label: "সকল কোর্সসমূহ", icon: Compass, href: "/courses" },
      { id: "profile", label: "আমার প্রোফাইল", icon: UserCheck, href: "/student/profile" },
    ],
    teacher: [
      { id: "dashboard", label: "ইনস্ট্রাক্টর ড্যাশবোর্ড", icon: LayoutDashboard, href: "/teacher/dashboard" },
      { id: "classes", label: "ক্লাস ম্যানেজার", icon: Video, href: "/teacher/classes" },
      { id: "profile", label: "আমার প্রোফাইল", icon: UserCheck, href: "/teacher/profile" },
      { id: "stories", label: "সাকসেস স্টোরি", icon: Trophy, href: "/teacher/stories" },
    ],
    accountant: [
      { id: "dashboard", label: "ফিন্যান্সিয়াল ড্যাশবোর্ড", icon: LayoutDashboard, href: "/accountant/dashboard" },
      { id: "reports", label: "আয়-ব্যয় রিপোর্ট", icon: Coins, href: "/accountant/dashboard#reports" },
      { id: "budget", label: "বাজেট প্ল্যানার", icon: TrendingUp, href: "/accountant/dashboard#budget" },
    ],
    admin: [
      { id: "dashboard", label: "ড্যাশবোর্ড (Overview)", icon: LayoutDashboard, href: "/admin/dashboard#dashboard" },
      { id: "users", label: "ইউজার রুল ম্যানেজমেন্ট", icon: UserCheck, href: "/admin/dashboard#users" },
      { id: "courses", label: "কোর্সসমূহ পরিচালনা", icon: BookOpen, href: "/admin/dashboard#courses" },
      { id: "stories", label: "সাকসেস স্টোরি", icon: Trophy, href: "/admin/dashboard#stories" },
      { id: "finance", label: "ফাইনান্স", icon: Coins, href: "/admin/dashboard#finance" },
      { id: "payment", label: "পেমেন্ট ডিটেইলস", icon: CreditCard, href: "/admin/dashboard#payment" },
      { id: "audit", label: "অডিট ট্রেইল", icon: ShieldAlert, href: "/admin/dashboard#audit" },
    ],
  };

  const activeRoleItems = menuItems[role] || menuItems.student;

  return (
    <aside className="w-64 bg-[#0D2038] border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Profile Header */}
      {userName ? (
        <div className="p-6 border-b border-white/5">
          <div className="p-3 bg-[#07182E] border border-white/5 rounded-2xl space-y-1 shadow-inner">
            <span className="text-[9px] font-bold text-[#FACC15] uppercase tracking-wider block">
              {role === "admin" ? "super admin center" : "user profile"}
            </span>
            <div className="text-xs font-bold text-white truncate">
              স্বাগতম, {userName}!
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-6" />
      )}

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        {activeRoleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                if (onTabChange) {
                  onTabChange(item.id);
                }
              }}
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
