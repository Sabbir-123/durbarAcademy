export interface SyllabusChapter {
  title: string;
  lectures: number;
  exams: number;
}

export interface Course {
  id: string;
  category: "engineering" | "medical" | "varsity" | "hsc" | "bcs";
  categoryLabel: string;
  title: string;
  tagline: string;
  batchBadge: string;
  discountBadge?: string;
  price: number;
  originalPrice: number;
  seatsRemaining: number;
  totalSeats: number;
  startDate: string;
  duration: string;
  features: string[];
  instructors: string[];
  syllabus: SyllabusChapter[];
  popular?: boolean;
}

export const COURSES: Course[] = [
  {
    id: "eng-buet-target-2025",
    category: "engineering",
    categoryLabel: "ইঞ্জিনিয়ারিং",
    title: "বুয়েট ও সিকেআরইউইটি স্পেশাল অ্যাডমিশন ব্যাচ ২০২৫",
    tagline: "কনসেপ্ট বিল্ডিং, প্রবলেম সলভিং এবং রিটেন মাস্টারি প্রোগ্রাম",
    batchBadge: "লাইভ ব্যাচ ০৪ (ভর্তি চলছে)",
    discountBadge: "৪০% ছাড় (আর্লি বার্ড)",
    price: 9500,
    originalPrice: 16000,
    seatsRemaining: 18,
    totalSeats: 150,
    startDate: "১৫ আগস্ট, ২০২৬",
    duration: "৬ মাস (পরীক্ষার আগের দিন পর্যন্ত)",
    features: [
      "১০০+ লাইভ কনসেপ্ট ও প্রবলেম সলভিং ক্লাস",
      "৫০+ ডেইলি OMR ও সিবিটি অনলাইন এক্সাম",
      "বুয়েটের টপ র‍্যাঙ্কারদের ১-অন-১ ডাউট সলভ",
      "প্রিন্টেড ৪টি কনসেপ্ট বুক ও কোশ্চেন ব্যাংক হোম ডেলিভারি",
      "পার্সোনালাইজড পারফরম্যান্স অ্যানালিটিক্স ড্যাশবোর্ড",
    ],
    instructors: ["ইঞ্জি. তাসনিম আহমেদ (বুয়েট CSE)", "ইঞ্জি. তানভীর হাসান (বুয়েট EEE)"],
    syllabus: [
      { title: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র (ক্যালকুলাস বেসড নিউমেরিক্যাল)", lectures: 30, exams: 15 },
      { title: "উচ্চতর গণিত ১ম ও ২য় পত্র (স্পেশাল শর্টকাট ও ডিপ রিটেন)", lectures: 35, exams: 18 },
      { title: "রসায়ন ১ম ও ২য় পত্র (অর্গানিক ও ফিজিক্যাল মেকানিজম)", lectures: 35, exams: 17 },
    ],
    popular: true,
  },
  {
    id: "medical-mat-mastery-2025",
    category: "medical",
    categoryLabel: "মেডিকেল",
    title: "ডিএমসি টার্গেট মেডিকেল ও ডেন্টাল অ্যাডমিশন প্রোগ্রাম",
    tagline: "হাজারো ইনফরমেটিভ তথ্যের নিখুঁত রিভিশন ও দৈনিক OMR ড্রিল",
    batchBadge: "লাইভ ব্যাচ ০৩",
    discountBadge: "৩৫% ছাড়",
    price: 8900,
    originalPrice: 14000,
    seatsRemaining: 24,
    totalSeats: 200,
    startDate: "২০ আগস্ট, ২০২৬",
    duration: "৫ মাস",
    features: [
      "১২০+ ইন্টারেক্টিভ মেমোরাইজেশন ও কনসেপ্ট ক্লাস",
      "প্রতিদিন ১০০ মার্কসের ওএমআর মোড এক্সাম",
      "মেডিকেল কোয়েশ্চেন ব্যাংক সলভিং সিরিজ",
      "বায়োলজি লাইন-বাই-লাইন ডাইসেকশন শিট",
      "সাপ্তাহিক রিয়েল-টাইম মেরিট লিস্ট প্রকাশ",
    ],
    instructors: ["ড্যা. সাব্বির আহমেদ (ডিএমসি)", "ড্যা. ফারহানা তানজিন (এসএসএমসি)"],
    syllabus: [
      { title: "জীববিজ্ঞান (উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞান লাইন বাই লাইন)", lectures: 40, exams: 20 },
      { title: "রসায়ন (মেডিকেল স্ট্যান্ডার্ড শর্ট কোয়েশ্চেন)", lectures: 30, exams: 15 },
      { title: "পদার্থবিজ্ঞান ও সাধারণ জ্ঞান + ইংরেজি", lectures: 30, exams: 15 },
    ],
    popular: true,
  },
  {
    id: "du-a-unit-masterclass",
    category: "varsity",
    categoryLabel: "ভার্সিটি ক-ইউনিট",
    title: "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট ও জাস্ট/রাবি সাইন্স অ্যাডমিশন",
    tagline: "MCQ স্পিড ট্রিকস এবং রিটেন লিখিত ১০০% কভারেজ",
    batchBadge: "লাইভ ব্যাচ ০৫",
    discountBadge: "৩০% ছাড়",
    price: 7500,
    originalPrice: 11000,
    seatsRemaining: 32,
    totalSeats: 250,
    startDate: "১০ সেপ্টেম্বর, ২০২৬",
    duration: "৫ মাস",
    features: [
      "৯০+ টপিকভিত্তিক কনসেপ্ট ও রিটেন ক্লাস",
      "ঢাবি স্ট্যান্ডার্ড ৪০টি মডেল টেস্ট",
      "নেগেটিভ মার্কিং কমানোর টেকনিক্যাল সেশন",
      "রিটেন খাতা স্পেশাল ম্যানুয়াল ইভালুয়েশন",
    ],
    instructors: ["মেহেদী হাসান (ঢাবি পদার্থ)", "তানজিল আহমেদ (ঢাবি গণিত)"],
    syllabus: [
      { title: "পদার্থবিজ্ঞান লিখিত ও এমসিকিউ", lectures: 25, exams: 10 },
      { title: "রসায়ন লিখিত ও এমসিকিউ", lectures: 25, exams: 10 },
      { title: "উচ্চতর গণিত ও জীববিজ্ঞান", lectures: 40, exams: 20 },
    ],
  },
  {
    id: "hsc-26-academic-foundation",
    category: "hsc",
    categoryLabel: "এইচএসসি একাডেমি",
    title: "এইচএসসি ২০২৬ সাইন্স ফুল সাইকেল (একাডেমিক + অ্যাডমিশন বেস)",
    tagline: "বোর্ড পরীক্ষায় A+ নিশ্চিতকরণের সাথে অ্যাডমিশন প্রি-প্রিপারেশন",
    batchBadge: "নতুন সেশন ২০২৬",
    discountBadge: "৪৫% ছাড়",
    price: 11500,
    originalPrice: 21000,
    seatsRemaining: 40,
    totalSeats: 300,
    startDate: "০১ সেপ্টেম্বর, ২০২৬",
    duration: "১২ মাস",
    features: [
      "পদার্থ, রসায়ন, গণিত, বায়োলজি ও আইসিটি সম্পূর্ণ সিলেবাস",
      "সাপ্তাহিক বোর্ড স্ট্যান্ডার্ড ক্রিয়েটিভ ও সিবিটি টেস্ট",
      "লাইভ ক্লিয়ারিং ক্লাস ও পার্সোনাল গাইডেন্স",
      "প্র্যাকটিক্যাল ও ল্যাব ডেমো ক্লাস",
    ],
    instructors: ["ইঞ্জি. তাসনিম আহমেদ (বুয়েট)", "মেহেদী হাসান (ঢাবি)"],
    syllabus: [
      { title: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র সম্পূর্ণ", lectures: 50, exams: 25 },
      { title: "রসায়ন ১ম ও ২য় পত্র সম্পূর্ণ", lectures: 50, exams: 25 },
      { title: "উচ্চতর গণিত ও জীববিজ্ঞান সম্পূর্ণ", lectures: 60, exams: 30 },
    ],
  },
  {
    id: "bcs-job-prep-prelim",
    category: "bcs",
    categoryLabel: "বিসিএস ও জব",
    title: "৪৭তম বিসিএস প্রিলিমিনারি ও ব্যাংক জব কম্বো ব্যাচ",
    tagline: "বিষয়ভিত্তিক স্মার্ট নোট ও শর্টকাট মেথডে প্রিলিমিনারি প্রস্তুতি",
    batchBadge: "নতুন ব্যাচ ০২",
    price: 6800,
    originalPrice: 9500,
    seatsRemaining: 15,
    totalSeats: 120,
    startDate: "২৫ আগস্ট, ২০২৬",
    duration: "৪ মাস",
    features: [
      "সকল ২০০ মার্কসের টপিকভিত্তিক ক্লাস",
      "দৈনিক ১০ মিনিট কুইজ ও সাপ্তাহিক গ্র্যান্ড টেস্ট",
      "সাম্প্রতিক ঘটনাবলী পিডিফ ম্যাগাজিন",
    ],
    instructors: ["মোঃ আরিফুল ইসলাম (৩৭তম বিসিএস ক্যাডার)"],
    syllabus: [
      { title: "বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী", lectures: 30, exams: 12 },
      { title: "গাণিতিক যুক্তি ও মানসিক দক্ষতা", lectures: 25, exams: 10 },
      { title: "বাংলা ও ইংরেজি ভাষা-সাহিত্য", lectures: 35, exams: 15 },
    ],
  },
];
