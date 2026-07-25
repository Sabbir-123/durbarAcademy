export interface StudentSuccess {
  id: string;
  name: string;
  rank: string;
  institution: string;
  program: string;
  hscCollege: string;
  quote: string;
  score: string;
  badgeColor: string;
}

export const TESTIMONIALS: StudentSuccess[] = [
  {
    id: "buet-1",
    name: "ফাহিম রেজওয়ান",
    rank: "মেধা স্থান: ০১",
    institution: "বুয়েট (BUET CSE '24)",
    program: "ইঞ্জিনিয়ারিং ভর্তি প্রোগ্রাম",
    hscCollege: "নটর ডেম কলেজ, ঢাকা",
    quote: "দুর্বার একাডেমির ডেইলি ওএমআর টেস্ট ও কনসেপ্ট সলভিং লাইভ ক্লাস আমার বুয়েট জয়ের মূল ভিত্তি ছিল। এখানকার ট্রিকস ও পার্সোনালাইজড সাপোর্ট অতুলনীয়!",
    score: "মার্কস: ৩৮৫/৪০০",
    badgeColor: "gold",
  },
  {
    id: "dmc-1",
    name: "নাসরিন আক্তার নাবিলা",
    rank: "মেধা স্থান: ০২",
    institution: "ঢাকা মেডিকেল কলেজ (DMC)",
    program: "মেডিকেল প্রাইম ব্যাচ",
    hscCollege: "ভিকারুননিসা নূন স্কুল অ্যান্ড কলেজ",
    quote: "মেডিকেল ভর্তি পরীক্ষায় প্রতিটি সেকেন্ড গুরুত্বপূর্ণ। দুরবারের সময় নিয়ন্ত্রণ গাইডলাইন ও ডেইলি এক্সাম আমাকে কনফিডেন্ট বানিয়েছিল।",
    score: "মার্কস: ৮৯.৫/১০০",
    badgeColor: "emerald",
  },
  {
    id: "du-1",
    name: "মেহেদী হাসান সাকিব",
    rank: "মেধা স্থান: ০৫",
    institution: "ঢাকা বিশ্ববিদ্যালয় (DU A-Unit)",
    program: "ভার্সিটি ক-ইউনিট স্পেশাল",
    hscCollege: "ঢাকা কলেজ, ঢাকা",
    quote: "লিখিত পরীক্ষার ভয় দূর করেছিল দুরবারের স্পেশাল ম্যানুয়াল খাতা মূল্যায়নের সিস্টেম। প্রতিটা ভুলের সলিউশন সাথে সাথে পেয়েছি।",
    score: "মার্কস: ১০৮.৫/১২০",
    badgeColor: "gold",
  },
  {
    id: "ckruet-1",
    name: "আরিফ শাহরিয়ার",
    rank: "মেধা স্থান: ১২",
    institution: "রুয়েট (RUET CSE)",
    program: "ইঞ্জিনিয়ারিং ক্র্যাশ কোর্স",
    hscCollege: "রাজশাহী কলেজ",
    quote: "অফলাইন আর অনলাইনের সেরা সংমিশ্রণ দুর্বার একাডেমি। শেষ ৩ মাসের রিভিশন মডিউল ছিল আমার টার্নিং পয়েন্ট।",
    score: "মার্কস: ৩৪৮/৪০০",
    badgeColor: "emerald",
  },
];
