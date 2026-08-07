"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, XCircle, AlertTriangle, Info, ArrowRight, ExternalLink } from "lucide-react";

interface NotificationItem {
  id: string;
  student_id: string;
  student_email: string;
  title: string;
  message: string;
  type: "approved" | "rejected" | "modification_needed" | "info";
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

interface StudentNotificationCenterProps {
  studentId?: string;
  studentEmail?: string;
}

export default function StudentNotificationCenter({
  studentId,
  studentEmail,
}: StudentNotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!studentId && !studentEmail) return;
    try {
      const url = `/api/notifications?${studentId ? `student_id=${encodeURIComponent(studentId)}` : ""}&${
        studentEmail ? `student_email=${encodeURIComponent(studentEmail)}` : ""
      }`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (e) {
      console.warn("Error fetching student notifications:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [studentId, studentEmail]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
      case "modification_needed":
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Pulse Glow */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all shadow-md group"
        title="নোটিফিকেশন ও আপডেট"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-[10px] font-black text-white shadow-lg animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-[#091E3A]/95 backdrop-blur-xl border border-white/15 shadow-2xl p-4 z-50 animate-fade-in text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">নোটিফিকেশন সেন্টার</h4>
            </div>
            {unreadCount > 0 ? (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                {unreadCount} টি নতুন
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">সব পড়া হয়েছে</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <Info className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-xs">এখনো কোনো নোটিফিকেশন নেই</p>
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2 ${
                    !notif.is_read
                      ? "bg-white/10 border-amber-400/40 shadow-md"
                      : "bg-white/5 border-white/10 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {getIcon(notif.type)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-white text-[13px]">{notif.title}</h5>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {notif.action_url && (
                    <div className="pt-2 flex justify-end">
                      <Link
                        href={notif.action_url}
                        onClick={() => {
                          markAsRead(notif.id);
                          setIsOpen(false);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                          notif.type === "approved"
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : notif.type === "modification_needed"
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white animate-bounce-subtle"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        {notif.type === "approved" && "ক্লাস দেখুন"}
                        {notif.type === "modification_needed" && "তথ্য সংশোধন করুন"}
                        {notif.type === "rejected" && "কোর্স পেইজে যান"}
                        {notif.type === "info" && "বিস্তারিত দেখুন"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 text-right">
                    {new Date(notif.created_at).toLocaleTimeString("bn-BD", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
