"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

interface NavbarProps {
  onOpenRegisterModal: (courseId?: string) => void;
}

export default function Navbar({ onOpenRegisterModal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "হোম", href: "#hero" },
    { name: "কোর্সসমূহ", href: "#courses" },
    { name: "আমাদের সম্পর্কে", href: "#challenge" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 sm:top-3 z-50 transition-all duration-300 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Floating White Navigation Container */}
      <div
        className={`w-full bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-300 px-4 sm:px-6 py-3 border border-slate-200/80 flex items-center justify-between ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-amber-950/10 py-2.5" : "bg-white"
        }`}
      >
        {/* Left: Official Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#07182E] via-[#0E2038] to-[#163255] p-0.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#07182E] rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#F59E0B]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-950 flex items-center gap-1">
              {SITE_CONFIG.name}
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            </span>
            <span className="text-[10px] font-extrabold text-[#D97706] tracking-wider uppercase">
              {SITE_CONFIG.tagline}
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-[#D97706] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#F59E0B] hover:after:w-full after:transition-all"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Side: Warm Golden Yellow CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => onOpenRegisterModal()}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F59E0B] via-[#FACC15] to-[#F59E0B] hover:from-[#FACC15] hover:to-[#F59E0B] rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>ফ্রি ক্লাসে যোগ দিন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => onOpenRegisterModal()}
            className="sm:hidden px-3 py-1.5 text-[11px] font-bold text-slate-950 bg-[#F59E0B] rounded-lg"
          >
            ফ্রি ক্লাস
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-800 hover:text-[#D97706] py-2 px-3 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegisterModal();
              }}
              className="w-full py-3 text-xs font-extrabold text-slate-950 bg-[#F59E0B] hover:bg-[#FACC15] rounded-xl shadow-md text-center flex items-center justify-center gap-2"
            >
              <span>ফ্রি ক্লাসে যোগ দিন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
