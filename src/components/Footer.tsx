"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, PhoneCall, Mail, Globe, MessageSquare, Moon, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

interface FooterProps {
  onOpenRegisterModal?: () => void;
}

export default function Footer({ onOpenRegisterModal }: FooterProps) {
  const exploreLinks = [
    { name: "হোম", href: "/" },
    { name: "কোর্সসমূহ", href: "/courses" },
    { name: "সাকসেস স্টোরি", href: "/success-stories" },
    { name: "আমাদের সম্পর্কে", href: "/#challenge" },
    { name: "FAQ", href: "/#faq" },
    { name: "ফ্রি ক্লাস / ভর্তি", href: "#register" },
  ];

  return (
    <footer className="bg-[#030C18] text-slate-300 rounded-t-3xl sm:rounded-t-[36px] border-t border-white/10 pt-16 pb-10 sm:pt-20 sm:pb-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-[#F59E0B]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* TOP FOOTER: 3 Major Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 transform-gpu"
          >
            {/* Official Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#07182E] via-[#0E2038] to-[#163255] p-0.5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#07182E] rounded-[14px] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-[#F59E0B]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight flex items-center gap-1">
                  {SITE_CONFIG.name}
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                </span>
                <span className="text-[10px] font-extrabold text-[#F59E0B] tracking-wider uppercase">
                  {SITE_CONFIG.tagline}
                </span>
              </div>
            </Link>

            {/* Sub-tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#163255] border border-white/10 text-xs font-semibold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{SITE_CONFIG.tagline}</span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              {SITE_CONFIG.description}
            </p>
          </motion.div>

          {/* MIDDLE COLUMN: Explore Links */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 transform-gpu"
          >
            <h4 className="text-sm font-bold text-[#F59E0B] uppercase tracking-wider">
              Explore
            </h4>

            <ul className="space-y-3 text-sm font-semibold">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith("/") ? (
                    <Link
                      href={link.href}
                      className="text-slate-300 hover:text-[#F59E0B] transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      <span>{link.name}</span>
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (link.href === "#register" && onOpenRegisterModal) {
                          e.preventDefault();
                          onOpenRegisterModal();
                        }
                      }}
                      className="text-slate-300 hover:text-[#F59E0B] transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      <span>{link.name}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* RIGHT COLUMN: Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 transform-gpu"
          >
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              যোগাযোগ
            </h4>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 bg-[#07182E] p-5 rounded-2xl border border-white/10 shadow-lg">
              <div className="font-bold text-white text-base flex items-center gap-2">
                <span>{SITE_CONFIG.name}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ১০০% অনলাইন
                </span>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium text-emerald-300">{SITE_CONFIG.contact.platformStatus}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>হটলাইন: <a href={`tel:${SITE_CONFIG.contact.phone}`} className="text-white hover:text-[#F59E0B] font-bold">{SITE_CONFIG.contact.phone}</a></span>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>হোয়াটসঅ্যাপ: <a href={`https://wa.me/88${SITE_CONFIG.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-emerald-400 font-bold">{SITE_CONFIG.contact.whatsapp}</a></span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>ইমেইল: <a href={`mailto:${SITE_CONFIG.contact.email}`} className="text-white hover:text-[#F59E0B] font-bold">{SITE_CONFIG.contact.email}</a></span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* BOTTOM FOOTER (From Bottom) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400"
        >
          {/* Left Copyright */}
          <div>
            © {SITE_CONFIG.copyrightYear} <span className="text-white font-bold">{SITE_CONFIG.name}</span> • সর্বস্বত্ব সংরক্ষিত
          </div>

          {/* Right Legal Terms */}
          <div className="flex items-center gap-4 text-slate-300">
            <Link href="/#faq" className="hover:text-[#F59E0B] transition-colors">
              শর্তাবলি
            </Link>
            <span>•</span>
            <Link href="/#faq" className="hover:text-[#F59E0B] transition-colors">
              গোপনীয়তা নীতি
            </Link>
          </div>

          {/* Compact Theme Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#07182E] border border-white/10 text-[11px] text-slate-300">
            <Moon className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>ডার্ক মোড (ডিফল্ট)</span>
          </div>

        </motion.div>

      </div>
    </footer>
  );
}
