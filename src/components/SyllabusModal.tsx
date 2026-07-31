"use client";

import { Course } from "@/data/courses";
import { X, BookOpen, Clock, CheckCircle2, ArrowRight } from "lucide-react";

interface SyllabusModalProps {
  course: Course | null;
  onClose: () => void;
  onOpenRegisterModal: (courseId?: string) => void;
}

export default function SyllabusModal({ course, onClose, onOpenRegisterModal }: SyllabusModalProps) {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#0F2644] to-[#08182D] border border-[#F59E0B]/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.15)] relative space-y-6 p-6 sm:p-8 max-h-[90vh] overflow-y-auto transform transition-all duration-300 my-auto">
        <div className="absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent shadow-[0_0_10px_#F59E0B]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-full border border-[#F59E0B]/30 shadow-sm">
              {course.categoryLabel}
            </span>
            <h3 className="text-xl font-black text-white mt-2">{course.title}</h3>
            <p className="text-xs text-slate-300">{course.tagline}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-3 bg-[#07182E] p-4 rounded-2xl border border-white/5 text-center text-xs">
          <div>
            <span className="text-slate-400 block">কোর্সের মেয়াদ</span>
            <span className="text-white font-bold">{course.duration}</span>
          </div>
          <div>
            <span className="text-slate-400 block">শুরুর তারিখ</span>
            <span className="text-[#F59E0B] font-bold">{course.startDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block">কোর্স ফি</span>
            <span className="text-emerald-400 font-bold">৳{course.price.toLocaleString("bn-BD")}</span>
          </div>
        </div>

        {/* Syllabus Breakdown List */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#F59E0B]" />
            <span>বিষয়ভিত্তিক বিস্তারিত লেকচার ও এক্সাম প্ল্যান</span>
          </h4>

          <div className="space-y-3">
            {course.syllabus.map((ch, idx) => (
              <div key={idx} className="bg-[#122744] p-4 rounded-xl border border-white/5 space-y-1">
                <h5 className="text-sm font-bold text-slate-200">{ch.title}</h5>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>• মোট লেকচার: {ch.lectures} টি</span>
                  <span>• OMR ও CBT এক্সাম: {ch.exams} টি</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <h4 className="text-xs font-bold text-slate-400">এই কোর্সের সাথে আরও যা কিছু পাচ্ছো:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {course.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenRegisterModal(course.id);
            }}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-black bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl flex items-center justify-center gap-2"
          >
            <span>ভর্তি ফর্ম পূরণ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
