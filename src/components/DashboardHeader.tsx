"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Copy, Check, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";
import StudentNotificationCenter from "./StudentNotificationCenter";

interface DashboardHeaderProps {
  role: "student" | "teacher" | "accountant" | "admin";
  studentCode?: string;
  studentId?: string;
  studentEmail?: string;
}

export default function DashboardHeader({
  role,
  studentCode,
  studentId,
  studentEmail,
}: DashboardHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!studentCode) return;
    navigator.clipboard.writeText(studentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
      {/* Unique Student ID Badge for Students */}
      {role === "student" && studentCode && (
        <button
          onClick={handleCopyCode}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30 hover:border-amber-400/60 text-amber-300 text-xs font-bold transition-all shadow-inner group"
          title="ক্লিক করে আইডি কপি করুন"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>আইডি: {studentCode}</span>
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-slate-400 group-hover:text-amber-300 transition-colors" />
          )}
        </button>
      )}

      {/* Notification Bell Center for Students */}
      {role === "student" && (
        <StudentNotificationCenter studentId={studentId} studentEmail={studentEmail} />
      )}

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
    </div>
  );
}
