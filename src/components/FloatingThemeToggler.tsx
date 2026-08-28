"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function FloatingThemeToggler() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  if (!mounted) return null;

  return (
    <div 
      className="fixed z-50 group no-invert pointer-events-auto"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
        right: "max(1rem, env(safe-area-inset-right, 1rem))",
      }}
    >
      <button
        onClick={toggleTheme}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#07182E]/90 border border-white/20 text-white shadow-2xl backdrop-blur-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all group-hover:border-[#F59E0B] theme-floating-button transform-gpu will-change-transform"
        aria-label="Toggle Theme"
        title="থিম পরিবর্তন করুন (Light / Dark Mode)"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-[#FACC15] theme-icon drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
        ) : (
          <Moon className="w-5 h-5 text-amber-500 theme-icon drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]" />
        )}
      </button>

      {/* Hover Tooltip Badge (Hidden on mobile touch screens to prevent overflow) */}
      <span className="hidden sm:block absolute bottom-14 right-0 px-3 py-1 bg-slate-900/90 text-amber-300 text-[11px] font-bold rounded-xl shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {theme === "dark" ? "☀️ লাইট থিম চালু করুন" : "🌙 ডার্ক থিম চালু করুন"}
      </span>
    </div>
  );
}
