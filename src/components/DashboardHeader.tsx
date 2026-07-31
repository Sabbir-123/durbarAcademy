"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

interface DashboardHeaderProps {
  role: "student" | "teacher" | "accountant" | "admin";
}

export default function DashboardHeader({ role }: DashboardHeaderProps) {
  return (
    <Link href="/" className="flex items-center gap-3 group shrink-0">
      <div className="text-right">
        <span className="text-sm font-black text-white block">
          {SITE_CONFIG.name}
        </span>
        <span className="text-[9px] font-extrabold text-[#FACC15] uppercase tracking-widest block text-right">
          {role === "admin" ? "super admin" : role} portal
        </span>
      </div>
      <div className="w-9 h-9 rounded-xl bg-[#0D2038] border border-[#F59E0B]/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
        <GraduationCap className="w-5 h-5 text-[#F59E0B]" />
      </div>
    </Link>
  );
}
