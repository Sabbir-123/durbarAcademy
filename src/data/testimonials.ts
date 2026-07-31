export interface StudentSuccess {
  id: string;
  name: string;
  rank: string;
  institution: string;
  category?: "bafa" | "bma" | "bn" | "issb" | "general";
  program: string;
  hscCollege: string;
  quote: string;
  score: string;
  badgeColor: "gold" | "emerald" | "blue";
  imageUrl?: string;
  published?: boolean;
}

export const INITIAL_SUCCESS_STORIES: StudentSuccess[] = [
  {
    id: "bafa-1",
    name: "ক্যাডেট ফাহিম রেজওয়ান",
    rank: "মেধা স্থান: ০১ (ফ্লাইট ক্যাডেট)",
    institution: "বাংলাদেশ বিমান বাহিনী (BAFA 88th Officer Cadet)",
    category: "bafa",
    program: "BAFA Preliminary & Psychometric Mastery",
    hscCollege: "নটর ডেম কলেজ, ঢাকা",
    quote: "দুর্বার একাডেমির স্পেশাল পাইলট স্ক্রিনিং আইকিউ টেস্ট ও প্রাক্তন স্কোয়াড্রন লিডার মেন্টরদের ১-অন-১ গাইডলাইন আমার বিমান বাহিনী জয়ের মূল ভিত্তি ছিল।",
    score: "আইকিউ স্কোর: ৯৮/১০০",
    badgeColor: "gold",
    imageUrl: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80",
    published: true,
  },
  {
    id: "bma-1",
    name: "ক্যাডেট তৌহিদ হাসান",
    rank: "মেধা স্থান: ০২ (জেন্টলম্যান ক্যাডেট)",
    institution: "বাংলাদেশ মিলিটারি একাডেমি (BMA 91st Long Course)",
    category: "bma",
    program: "BMA Preliminary Officer Cadet Course",
    hscCollege: "ঢাকা কলেজ, ঢাকা",
    quote: "বিএমএ প্রিলিমিনারি লিখিত পরীক্ষা ও ফিজিক্যাল ফিটনেস ড্রিলগুলোতে দুর্বারের সাবেক অফিসার স্যারদের পরামর্শ আমাকে আত্মবিশ্বাসী করেছিল।",
    score: "লিখিত মার্কস: ১৮৫/২০০",
    badgeColor: "emerald",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    published: true,
  },
  {
    id: "issb-1",
    name: "সাবরিনা আক্তার নাবিলা",
    rank: "ISSB গ্রিন কার্ড হোল্ডার (অফিসার)",
    institution: "আইএসএসবি (ISSB 4-Day Green Card Recommendation)",
    category: "issb",
    program: "ISSB Rapid Crash & GTO Leadership Bootcamp",
    hscCollege: "ভিকারুননিসা নূন স্কুল অ্যান্ড কলেজ",
    quote: "আইএসএসবি সাইকোমেট্রিক টেস্ট, পিপিডিটি এবং জিটিও আউটডোর টাক্স প্র্যাকটিসে দুর্বারের সরাসরি সাপোর্ট না পেলে গ্রিন কার্ড পাওয়া সম্ভব হতো না।",
    score: "রেকমেন্ডেশন: সিলেক্টেড",
    badgeColor: "gold",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    published: true,
  },
  {
    id: "bn-1",
    name: "ক্যাডেট আরিফ শাহরিয়ার",
    rank: "মেধা স্থান: ০৩ (মিডশিপম্যান)",
    institution: "বাংলাদেশ নৌবাহিনী (BN 2025-A Officer Cadet)",
    category: "bn",
    program: "BN Officer Cadet Full Preparation",
    hscCollege: "রাজশাহী কলেজ",
    quote: "নৌবাহিনীর নেভাল আইকিউ ড্রিল এবং ভাইভা ফেস করার প্রতিটি ট্রিকস দুর্বার মেন্টরদের লাইভ ইন্টারঅ্যাকশনে পেয়েছিলাম।",
    score: "মেরিট অবস্থান: ৩য়",
    badgeColor: "emerald",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    published: true,
  },
];

export const TESTIMONIALS = INITIAL_SUCCESS_STORIES;
