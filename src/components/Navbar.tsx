"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Menu, X, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUser, setCurrentUser, isSuperAdminEmail, subscribeUserStore } from "@/utils/userStore";

interface NavbarProps {
  onOpenRegisterModal?: (courseId?: string) => void;
}

export default function Navbar({ onOpenRegisterModal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("student");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const checkAuthUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*, user_roles(role)")
          .eq("id", authUser.id)
          .maybeSingle();

        let localSaved: any = {};
        try {
          const raw = localStorage.getItem(`durbar_student_profile_${authUser.id}`);
          if (raw) localSaved = JSON.parse(raw);
        } catch {}

        const role =
          prof?.user_roles?.role ||
          (isSuperAdminEmail(authUser.email || "") ? "admin" : "student");

        setUser({
          id: authUser.id,
          email: authUser.email,
          full_name: prof?.full_name || localSaved.full_name || authUser.email?.split("@")[0] || "User",
          avatar_url: prof?.avatar_url || localSaved.avatar_url || "",
          role: role,
        });
        setUserRole(role);
      } else {
        const curr = getCurrentUser();
        if (curr) {
          setUser(curr);
          setUserRole(curr.role?.toLowerCase() || "student");
        } else {
          setUser(null);
        }
      }
    } catch {
      const curr = getCurrentUser();
      setUser(curr);
    }
  };

  useEffect(() => {
    checkAuthUser();
    const unsubStore = subscribeUserStore(() => checkAuthUser());
    return () => unsubStore();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setCurrentUser(null);
    setUser(null);
    router.push("/login");
  };

  const getDashboardHref = () => {
    if (!user) return "/login";
    const r = (userRole || user.role || "").toLowerCase();
    if (r.includes("admin")) return "/admin/dashboard";
    if (r.includes("teacher") || r.includes("instructor")) return "/teacher/dashboard";
    if (r.includes("accountant")) return "/accountant/dashboard";
    return "/student/dashboard";
  };

  const getProfileHref = () => {
    if (!user) return "/login";
    const r = (userRole || user.role || "").toLowerCase();
    if (r.includes("teacher") || r.includes("instructor")) return "/teacher/profile";
    return "/student/profile";
  };

  const navLinks = [
    { name: "হোম", href: "/" },
    { name: "কোর্সসমূহ", href: "/courses" },
    { name: "সাকসেস স্টোরি", href: "/success-stories" },
    { name: "আমাদের সম্পর্কে", href: "/#challenge" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 sm:top-3 z-50 transition-all duration-300 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Floating White Navigation Container */}
      <div
        className={`w-full bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-300 px-4 sm:px-6 py-3 border border-slate-200/80 flex items-center justify-between gap-4 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-amber-950/10 py-2.5" : "bg-white"
        }`}
      >
        {/* Left: Official Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#07182E] via-[#0E2038] to-[#163255] p-0.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#07182E] rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-950 flex items-center gap-1">
              {SITE_CONFIG.name}
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-[#D97706] tracking-wider uppercase">
              {SITE_CONFIG.tagline}
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm font-bold text-slate-700 shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-[#D97706] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#F59E0B] hover:after:w-full after:transition-all whitespace-nowrap"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Side: Logged In Controls or Login CTA */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              {/* User Profile Pill */}
              <Link
                href={getProfileHref()}
                className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/90 border border-slate-200/90 text-slate-900 transition-all flex items-center gap-2 shadow-sm hover:shadow group shrink-0"
                title="আমার প্রোফাইল সেটিং"
              >
                <div className="w-6 h-6 rounded-full bg-[#07182E] text-amber-400 font-black flex items-center justify-center text-[11px] overflow-hidden border border-amber-400/40 shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.full_name?.charAt(0)?.toUpperCase() || "U"}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900 truncate max-w-[95px] xl:max-w-[120px] group-hover:text-[#D97706] transition-colors">
                  {user.full_name}
                </span>
              </Link>

              {/* Dashboard Icon Button */}
              <Link
                href={getDashboardHref()}
                className="h-10 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] hover:from-[#FACC15] hover:to-[#F59E0B] text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 shrink-0"
                title="ড্যাশবোর্ডে প্রবেশ করুন"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-950 shrink-0" />
                <span>ড্যাশবোর্ড</span>
              </Link>

              {/* Log Out Button */}
              <button
                onClick={handleSignOut}
                className="h-10 w-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 transition-all flex items-center justify-center shrink-0 shadow-sm"
                title="লগআউট করুন"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="h-10 px-5 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] hover:from-[#FACC15] hover:to-[#F59E0B] rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Mobile / Tablet Menu Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href={getDashboardHref()}
                className="p-2 bg-[#F59E0B] text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1"
                title="ড্যাশবোর্ড"
              >
                <LayoutDashboard className="w-4 h-4" />
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200"
                title="লগআউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 text-[11px] font-bold text-slate-950 bg-[#F59E0B] rounded-lg"
            >
              লগইন
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-800 hover:text-[#D97706] py-2 px-3 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="space-y-2.5">
                <Link
                  href={getProfileHref()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-[#07182E] text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.full_name?.charAt(0)?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">{user.full_name}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{userRole} profile</span>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={getDashboardHref()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-xs font-bold text-slate-950 bg-[#F59E0B] rounded-xl text-center flex items-center justify-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>ড্যাশবোর্ড</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="py-2.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl text-center flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-xs font-extrabold text-slate-950 bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl shadow-md text-center flex items-center justify-center gap-2"
              >
                <span>লগইন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
